import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = process.env.FUSE_API_URL;
  if (!url) {
    return NextResponse.json({ error: "FUSE_API_URL is not configured." }, { status: 500 });
  }
  const params = new URL(request.url).searchParams;
  const id = params.get("id") || "";
  const lang = params.get("lang") || "en";
  const upstream = await fetch(
    `${url.replace(/\/$/, "")}/translate?id=${encodeURIComponent(id)}&lang=${encodeURIComponent(lang)}`,
    { cache: "no-store" },
  );
  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}
