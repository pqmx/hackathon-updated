import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BUCKET_NAME = "media-assets";

type AssetRow = {
  id: string;
  storage_path: string;
  file_name: string;
  media_type: "image" | "video" | "audio";
  mime_type: string | null;
  file_size_bytes: number | null;
};

async function signPublicUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  path: string,
) {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, 60 * 60 * 24); // 24h signed URL

  if (error) throw new Error(error.message);
  return data.signedUrl;
}

async function uploadAsset(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  file: File,
  mediaType: "image" | "video" | "audio",
  saveId: string,
) {
  const fileName = file.name || `${mediaType}-${Date.now()}`;
  const storagePath = `${userId}/${saveId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, file, {
      contentType: file.type || undefined,
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
      media_type: mediaType,
      mime_type: file.type || null,
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
  const adCopy = formData.get("adCopy")?.toString() ?? "";
  const seoKeywords = formData.get("seoKeywords")?.toString() ?? "";
  const adAudioText = formData.get("adAudioText")?.toString() ?? "";
  const singleImage = formData.get("image");
  const images = formData.getAll("images");
  const video = formData.get("video");
  const audio = formData.get("audio");

  const saveId = `${Date.now()}`;

  if (images.length === 0 && !singleImage && !video && !(audio instanceof File)) {
    return NextResponse.json({ error: "Image, video, or audio is required." }, { status: 400 });
  }

  try {
    const uploads: AssetRow[] = [];

    const imageFiles: File[] = [];
    images.forEach((entry) => {
      if (entry instanceof File) imageFiles.push(entry);
    });
    if (singleImage instanceof File) {
      imageFiles.push(singleImage);
    }

    for (const image of imageFiles) {
      const asset = await uploadAsset(supabase, user.id, image, "image", saveId);
      uploads.push(asset);
    }

    if (video instanceof File) {
      const asset = await uploadAsset(supabase, user.id, video, "video", saveId);
      uploads.push(asset);
    }

    if (audio instanceof File) {
      const asset = await uploadAsset(supabase, user.id, audio, "audio", saveId);
      uploads.push(asset);
    }

    // Store metadata for this set as JSON alongside the assets for discoverability.
    const metadata = {
      saveId,
      adCopy,
      seoKeywords,
      adAudioText,
      assets: uploads.map((asset) => ({
        id: asset.id,
        storage_path: asset.storage_path,
        file_name: asset.file_name,
        media_type: asset.media_type,
        mime_type: asset.mime_type,
        file_size_bytes: asset.file_size_bytes,
      })),
      createdAt: new Date().toISOString(),
    };

    // Upload metadata JSON (no DB row because media assets are already stored per file).
    const { error: metaError } = await supabase.storage.from(BUCKET_NAME).upload(
      `${user.id}/${saveId}/meta.json`,
      new Blob([JSON.stringify(metadata)], { type: "application/json" }),
      { upsert: true, cacheControl: "60" },
    );

    if (metaError) {
      const message = metaError.message;
      if (message.toLowerCase().includes("not found") || message.toLowerCase().includes("bucket")) {
        throw new Error('Storage bucket "media-assets" not found. Create it in Supabase Storage or update BUCKET_NAME.');
      }
      throw new Error(message);
    }

    // Return signed URLs for immediate viewing.
    const assetsWithUrls = await Promise.all(
      uploads.map(async (asset) => ({
        ...asset,
        signed_url: await signPublicUrl(supabase, asset.storage_path),
      })),
    );

    return NextResponse.json({ saveId, adCopy, seoKeywords, assets: assetsWithUrls });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save media.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
