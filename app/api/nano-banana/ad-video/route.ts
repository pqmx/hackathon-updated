import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function buildVideoPrompt(adText: string, productName: string) {
  const cleanText = adText?.trim() || "High-conversion ad for the product.";
  const safeProduct = productName?.trim() || "the product";
  return [
    `Create a 30-second, energetic product ad video for ${safeProduct}.`,
    "Use a vertical 9:16 format, crisp lighting, and clear focal framing.",
    "Prioritize pacing that matches social feed swipes (fast hook, product showcase, CTA).",
    "Base visuals on this ad copy: ",
    cleanText,
  ].join(" ");
}

export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not set." }, { status: 500 });
  }

  try {
    const { adText = "", productName = "Nano Banana product" } = await request.json();

    if (!adText.trim()) {
      return NextResponse.json({ error: "adText is required" }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = buildVideoPrompt(adText, productName);

    let operation: any = await ai.models.generateVideos({
      model: "veo-3.1-generate-preview",
      prompt,
      config: {
        aspectRatio: "9:16",
        resolution: "1080p",
        durationSeconds: 30,
      },
    });

    let attempts = 0;
    const maxAttempts = 6; // ~60s max wait

    while (!operation?.done && attempts < maxAttempts) {
      await wait(10000);
      operation = await ai.operations.getVideosOperation({ operation });
      attempts += 1;
    }

    const videoFile = operation?.response?.generatedVideos?.[0]?.video ?? null;
    const videoUri: string | null = null; // Library does not expose a getFile helper; return file id for client follow-up.

    return NextResponse.json({
      status: operation?.done ? "ready" : "pending",
      videoFile,
      videoUri,
      prompt,
      attempts,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate ad video." }, { status: 500 });
  }
}
