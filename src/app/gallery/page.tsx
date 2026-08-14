"use client";

import { Header } from "@/components/header";
import { Particles } from "@/components/particles";
import { Button } from "@/components/ui/button";
import { authHeaders, getSession } from "@/lib/auth";
import type { GalleryItem } from "@/lib/types";
import { utcDateKey } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function GalleryPage() {
  const dateKey = utcDateKey();
  const [tab, setTab] = useState<"today" | "all">("today");
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);

  function load() {
    setSignedIn(Boolean(getSession()?.accessToken));
    const qs = tab === "today" ? `?date=${dateKey}` : "";
    fetch(`/api/gallery${qs}`, { headers: authHeaders(), cache: "no-store" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gallery unavailable.");
        setItems(data.items || []);
      })
      .catch((err: Error) => setError(err.message));
  }

  useEffect(() => {
    load();
  }, [tab, dateKey]);

  async function remove(id: string) {
    const res = await fetch(`/api/mashups/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not delete.");
      return;
    }
    setItems((curr) => curr.filter((item) => item.id !== id));
  }

  return (
    <div className="relative min-h-screen">
      <Particles />
      <Header />
      <main className="relative mx-auto max-w-6xl px-4 pb-20 pt-8">
        <h1 className="font-serif text-4xl md:text-6xl">Public gallery</h1>
        <p className="mt-3 max-w-2xl text-white/60">
          {signedIn
            ? "Today lists every mashup fused on this UTC day. Use Delete on a card to remove a post you don’t want."
            : "Today lists every mashup fused on this UTC day. Sign in, then Delete appears on the cards."}
        </p>
        <div className="mt-6 flex gap-2">
          <button
            className={`rounded-full px-4 py-2 text-sm ${tab === "today" ? "bg-white text-black" : "bg-white/10"}`}
            onClick={() => setTab("today")}
          >
            Today
          </button>
          <button
            className={`rounded-full px-4 py-2 text-sm ${tab === "all" ? "bg-white text-black" : "bg-white/10"}`}
            onClick={() => setTab("all")}
          >
            All time
          </button>
        </div>
        {error && <p className="mt-6 text-rose-300">{error}</p>}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
              <Link href={`/m/${item.id}`}>
                <div className="relative aspect-[4/3]">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h2 className="font-serif text-2xl">{item.name}</h2>
                  <p className="mt-1 text-sm text-white/60">{item.tagline}</p>
                </div>
              </Link>
              {item.canDelete && (
                <div className="px-4 pb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="border border-rose-400/40 text-rose-200"
                    onClick={() => remove(item.id)}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
        {!error && items.length === 0 && (
          <p className="mt-10 text-white/50">No mashups yet. Be the first to fuse.</p>
        )}
      </main>
    </div>
  );
}
