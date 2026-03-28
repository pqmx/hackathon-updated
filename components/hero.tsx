"use client";

import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Sparkles, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/15 via-background to-secondary/20 p-8 shadow-2xl backdrop-blur-xl lg:p-10">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(94,234,212,0.25),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(196,181,253,0.24),transparent_38%),radial-gradient(circle_at_30%_90%,rgba(96,165,250,0.22),transparent_32%)]"
        aria-hidden
      />
      <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr,0.95fr]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4 text-primary" />
            Aurora workspace
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight lg:text-5xl">
              Ship polished, AI-ready product surfaces without the default look.
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              A reimagined Next.js + Supabase experience with glassmorphic surfaces, live chat canvas, and auth-aware flows ready for your data.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-xl px-5">
              <Link href="/protected">Open protected chat</Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="rounded-xl px-5">
              <a
                href="https://supabase.com/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2"
              >
                Supabase console
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1">
              <ShieldCheck className="h-4 w-4 text-primary" /> Auth guard wired in
            </span>
            <span className="flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1">
              <Zap className="h-4 w-4 text-primary" /> Drop-in UI kit
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-primary/15 via-background to-secondary/20 blur-2xl" aria-hidden />
          <div className="relative overflow-hidden rounded-[28px] border border-border/60 bg-card/70 shadow-2xl backdrop-blur-xl">
            <div className="grid gap-4 p-6">
              <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Environment</p>
                  <p className="text-sm font-semibold">Ready to deploy</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">Live</span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {["Auth", "Storage", "Edge", "Realtime"].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item}</span>
                      <span className="text-[11px] text-muted-foreground">Ready</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-muted">
                      <div className="h-2 w-4/5 rounded-full bg-gradient-to-r from-primary to-secondary" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                Bring your API key, swap the mock chat handler, and push. The UI stays luxe while you wire the brains.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
