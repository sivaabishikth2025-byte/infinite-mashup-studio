import { NextResponse } from "next/server";
import { fuseApiUrl } from "@/lib/api";
import { forwardAuth } from "@/lib/forward-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const upstream = await fetch(`${fuseApiUrl()}/quota`, {
    cache: "no-store",
    headers: forwardAuth(request),
  });
  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}
