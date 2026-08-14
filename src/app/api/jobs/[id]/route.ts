import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const url = process.env.FUSE_API_URL;
  if (!url) {
    return NextResponse.json({ error: "FUSE_API_URL is not configured." }, { status: 500 });
  }
  const upstream = await fetch(`${url.replace(/\/$/, "")}/jobs/${id}`, {
    cache: "no-store",
  });
  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}
