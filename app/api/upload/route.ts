import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";

import { MAX_FILE_SIZE } from "@/lib/constants";
import { buildStorageKey, getStorageClient, requireStorageBucket } from "@/lib/storage";
import { isValidId, normalizeUploadPath } from "@/lib/paths";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const uploadId = request.headers.get("x-upload-id") ?? "";
  const uploadPath = request.headers.get("x-upload-path") ?? "";

  if (!uploadId || !uploadPath) {
    return NextResponse.json({ error: "Missing upload metadata" }, { status: 400 });
  }

  if (!isValidId(uploadId)) {
    return NextResponse.json({ error: "Invalid upload id" }, { status: 400 });
  }

  const normalizedPath = normalizeUploadPath(uploadPath);
  if (!normalizedPath) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const contentType = request.headers.get("content-type") || "application/octet-stream";

  let body: ArrayBuffer;
  try {
    body = await request.arrayBuffer();
  } catch {
    return NextResponse.json({ error: "Unable to read upload body" }, { status: 400 });
  }

  if (body.byteLength > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File is too large" }, { status: 400 });
  }

  const cacheControl =
    normalizedPath === "review.html"
      ? "public, max-age=60, must-revalidate"
      : "public, max-age=300";

  try {
    const client = getStorageClient();
    const bucket = requireStorageBucket();
    const key = buildStorageKey(uploadId, normalizedPath);

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: Buffer.from(body),
        ContentType: contentType,
        CacheControl: cacheControl
      })
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
