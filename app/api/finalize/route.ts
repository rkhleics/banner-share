import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";

import { buildStorageKey, getStorageClient, requireStorageBucket } from "@/lib/storage";
import { isValidId, normalizeUploadPath } from "@/lib/paths";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type FinalizeFile = {
  path: string;
  bytes: number;
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.id !== "string" || !Array.isArray(body.files)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!isValidId(body.id)) {
    return NextResponse.json({ error: "Invalid upload id" }, { status: 400 });
  }

  const files: FinalizeFile[] = [];

  for (const file of body.files) {
    if (!file || typeof file.path !== "string" || typeof file.bytes !== "number") {
      return NextResponse.json({ error: "Invalid file list" }, { status: 400 });
    }

    const normalized = normalizeUploadPath(file.path);
    if (!normalized) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    files.push({ path: normalized, bytes: file.bytes });
  }

  const totalBytes = files.reduce((sum, file) => sum + file.bytes, 0);
  const meta = {
    id: body.id,
    createdAt: new Date().toISOString(),
    totalBytes,
    files
  };

  try {
    const client = getStorageClient();
    const bucket = requireStorageBucket();
    const key = buildStorageKey(body.id, "_meta.json");

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: JSON.stringify(meta),
        ContentType: "application/json",
        CacheControl: "public, max-age=60"
      })
    );

    const origin = new URL(request.url).origin;
    const reviewUrl = `${origin}/r/${body.id}/review.html`;

    return NextResponse.json({ ok: true, reviewUrl });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Finalize failed" },
      { status: 500 }
    );
  }
}
