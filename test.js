import { GoogleGenAI } from "@google/genai";

// Next.js automatically loads variables from .env.local into process.env
const ai = new GoogleGenAI({
  api_key: process.env.GOOGLE_API_KEY 
});

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Explain how AI works in a few words",
  });
  console.log(response.text);
}

main();

