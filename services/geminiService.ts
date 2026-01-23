
import { GoogleGenAI } from "@google/genai";
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
