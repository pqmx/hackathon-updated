"use client";

import { useMemo, useState } from "react";
import { Plus, Sparkles, Tag, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function makeId() {
  const rand = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${time}-${rand}`;
}

interface Product {
  id: string;
  name: string;
  price: number;
  status: "draft" | "live" | "archived";
  note: string;
}

const statusColors: Record<Product["status"], string> = {
  draft: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-100",
  live: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100",
  archived: "bg-slate-200 text-slate-800 dark:bg-slate-800/60 dark:text-slate-100",
};

export function ProductPanel() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<Product["status"]>("draft");
  const [products, setProducts] = useState<Product[]>([
    {
      id: makeId(),
      name: "Starter Plan",
      price: 29,
      status: "live",
      note: "Baseline plan hooked to Supabase auth",
    },
    {
      id: makeId(),
      name: "Pro Tier",
      price: 79,
      status: "draft",
      note: "Add usage-based limits and credits",
    },
  ]);

  const mrr = useMemo(() => {
    return products
      .filter((item) => item.status === "live")
      .reduce((sum, item) => sum + item.price, 0);
  }, [products]);

  const handleAdd = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    const newProduct: Product = {
      id: makeId(),
      name: trimmed,
      price: Number(price) || 0,
      status,
      note: note.trim() || "No notes yet",
    };

    setProducts((prev) => [newProduct, ...prev]);
    setName("");
    setPrice("");
    setNote("");
    setStatus("draft");
  };

  return (
    <div className="space-y-4">
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-lg">Product board</CardTitle>
              <CardDescription>Capture offers and track their launch state.</CardDescription>
            </div>
            <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Sparkles className="mr-1 inline h-3.5 w-3.5 text-primary" />
              New
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid gap-3">
              <div className="grid gap-2">
                <label className="text-xs uppercase tracking-wide text-muted-foreground">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Growth Plan"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs uppercase tracking-wide text-muted-foreground">Price (monthly)</label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="49"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs uppercase tracking-wide text-muted-foreground">Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {["draft", "live", "archived"].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setStatus(value as Product["status"])}
                      className={`rounded-lg border px-3 py-2 text-sm capitalize transition hover:border-primary/50 ${
                        status === value
                          ? "border-primary/60 bg-primary/10 text-primary"
                          : "border-border/70 bg-background"
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-xs uppercase tracking-wide text-muted-foreground">Notes</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What makes this offer special"
                  className="min-h-[96px] rounded-lg border border-border/70 bg-background px-3 py-2 text-sm outline-none transition focus:border-primary/40 focus:ring-1 focus:ring-primary/30"
                />
              </div>
            </div>
            <Button type="submit" className="w-full rounded-xl" disabled={!name.trim()}>
              <Plus className="h-4 w-4" />
              Add product
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Pipeline</CardTitle>
          <CardDescription className="text-muted-foreground">Recent products and their state.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="rounded-2xl border border-border/60 bg-background/60 p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.note}</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Tag className="h-4 w-4 text-primary" />
                  ${product.price.toFixed(2)} / mo
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span
                  className={`rounded-full px-3 py-1 font-medium ${statusColors[product.status]}`}
                >
                  {product.status}
                </span>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span>MRR impact</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">MRR snapshot</CardTitle>
          <CardDescription className="text-muted-foreground">Live products total.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/60 px-4 py-3 text-sm">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Active MRR</p>
            <p className="text-2xl font-semibold">${mrr.toFixed(2)}</p>
          </div>
          <div className="rounded-full border border-border/60 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Based on live plans
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProductPanel;
