"use client";

import { notFound } from "next/navigation";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Video } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RemoteAsset = {
  id: string;
  storage_path: string;
  file_name: string;
  media_type: "image" | "video";
  mime_type: string | null;
  signed_url: string;
};

type SavedSet = {
  saveId: string;
  adCopy: string;
  seoKeywords: string;
  assets: RemoteAsset[];
};

export default function SavedSetPage({ params }: { params: Promise<{ saveId: string }> }) {
  const { saveId } = use(params);
  const [setData, setSetData] = useState<SavedSet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/nano-banana/sets?saveId=${encodeURIComponent(saveId)}`);
        if (!res.ok) throw new Error("Failed to load set");
        const data = await res.json();
        const set = data?.sets?.[0];
        if (!mounted) return;
        if (!set) {
          setError("Set not found");
          return;
        }
        setSetData(set);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Unable to load set");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [saveId]);

  if (!loading && (error || !setData)) {
    notFound();
  }

  const videos = setData?.assets.filter((a) => a.media_type === "video") ?? [];
  const images = setData?.assets.filter((a) => a.media_type === "image") ?? [];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <Link href="/protected/products">
          <Button variant="ghost" className="gap-2 rounded-xl border border-border/60">
            <ArrowLeft className="h-4 w-4" />
            Back to sets
          </Button>
        </Link>
        <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary">
          Set {saveId}
        </Badge>
      </div>

      {loading && (
        <Card className="border-border/60">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Loading set…
          </CardContent>
        </Card>
      )}

      {setData && (
        <>
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-lg">Ad copy</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed whitespace-pre-line text-foreground/90">
              {setData.adCopy || "No ad copy saved."}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-lg">SEO keywords</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-foreground/90">
              {setData.seoKeywords || "No SEO keywords saved."}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-lg">Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {videos.length === 0 && images.length === 0 && (
                <p className="text-sm text-muted-foreground">No media saved for this set.</p>
              )}

              {videos.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                    <Video className="h-3 w-3" /> Video
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {videos.map((video) => (
                      <div key={video.id} className="overflow-hidden rounded-lg border border-border/60 bg-black">
                        <video src={video.signed_url} controls playsInline className="h-full w-full object-cover" />
                        <div className="flex items-center justify-between px-2 py-1 text-[11px] text-white/80">
                          <span className="truncate">{video.file_name}</span>
                          <a href={video.signed_url} target="_blank" rel="noreferrer" className="font-semibold text-primary hover:underline">
                            Open
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {images.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Images</div>
                  <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {images.map((image) => (
                      <div key={image.id} className="overflow-hidden rounded-lg border border-border/60 bg-background">
                        <img src={image.signed_url} alt={image.file_name} className="h-full w-full object-cover" />
                        <div className="flex items-center justify-between px-2 py-1 text-[11px] text-muted-foreground">
                          <span className="truncate">{image.file_name}</span>
                          <a href={image.signed_url} target="_blank" rel="noreferrer" className="font-semibold text-primary hover:underline">
                            Open
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
