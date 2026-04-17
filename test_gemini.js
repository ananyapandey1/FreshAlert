import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

console.log("Key:", process.env.GEMINI_API_KEY ? "Loaded" : "Missing");

async function test() {
  try {
    const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);
    console.log("Attempting generateContent using ai.models.generateContent script...");
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        role: "user",
        parts: [{ text: "Explain what you are in one sentence." }]
      }]
    });
    console.log("Success:", JSON.stringify(response, null, 2));
  } catch (e) {
    console.error("Error:", e.message || e);
  }
}

test();
