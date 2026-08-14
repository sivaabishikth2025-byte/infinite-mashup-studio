import { NextResponse } from "next/server";
import { forwardAuth } from "@/lib/forward-auth";

export const runtime = "nodejs";

function apiBase() {
  const url = process.env.FUSE_API_URL;
  if (!url) throw new Error("FUSE_API_URL is not configured.");
  return url.replace(/\/$/, "");
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const upstream = await fetch(`${apiBase()}/mashups/${id}`, { cache: "no-store" });
    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "API unreachable.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const upstream = await fetch(`${apiBase()}/mashups/${id}`, {
      method: "DELETE",
      headers: forwardAuth(request),
    });
    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "API unreachable.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
