import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BUCKET_NAME = "media-assets";

type AssetRow = {
  id: string;
  storage_path: string;
  file_name: string;
  media_type: "audio";
  mime_type: string | null;
  file_size_bytes: number | null;
};

async function uploadAudio(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  file: File,
  saveId: string,
) {
  const fileName = file.name || `jingle-${Date.now()}.mp3`;
  const storagePath = `${userId}/${saveId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, file, {
      contentType: file.type || "audio/mpeg",
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    const message = uploadError.message;
    if (message.toLowerCase().includes("not found") || message.toLowerCase().includes("bucket")) {
      throw new Error('Storage bucket "media-assets" not found. Create it in Supabase Storage or update BUCKET_NAME.');
    }
    throw new Error(message);
  }

  const { data: inserted, error: insertError } = await supabase
    .from("media_assets")
    .insert({
      owner_id: userId,
      storage_path: storagePath,
      file_name: fileName,
      media_type: "audio",
      mime_type: file.type || "audio/mpeg",
      file_size_bytes: file.size ?? null,
    })
    .select()
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }

  return inserted as AssetRow;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const audio = formData.get("audio");
  const lyrics = formData.get("lyrics")?.toString() ?? "";
  const productName = formData.get("productName")?.toString() ?? "";
  const tone = formData.get("tone")?.toString() ?? "";
  const duration = formData.get("duration")?.toString() ?? "";
  const saveId = `${Date.now()}`;

  if (!(audio instanceof File)) {
    return NextResponse.json({ error: "Audio file is required." }, { status: 400 });
  }

  try {
    const audioRow = await uploadAudio(supabase, user.id, audio, saveId);

    const meta = {
      saveId,
      productName,
      tone,
      duration,
      lyrics,
      type: "jingle",
      assets: [
        {
          id: audioRow.id,
          storage_path: audioRow.storage_path,
          file_name: audioRow.file_name,
          media_type: audioRow.media_type,
          mime_type: audioRow.mime_type,
          file_size_bytes: audioRow.file_size_bytes,
        },
      ],
      createdAt: new Date().toISOString(),
    };

    const { error: metaError } = await supabase.storage.from(BUCKET_NAME).upload(
      `${user.id}/${saveId}/meta.json`,
      new Blob([JSON.stringify(meta)], { type: "application/json" }),
      { upsert: true, cacheControl: "60" },
    );

    if (metaError) {
      const message = metaError.message;
      if (message.toLowerCase().includes("not found") || message.toLowerCase().includes("bucket")) {
        throw new Error('Storage bucket "media-assets" not found. Create it in Supabase Storage or update BUCKET_NAME.');
      }
      throw new Error(message);
    }

    return NextResponse.json({ saveId, asset: audioRow });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save jingle.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
