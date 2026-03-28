import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY;

function clampDurationSeconds(value: number) {
  if (Number.isNaN(value) || !Number.isFinite(value)) return 30;
  return Math.min(Math.max(Math.round(value), 10), 60);
}

function buildJinglePrompt(productName: string, productDescription: string, tone: string, durationSeconds: number) {
  const safeName = productName?.trim() || "your product";
  const cleanDescription = productDescription?.trim() || "";
  const cleanTone = tone?.trim() || "upbeat and catchy";
  return [
    `Create a ${durationSeconds}-second radio-ready product jingle for ${safeName}.`,
    "Music should be catchy, memorable, and brand-safe.",
    "Include a short lyrical hook that clearly mentions the product name.",
    "Avoid harsh sound effects; keep mix balanced for voice and music.",
    cleanDescription && `Product context: ${cleanDescription}`,
    cleanTone && `Tone: ${cleanTone}`,
  ]
    .filter(Boolean)
    .join(" ");
}

export async function POST(request: Request) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ success: false, error: "GEMINI_API_KEY is not set." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const productName: string = body?.productName ?? "Product";
    const productDescription: string = body?.productDescription ?? "";
    const tone: string = body?.tone ?? "upbeat and catchy";
    const durationInput: number = body?.duration ?? 30;

    if (!productName.trim()) {
      return NextResponse.json({ success: false, error: "productName is required" }, { status: 400 });
    }

    if (!productDescription.trim()) {
      return NextResponse.json({ success: false, error: "productDescription is required" }, { status: 400 });
    }

    const durationSeconds = clampDurationSeconds(durationInput);
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const prompt = buildJinglePrompt(productName, productDescription, tone, durationSeconds);

    const response = await ai.models.generateContent({
      model: "lyria-3-clip-preview",
      contents: prompt,
      config: {
        responseModalities: ["AUDIO", "TEXT"],
        durationSeconds,
      },
    });

    const parts = (response as any)?.candidates?.[0]?.content?.parts ?? [];
    const audioPart = parts.find((part: any) => part?.inlineData);
    const textPart = parts.find((part: any) => part?.text)?.text ?? "";

    const audioBase64: string | null = audioPart?.inlineData?.data ?? null;

    if (!audioBase64) {
      return NextResponse.json({ success: false, error: "Jingle generation did not return audio" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      jingle: {
        audioBase64,
        lyrics: textPart,
        metadata: {
          productName,
          tone,
          duration: durationSeconds,
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate jingle.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
