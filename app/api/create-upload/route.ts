import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import { MAX_FILE_SIZE, MAX_TOTAL_SIZE } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function generateId() {
  return randomUUID().replace(/-/g, "").slice(0, 12);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.zipName !== "string") {
    return NextResponse.json(
      { error: "zipName is required" },
      { status: 400 }
    );
  }

  const id = generateId();
  const basePath = `reviews/${id}/`;
  const origin = new URL(request.url).origin;
  const reviewUrl = `${origin}/r/${id}/review.html`;

  return NextResponse.json({
    id,
    basePath,
    reviewUrl,
    constraints: {
      maxFileSize: MAX_FILE_SIZE,
      maxTotalSize: MAX_TOTAL_SIZE
    }
  });
}
