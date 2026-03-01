import { GoogleGenAI } from "@google/genai";

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
  const apiKey = process.env.GEMINI_API_KEY || "";
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Fetch the current data for Baja, Hungary for today (2026-03-01):
  - Current temperature in Celsius
  - Current wind speed in km/h
  - Current Danube (Duna) water level at Baja in cm (from hydroinfo.hu or similar)
  - Sunrise time (HH:mm)
  - Sunset time (HH:mm)
  - Moonrise time (HH:mm)
  - Moonset time (HH:mm)
  - Current moon phase in Hungarian (e.g., Telihold, Újhold, Első negyed, etc.)
  - Date of the next full moon (Következő telihold dátuma)
  
  Return ONLY a strict JSON object with these exact keys: 
  temperature, windSpeed, waterLevel, sunrise, sunset, moonrise, moonset, moonPhase, nextFullMoon.
  Do not include any markdown formatting or code blocks. Just the raw JSON string.
  Ensure all values are strings. If a specific value is absolutely unavailable, use "Nincs adat".
  Use your search tool to find the most recent and accurate values.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    // Clean the response (remove potential markdown code blocks)
    const text = response.text || "{}";
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const data = JSON.parse(cleanJson);
    return {
      ...data,
      lastUpdated: new Date().toLocaleTimeString('hu-HU'),
    };
  } catch (error: any) {
    console.error("Error fetching Baja data:", error);
    if (error?.message?.includes("429") || error?.message?.includes("quota")) {
      throw new Error("KVÓTA_HIBA: A Google mára letiltotta a keresést ehhez a kulcshoz.");
    }
    throw error;
  }
}
