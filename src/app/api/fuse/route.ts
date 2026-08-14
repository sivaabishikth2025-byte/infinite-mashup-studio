import { NextResponse } from "next/server";
import { forwardAuth } from "@/lib/forward-auth";

export const runtime = "nodejs";
export const maxDuration = 30;

function apiBase() {
  const url = process.env.FUSE_API_URL;
  if (!url) throw new Error("FUSE_API_URL is not configured.");
  return url.replace(/\/$/, "");
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const upstream = await fetch(`${apiBase()}/fuse`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...forwardAuth(request),
      },
      body: JSON.stringify(payload),
    });
    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Fusion API unreachable.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
