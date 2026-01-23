import { GoogleGenAI, Type } from "@google/genai";
import { MissionPhase, TelemetryData } from "../types";

// Robust API Key retrieval
const getApiKey = () => {
  try {
    return process.env.API_KEY || '';
  } catch (e) {
    return '';
  }
};

const API_KEY = getApiKey();

// Initialize AI lazily to avoid top-level crashes if process is weird
const getAI = () => {
  if (!API_KEY) {
    console.warn("Gemini API: Mission Control is running in offline mode (API_KEY missing).");
    return null;
  }
  return new GoogleGenAI({ apiKey: API_KEY });
};

export const getMissionBriefing = async (phase: MissionPhase, telemetry: TelemetryData) => {
  const ai = getAI();
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
    // Look for JSON block
    const regex = /\{[\s\S]*\}|\[[\s\S]*\]/;
    const match = text.match(regex);
    return match ? match[0] : text;
  } catch (e) {
    return text;
  }
};

export const getLatestNASANews = async () => {
  const ai = getAI();
  if (!ai) return [];

  try {
    const prompt = "Search for the most recent official Artemis II mission updates exclusively from NASA. Provide a list of updates. Each update should include a brief timestamp/date if available and the update text itself.";

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            updates: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timestamp: { type: Type.STRING, description: "Date or time of the update" },
                  content: { type: Type.STRING, description: "The text content of the mission update" }
                },
                required: ["timestamp", "content"]
              }
            }
          },
          required: ["updates"]
        }
      }
    });

    // Fix for TS2345: ensures extractJson receives a string, not string | undefined
    const jsonStr = extractJson(response.text || "");
    if (!jsonStr) return [];

    const parsed = JSON.parse(jsonStr);
    return parsed.updates || [];
  } catch (error) {
    console.error("Gemini News Error:", error);
    return [];
  }
};
