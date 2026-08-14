import { NextResponse } from "next/server";
import { forwardAuth } from "@/lib/forward-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = process.env.FUSE_API_URL;
  if (!url) {
    return NextResponse.json({ error: "FUSE_API_URL is not configured." }, { status: 500 });
  }
  const upstream = await fetch(`${url.replace(/\/$/, "")}/quota`, {
    cache: "no-store",
    headers: forwardAuth(request),
  });
  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}
