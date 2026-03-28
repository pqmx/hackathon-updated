import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BUCKET_NAME = "media-assets";

type AssetRow = {
  id: string;
  storage_path: string;
  file_name: string;
  media_type: "image" | "video";
  mime_type: string | null;
  file_size_bytes: number | null;
};

type SetPayload = {
  saveId: string;
  adCopy: string;
  seoKeywords: string;
  assets: Array<AssetRow & { signed_url: string }>;
};

async function signUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  path: string,
) {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, 60 * 60 * 24); // 24h

  if (error) throw new Error(error.message);
  return data.signedUrl;
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const filterSaveId = url.searchParams.get("saveId") ?? undefined;

  const { data: rows, error } = await supabase
    .from("media_assets")
    .select("id, storage_path, file_name, media_type, mime_type, file_size_bytes")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!rows || rows.length === 0) {
    return NextResponse.json({ sets: [] });
  }

  const grouped = new Map<string, AssetRow[]>();
  rows.forEach((row) => {
    const parts = row.storage_path.split("/");
    const saveId = parts.length >= 2 ? parts[1] : "unknown";
    if (filterSaveId && saveId !== filterSaveId) return;
    if (!grouped.has(saveId)) grouped.set(saveId, []);
    grouped.get(saveId)!.push(row as AssetRow);
  });

  const entries = filterSaveId
    ? Array.from(grouped.entries()).filter(([id]) => id === filterSaveId)
    : Array.from(grouped.entries());

  const sets: SetPayload[] = await Promise.all(
    entries.map(async ([saveId, assets]) => {
      let adCopy = "";
      let seoKeywords = "";

      try {
        const metaPath = `${user.id}/${saveId}/meta.json`;
        const { data: metaBlob, error: metaError } = await supabase.storage
          .from(BUCKET_NAME)
          .download(metaPath);

        if (!metaError && metaBlob) {
          const metaText = await metaBlob.text();
          const parsed = JSON.parse(metaText);
          adCopy = parsed?.adCopy ?? "";
          seoKeywords = parsed?.seoKeywords ?? "";
        } else if (metaError) {
          const msg = metaError.message.toLowerCase();
          if (msg.includes("not found") || msg.includes("bucket")) {
            throw new Error('Storage bucket "media-assets" not found. Create it in Supabase Storage or update BUCKET_NAME.');
          }
        }
      } catch (_) {
        // ignore meta read errors; fall back to empty strings
      }

      const assetsWithUrls = await Promise.all(
        assets.map(async (asset) => ({
          ...asset,
          signed_url: await signUrl(supabase, asset.storage_path),
        })),
      );

      return { saveId, adCopy, seoKeywords, assets: assetsWithUrls };
    }),
  );

  return NextResponse.json({ sets });
}
