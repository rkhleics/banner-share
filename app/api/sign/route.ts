import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { buildStorageKey, getStorageClient, requireStorageBucket } from "@/lib/storage";
import { isValidId, normalizeUploadPath } from "@/lib/paths";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.id !== "string" || typeof body.path !== "string") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!isValidId(body.id)) {
    return NextResponse.json({ error: "Invalid upload id" }, { status: 400 });
  }

  const normalizedPath = normalizeUploadPath(body.path);
  if (!normalizedPath) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const contentType =
    typeof body.contentType === "string" && body.contentType.length
      ? body.contentType
      : "application/octet-stream";

  const cacheControl =
    normalizedPath === "review.html"
      ? "public, max-age=60, must-revalidate"
      : "public, max-age=300";

  try {
    const client = getStorageClient();
    const bucket = requireStorageBucket();
    const key = buildStorageKey(body.id, normalizedPath);

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      CacheControl: cacheControl
    });

    const url = await getSignedUrl(client, command, { expiresIn: 900 });

    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Signing failed" },
      { status: 500 }
    );
  }
}
