import { GoogleGenAI, Type } from "@google/genai";
import { MissionPhase, TelemetryData } from "../types";

// Initialize AI dynamically to ensure the most current process.env.API_KEY is used
const getAIInstance = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API: Mission Control API_KEY missing from environment.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const getMissionBriefing = async (phase: MissionPhase, telemetry: TelemetryData) => {
  const ai = getAIInstance();
  if (!ai) return "Status nominal. Telemetry stream stable.";

  try {
    const prompt = `You are a NASA flight controller for Artemis II. 
    Current Mission Phase: ${phase}.
    Telemetry: Altitude ${telemetry.altitude.toFixed(2)}km, Velocity ${telemetry.velocity.toFixed(2)}km/h, Heart Rate ${telemetry.heartRate.toFixed(0)}bpm.
    
    Provide a brief, 2-sentence formal mission briefing for the command center log. Use professional astronautical terminology.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });

    return response.text || "Status nominal. Monitoring systems.";
  } catch (error) {
    console.error("Gemini Briefing Error:", error);
    return "Telemetry link stable. Continuing observation.";
  }
};

/**
 * Extracts JSON from markdown code blocks or raw strings
 */
const extractJson = (text: string) => {
  if (!text) return "";
  try {
    const regex = /\{[\s\S]*\}|\[[\s\S]*\]/;
    const match = text.match(regex);
    return match ? match[0] : text;
  } catch (e) {
    return text;
  }
};

// Simple In-Memory Cache to prevent 429 Quota Exhaustion
let newsCache: { data: any[], timestamp: number } | null = null;
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes cache for search-based news

export const getLatestNASANews = async () => {
  // Return cached data if still valid
  if (newsCache && (Date.now() - newsCache.timestamp < CACHE_DURATION_MS)) {
    return newsCache.data;
  }

  const ai = getAIInstance();
  if (!ai) return [];

  try {
    const prompt = "Retrieve the 5 most recent official mission updates for NASA's Artemis II. Focus on technical milestones, launch preparations, or crew activities from 2024 and 2025. Return a clean list of updates.";

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            updates: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timestamp: { type: Type.STRING, description: "Date/Time of update (e.g., 'Feb 2025')" },
                  content: { type: Type.STRING, description: "Official mission update text" }
                },
                required: ["timestamp", "content"]
              }
            }
          },
          required: ["updates"]
        }
      }
    });

    const textOutput = response.text || "";
    const jsonStr = extractJson(textOutput);
    if (!jsonStr) return newsCache?.data || [];

    const parsed = JSON.parse(jsonStr);
    const updates = parsed.updates || [];
    
    // Update cache
    newsCache = { data: updates, timestamp: Date.now() };
    
    return updates;
  } catch (error: any) {
    console.error("Gemini News Error:", error);
    
    // If rate limited, return cached data if available
    if (error?.message?.includes('429') || error?.status === 'RESOURCE_EXHAUSTED') {
      console.warn("Gemini API: Rate limited. Serving cached data.");
      if (newsCache) return newsCache.data;
      throw new Error("RATE_LIMIT");
    }
    
    return newsCache?.data || [];
  }
};
