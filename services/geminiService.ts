import { GoogleGenAI, Type, Schema } from "@google/genai";
import { IdentificationResult } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for the structured output
const identificationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    people: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: "The full name of the famous person identified.",
          },
          box_2d: {
            type: Type.ARRAY,
            items: { type: Type.INTEGER },
            description: "The bounding box of the person's face/body in the format [ymin, xmin, ymax, xmax] using a 0-1000 scale.",
          },
        },
        required: ["name", "box_2d"],
      },
    },
  },
  required: ["people"],
};

export const identifyPeopleInImage = async (base64Image: string, mimeType: string): Promise<IdentificationResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: "Identify the 8 distinct famous tech leaders/CEOs in this image. For each person, provide their name and a precise bounding box around them.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: identificationSchema,
        temperature: 0.4, // Lower temperature for more deterministic factual grounding
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text returned from Gemini.");
    }

    const result = JSON.parse(text) as IdentificationResult;
    return result;
  } catch (error) {
    console.error("Error identifying people:", error);
    throw error;
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = error => reject(error);
  });
};