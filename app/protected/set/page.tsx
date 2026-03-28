"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SavedAsset = {
  id: string;
  storage_path: string;
  file_name: string;
  media_type: "image" | "video" | "audio";
  mime_type: string | null;
  file_size_bytes: number | null;
  signed_url: string;
};

type SavedSet = {
  saveId: string;
  adCopy: string;
  seoKeywords: string;
  adAudioText?: string;
  assets: SavedAsset[];
};

export default function SavedSetPage() {
  const [sets, setSets] = useState<SavedSet[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const rawList = localStorage.getItem("nano-saved-sets");
      if (rawList) {
        const parsed = JSON.parse(rawList) as SavedSet[];
        if (Array.isArray(parsed) && parsed.length) {
          setSets(parsed);
          setSelectedId(parsed[0]?.saveId ?? null);
          return;
        }
      }
      const rawSingle = localStorage.getItem("nano-saved-set");
      if (rawSingle) {
        const parsedSingle = JSON.parse(rawSingle) as SavedSet;
        setSets([parsedSingle]);
        setSelectedId(parsedSingle.saveId);
      }
    } catch (_) {
      // ignore parse failures
    }
  }, []);

  const selected = useMemo(() => {
    if (!sets.length) return null;
    if (!selectedId) return sets[0];
    return sets.find((set) => set.saveId === selectedId) ?? sets[0];
  }, [selectedId, sets]);

  return (
    <div className="flex-1 w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">Saved output</p>
          <h1 className="text-2xl font-semibold">Your product set</h1>
          <p className="text-sm text-muted-foreground">Last set you saved from the creative board, including media and copy.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/protected">
            <Button variant="ghost" className="gap-2 rounded-xl border border-border/60" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Back to board
            </Button>
          </Link>
        </div>
      </div>

      {!selected && (
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>No saved set found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Save a set from the creative board to view it here.</p>
            <Link href="/protected">
              <Button variant="secondary" size="sm">Go to creative board</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {selected && (
        <div className="grid gap-4 lg:grid-cols-4">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-sm">Saved sets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {sets.map((set) => (
                <button
                  key={set.saveId}
                  type="button"
                  onClick={() => setSelectedId(set.saveId)}
                  className={cn(
                    "w-full rounded-lg border px-3 py-2 text-left transition",
                    set.saveId === selected.saveId
                      ? "border-primary/60 bg-primary/10 text-primary"
                      : "border-border/60 bg-background hover:border-primary/40",
                  )}
                >
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wide">
                    <span className="font-semibold">Set</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{set.saveId}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{set.adCopy || "No ad copy"}</p>
                  <div className="mt-1 text-[11px] text-muted-foreground">Assets: {set.assets.length}</div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-sm">
                <span>Media</span>
                <span className="font-mono text-[11px] text-muted-foreground">{selected.saveId}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                {selected.assets
                  .filter((asset) => asset.media_type === "video")
                  .map((asset) => (
                    <div key={asset.id} className="rounded-xl border border-border/60 bg-black/60 p-3 shadow-lg">
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-foreground">
                        <span>Video</span>
                        <span className="truncate text-[10px] text-primary/80">{asset.file_name}</span>
                      </div>
                      <div className="relative mt-2 aspect-[9/16] overflow-hidden rounded-lg border border-border/40 bg-black">
                        <video src={asset.signed_url} controls playsInline className="h-full w-full object-cover" />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-primary/80">
                        <span className="truncate">{asset.file_name}</span>
                        <a href={asset.signed_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold hover:underline">
                          Open <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ))}

                {selected.assets
                  .filter((asset) => asset.media_type === "audio")
                  .map((asset) => (
                    <div key={asset.id} className="rounded-xl border border-border/60 bg-background p-3 shadow-lg">
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-muted-foreground">
                        <span>Audio</span>
                        <span className="truncate text-[10px] text-primary/80">{asset.file_name}</span>
                      </div>
                      <audio className="mt-2 w-full" controls src={asset.signed_url} />
                      {selected.adAudioText && (
                        <p className="mt-2 text-xs text-muted-foreground">{selected.adAudioText}</p>
                      )}
                      <div className="mt-2 flex items-center justify-between text-[11px] text-primary/80">
                        <span className="truncate">{asset.file_name}</span>
                        <a href={asset.signed_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold hover:underline">
                          Open <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {selected.assets
                  .filter((asset) => asset.media_type === "image")
                  .map((asset) => (
                    <div key={asset.id} className="rounded-xl border border-border/60 bg-background/80 p-2 shadow">
                      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Image</div>
                      <div className="mt-2 overflow-hidden rounded-lg border border-border/40 bg-background">
                        <img src={asset.signed_url} alt={asset.file_name} className="h-auto w-full object-cover" />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-primary/80">
                        <span className="truncate">{asset.file_name}</span>
                        <a href={asset.signed_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold hover:underline">
                          Open <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm">Copy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Ad draft</p>
                <p className="mt-1 whitespace-pre-wrap rounded-lg border border-border/60 bg-background/80 p-3 leading-relaxed">{selected.adCopy || "No ad copy"}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">SEO keywords</p>
                <p className="mt-1 whitespace-pre-wrap rounded-lg border border-border/60 bg-background/80 p-3 leading-relaxed">{selected.seoKeywords || "No SEO keywords"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
