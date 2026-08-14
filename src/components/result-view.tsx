"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { authHeaders, getSession } from "@/lib/auth";
import type { Mashup } from "@/lib/types";
import { motion } from "framer-motion";
import { Copy, Download, Pause, Play, RefreshCw, Share2, Sparkles, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";

const LANGS = [
  { id: "en", label: "English" },
  { id: "es", label: "Español" },
  { id: "fr", label: "Français" },
  { id: "de", label: "Deutsch" },
  { id: "pt", label: "Português" },
  { id: "ja", label: "日本語" },
  { id: "ko", label: "한국어" },
  { id: "zh", label: "中文" },
  { id: "hi", label: "हिन्दी" },
  { id: "ar", label: "العربية" },
];

export function ResultView({ mashup: initial }: { mashup: Mashup }) {
  const router = useRouter();
  const [mashup, setMashup] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setSignedIn(Boolean(getSession()?.accessToken));
  }, []);

  const cards = useMemo(
    () => [
      { title: "Origin Story", body: mashup.origin },
      { title: "Abilities", body: mashup.abilities.map((a) => `• ${a}`).join("\n") },
      { title: "Personality", body: mashup.personality },
      { title: "Fun Facts", body: mashup.facts.map((a) => `• ${a}`).join("\n") },
      { title: "Advertisement", body: mashup.advertisement },
      { title: "Warning Label", body: mashup.warning },
      {
        title: "Scientific Classification",
        body: [
          `Kingdom: ${mashup.classification.kingdom}`,
          `Species: ${mashup.classification.species}`,
          `Habitat: ${mashup.classification.habitat}`,
          `Diet: ${mashup.classification.diet}`,
          `Lifespan: ${mashup.classification.lifespan}`,
          `Threat Level: ${mashup.classification.threatLevel}`,
        ].join("\n"),
      },
      { title: "Patent Summary", body: mashup.patent },
    ],
    [mashup],
  );

  async function copyStory() {
    await navigator.clipboard.writeText(
      [mashup.name, mashup.tagline, "", mashup.origin, "", mashup.personality, "", mashup.patent].join("\n"),
    );
  }

  async function share() {
    const url = `${window.location.origin}/m/${mashup.id}`;
    if (navigator.share) {
      await navigator.share({ title: mashup.name, url, text: mashup.tagline });
      return;
    }
    await navigator.clipboard.writeText(url);
  }

  async function downloadImage() {
    const res = await fetch(mashup.imageUrl);
    const blob = await res.blob();
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `${mashup.name.replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
    URL.revokeObjectURL(href);
  }

  function toggleAudio() {
    if (!mashup.audioUrl) return;
    if (!audioRef.current) audioRef.current = new Audio(mashup.audioUrl);
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }
    audioRef.current.play();
    audioRef.current.onended = () => setPlaying(false);
    setPlaying(true);
  }

  async function translateTo(lang: string) {
    const res = await fetch(`/api/translate?id=${mashup.id}&lang=${lang}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Translate failed.");
    setMashup(data);
  }

  async function remove() {
    const res = await fetch(`/api/mashups/${mashup.id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not delete.");
    router.push("/gallery");
  }

  async function remix() {
    if (!mashup.ingredientIds?.length) {
      router.push("/");
      return;
    }
    setBusy(true);
    try {
      const session = getSession();
      const res = await fetch("/api/fuse", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          ingredientIds: mashup.ingredientIds,
          challengeDate: mashup.challengeDate,
          mode: mashup.mode || "daily",
          accessToken: session?.accessToken,
          idToken: session?.idToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const started = Date.now();
      while (Date.now() - started < 170000) {
        const jobRes = await fetch(`/api/jobs/${data.jobId}`, { cache: "no-store" });
        const job = await jobRes.json();
        if (job.status === "COMPLETE") {
          confetti({ particleCount: 120, spread: 70, origin: { y: 0.3 } });
          router.push(`/m/${job.mashupId}`);
          return;
        }
        if (job.status === "FAILED") throw new Error(job.error);
        await new Promise((r) => setTimeout(r, 2000));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/5"
      >
        <div className="relative aspect-square w-full md:aspect-[16/9]">
          <Image
            src={mashup.imageUrl}
            alt={mashup.name}
            fill
            unoptimized
            className="object-cover"
            priority
          />
        </div>
        <div className="p-6 md:p-8">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
            {mashup.ingredients.join("  +  ")}
          </p>
          <h1 className="mt-3 font-serif text-5xl tracking-tight md:text-7xl">
            {mashup.name}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-white/70">{mashup.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="glow" onClick={remix} disabled={busy}>
              <Sparkles className="h-4 w-4" /> Remix
            </Button>
            <Button variant="ghost" onClick={() => router.push("/")}>
              <RefreshCw className="h-4 w-4" /> New fuse
            </Button>
            {mashup.audioUrl && (
              <Button variant="ghost" onClick={toggleAudio}>
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                Listen
              </Button>
            )}
            <Button variant="ghost" onClick={share}>
              <Share2 className="h-4 w-4" /> Share
            </Button>
            <Button variant="ghost" onClick={downloadImage}>
              <Download className="h-4 w-4" /> Download Image
            </Button>
            <Button variant="ghost" onClick={copyStory}>
              <Copy className="h-4 w-4" /> Copy Story
            </Button>
            {signedIn && (
              <Button
                variant="ghost"
                className="border border-rose-400/40 text-rose-200"
                onClick={remove}
              >
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            )}
          </div>
          <label className="mt-6 block text-xs uppercase tracking-[0.2em] text-white/40">
            Translate dossier
            <select
              className="mt-2 block rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-white"
              defaultValue={mashup.language || "en"}
              onChange={(e) => translateTo(e.target.value)}
            >
              {LANGS.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </motion.div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 * i }}
          >
            <Card className="h-full">
              <p className="text-xs uppercase tracking-[0.2em] text-fuchsia-300">
                {card.title}
              </p>
              <p className="mt-3 whitespace-pre-wrap text-white/85">{card.body}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
