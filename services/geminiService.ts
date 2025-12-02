import { GoogleGenAI, Type } from "@google/genai";
import { DimensionSuggestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSuggestedDimensions = async (query: string): Promise<DimensionSuggestion> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Sugiere el mejor ancho (width) y alto (height) de imagen para esta plataforma o caso de uso: "${query}". 
      Devuelve dimensiones estándar (píxeles) usadas en 2024/2025.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            width: { type: Type.INTEGER, description: "Ancho recomendado en píxeles" },
            height: { type: Type.INTEGER, description: "Alto recomendado en píxeles" },
            reasoning: { type: Type.STRING, description: "Explicación breve en español (máx 10 palabras)" },
          },
          required: ["width", "height", "reasoning"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as DimensionSuggestion;
    }
    throw new Error("No se devolvió ninguna sugerencia");
  } catch (error) {
    console.error("Gemini Error:", error);
    // Fallback or rethrow
    throw error;
  }
};