import * as fs from "node:fs";
import ai from "./client";

async function continuousChat() {
  // 1. Initialize the chat session
  const chat = ai.chats.create({
    model: "gemini-3.1-flash-image-preview",
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
      tools: [{ googleSearch: {} }],
    },
  });

  // Turn 1: Initial Generation
  const firstMessage = "Create a vibrant infographic about photosynthesis.";
  let response = await chat.sendMessage({ message: firstMessage });
  saveImage(response, "photosynthesis_v1.png");

  // Turn 2: Follow-up Edit (The "Continuous" Part)
  // You just use the same 'chat' instance. The model knows which image to edit.
  const secondMessage = "Update this infographic to be in Spanish. Do not change anything else.";
  let secondResponse = await chat.sendMessage({ message: secondMessage });
  saveImage(secondResponse, "photosynthesis_v2.png");
}

// Helper function to handle the parts array
function saveImage(response, fileName) {
  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const buffer = Buffer.from(part.inlineData.data, "base64");
      fs.writeFileSync(fileName, buffer);
      console.log(`Image saved as ${fileName}`);
    }
  }
}

continuousChat();