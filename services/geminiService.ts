import { GoogleGenAI, Type } from "@google/genai";
import { MissionPhase, TelemetryData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMissionBriefing = async (phase: MissionPhase, telemetry: TelemetryData) => {
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

export const getLatestNASANews = async () => {
  try {
    const prompt = "Search for the most recent official Artemis II mission updates exclusively from NASA. Provide a list of updates. Each update should include a brief timestamp/date if available and the update text itself.";

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
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

    return JSON.parse(response.text).updates;
  } catch (error) {
    console.error("Gemini News Error:", error);
    return [];
  }
};