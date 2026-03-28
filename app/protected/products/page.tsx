"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, Filter, FolderPlus, Wand2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type CreationMode = "ad" | "photo" | "seo";

type Prompt = {
  id: string;
  title: string;
  mode: CreationMode;
  summary: string;
  status: "draft" | "live" | "archived";
  updated: string;
  tags: string[];
};

const modeLabels: Record<CreationMode, string> = {
  ad: "Ad copy",
  photo: "Photoshoot",
  seo: "SEO keywords",
};

const statusTone: Record<Prompt["status"], string> = {
  draft: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100",
  live: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100",
  archived: "bg-slate-200 text-slate-800 dark:bg-slate-800/60 dark:text-slate-100",
};

const seedPrompts: Prompt[] = [
  {
    id: "pp-1",
    title: "Spring drop hero",
    mode: "ad",
    summary: "Paid social hook + CTA for the new colorway launch.",
    status: "live",
    updated: "2d ago",
    tags: ["facebook", "cta", "seasonal"],
  },
  {
    id: "pp-2",
    title: "Founder portrait shoot",
    mode: "photo",
    summary: "Studio lighting layout and styling notes for the founder profile.",
    status: "draft",
    updated: "5d ago",
    tags: ["studio", "portrait", "lighting"],
  },
  {
    id: "pp-3",
    title: "Kitchen organizer SEO",
    mode: "seo",
    summary: "Long-tail keywords + meta description for the modular organizer.",
    status: "live",
    updated: "1w ago",
    tags: ["intent", "meta", "pdp"],
  },
  {
    id: "pp-4",
    title: "Lookbook hero visuals",
    mode: "photo",
    summary: "Outdoor shot list for the SS drop with motion-friendly framing.",
    status: "live",
    updated: "9d ago",
    tags: ["lookbook", "outdoor", "motion"],
  },
];

export default function ProductsPage() {
  const [activeModes, setActiveModes] = useState<CreationMode[]>(["ad", "photo", "seo"]);

  const toggleMode = (value: CreationMode) => {
    setActiveModes((prev) =>
      prev.includes(value) ? prev.filter((m) => m !== value) : [...prev, value],
    );
  };

  const visiblePrompts = useMemo(
    () => seedPrompts.filter((prompt) => activeModes.includes(prompt.mode)),
    [activeModes],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-gradient-to-r from-primary/10 via-background to-secondary/10 p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Saved prompts</p>
            <h1 className="text-2xl font-semibold">Your product prompts</h1>
            <p className="text-sm text-muted-foreground">
              Browse the briefs you already crafted across ad copy, photoshoots, and SEO.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/protected" className="hidden sm:inline-flex">
              <Button variant="ghost" className="gap-2 rounded-xl border border-border/60">
                <ArrowLeft className="h-4 w-4" />
                Back to canvas
              </Button>
            </Link>
            <Link href="/protected">
              <Button className="gap-2 rounded-xl">
                <FolderPlus className="h-4 w-4" />
                New prompt
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 font-medium">
            <Filter className="h-4 w-4" />
            Filter by mode
          </span>
          {[{ value: "ad", label: "Ad copy" }, { value: "photo", label: "Photoshoot" }, { value: "seo", label: "SEO keywords" }].map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => toggleMode(value as CreationMode)}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition",
                activeModes.includes(value as CreationMode)
                  ? "border-primary/60 bg-primary/10 text-primary shadow-sm"
                  : "border-border/60 bg-background hover:border-primary/40",
              )}
              role="checkbox"
              aria-checked={activeModes.includes(value as CreationMode)}
            >
              <Wand2 className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {visiblePrompts.map((prompt) => (
          <Card key={prompt.id} className="relative overflow-hidden border-border/60">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(147,197,253,0.08),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(192,132,252,0.08),transparent_35%)]" />
            <CardHeader className="relative pb-2">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{prompt.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">{prompt.summary}</CardDescription>
                </div>
                <Badge className={cn("capitalize", statusTone[prompt.status])}>{prompt.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="relative space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary">
                  {modeLabels[prompt.mode]}
                </Badge>
                <span className="rounded-full bg-background px-3 py-1">Updated {prompt.updated}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {prompt.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="rounded-full bg-background/80">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Stored prompt ready to reuse.</span>
                <Link href="/protected" className="text-primary hover:underline">
                  Open in canvas
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}

        {visiblePrompts.length === 0 && (
          <Card className="border-dashed border-border/60 bg-muted/30">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center text-sm text-muted-foreground">
              <p>No prompts match these filters.</p>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setActiveModes(["ad", "photo", "seo"])}>
                  Reset filters
                </Button>
                <Link href="/protected">
                  <Button>Craft a new prompt</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
