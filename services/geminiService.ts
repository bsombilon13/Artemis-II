import { GoogleGenAI, Type } from "@google/genai";
import { MissionPhase, TelemetryData } from "../types";

// Realistic fallback data for Artemis II to ensure UI stability during rate limits
const MISSION_FALLBACK_UPDATES = [
  { timestamp: "Feb 2025", content: "Core Stage RS-25 engine flight readiness reviews completed at Stennis Space Center." },
  { timestamp: "Jan 2025", content: "Orion spacecraft vacuum chamber testing successfully concluded; life support systems nominal." },
  { timestamp: "Dec 2024", content: "Ground Systems team completes Mobile Launcher 1 umbilical swing-arm retraction tests at LC-39B." },
  { timestamp: "Nov 2024", content: "Artemis II crew (Wiseman, Glover, Koch, Hansen) completes geology training and splashdown recovery drills." },
  { timestamp: "Oct 2024", content: "SLS Solid Rocket Booster segments arrived at Kennedy Space Center for stack integration." }
];

// Singleton to prevent concurrent identical requests
let activeNewsRequest: Promise<any[]> | null = null;
let newsCache: { data: any[], timestamp: number } | null = null;
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const ERROR_COOLDOWN_MS = 60 * 1000; // Wait 1 minute before retrying after an error
let lastErrorTime = 0;

const getAIInstance = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const getMissionBriefing = async (phase: MissionPhase, telemetry: TelemetryData) => {
  const ai = getAIInstance();
  if (!ai) return "Status nominal. Telemetry stream stable.";

  try {
    const prompt = `You are a NASA flight controller for Artemis II. 
    Current Mission Phase: ${phase}.
    Telemetry: Altitude ${telemetry.altitude.toFixed(2)}km, Velocity ${telemetry.velocity.toFixed(2)}km/h.
    Provide a 1-sentence formal mission briefing. Use professional terminology.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { temperature: 0.5, topP: 0.8 }
    });

    return response.text || "Status nominal. Monitoring systems.";
  } catch (error) {
    return "Telemetry link stable. Continuing observation.";
  }
};

const extractJson = (text: string) => {
  try {
    const regex = /\{[\s\S]*\}|\[[\s\S]*\]/;
    const match = text.match(regex);
    return match ? match[0] : text;
  } catch (e) {
    return text;
  }
};

export const getLatestNASANews = async () => {
  // 1. Check Cache First
  if (newsCache && (Date.now() - newsCache.timestamp < CACHE_DURATION_MS)) {
    return newsCache.data;
  }

  // 2. Check for active request (deduplication)
  if (activeNewsRequest) {
    return activeNewsRequest;
  }

  // 3. Check for recent error cooldown
  if (Date.now() - lastErrorTime < ERROR_COOLDOWN_MS) {
    console.warn("Gemini API: Under error cooldown. Serving cache/fallback.");
    return newsCache?.data || MISSION_FALLBACK_UPDATES;
  }

  activeNewsRequest = (async () => {
    const ai = getAIInstance();
    if (!ai) return MISSION_FALLBACK_UPDATES;

    try {
      const prompt = "Retrieve the 5 most recent official mission updates for NASA's Artemis II (2024-2025). Return as JSON list with 'timestamp' and 'content'.";

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
                    timestamp: { type: Type.STRING },
                    content: { type: Type.STRING }
                  },
                  required: ["timestamp", "content"]
                }
              }
            },
            required: ["updates"]
          }
        }
      });

      const jsonStr = extractJson(response.text || "");
      const parsed = JSON.parse(jsonStr);
      const updates = parsed.updates || MISSION_FALLBACK_UPDATES;
      
      newsCache = { data: updates, timestamp: Date.now() };
      return updates;
    } catch (error: any) {
      console.error("Gemini API Error:", error.status || "Unknown");
      lastErrorTime = Date.now();
      
      // On error, return cache if available, else hard fallbacks
      return newsCache?.data || MISSION_FALLBACK_UPDATES;
    } finally {
      activeNewsRequest = null;
    }
  })();

  return activeNewsRequest;
};