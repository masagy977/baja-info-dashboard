import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface BajaData {
  temperature: string;
  windSpeed: string;
  waterLevel: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  moonPhase: string;
  nextFullMoon: string;
  lastUpdated: string;
}

export async function fetchBajaData(): Promise<BajaData> {
  const prompt = `Fetch the current data for Baja, Hungary for today (2026-02-28):
  - Current temperature in Celsius
  - Current wind speed in km/h
  - Current Danube (Duna) water level at Baja in cm (from hydroinfo.hu or similar)
  - Sunrise time (HH:mm)
  - Sunset time (HH:mm)
  - Moonrise time (HH:mm)
  - Moonset time (HH:mm)
  - Current moon phase in Hungarian (e.g., Telihold, Újhold, Első negyed, etc.)
  - Date of the next full moon (Következő telihold dátuma)
  
  Return the data in a strict JSON format with these exact keys: 
  temperature, windSpeed, waterLevel, sunrise, sunset, moonrise, moonset, moonPhase, nextFullMoon.
  Ensure all values are strings. If a specific value is absolutely unavailable, use "Nincs adat".
  Use your search tool to find the most recent and accurate values.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });

    const data = JSON.parse(response.text || "{}");
    return {
      ...data,
      lastUpdated: new Date().toLocaleTimeString('hu-HU'),
    };
  } catch (error) {
    console.error("Error fetching Baja data:", error);
    throw error;
  }
}
