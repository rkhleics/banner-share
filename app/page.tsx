"use client";

import * as React from "react";
import { unzipSync } from "fflate";

import { Dropzone } from "@/components/dropzone";
import { AppHeader } from "@/components/app-header";
import { PageContainer } from "@/components/page-container";
import { ReviewLinkPanel } from "@/components/review-link-panel";
import { UploadProgress } from "@/components/upload-progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MAX_FILE_SIZE, MAX_TOTAL_SIZE } from "@/lib/constants";
import { normalizeUploadPath } from "@/lib/paths";

const helperText =
  "Upload a ZIP exported from Animate that includes review.html and size folders.";

type UploadPhase = "idle" | "extracting" | "uploading" | "success" | "error";

type FileEntry = {
  path: string;
  bytes: number;
  data: Uint8Array;
  contentType: string;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

function getContentType(path: string) {
  const lower = path.toLowerCase();
  if (lower.endsWith(".html")) return "text/html";
  if (lower.endsWith(".css")) return "text/css";
  if (lower.endsWith(".js")) return "application/javascript";
  if (lower.endsWith(".json")) return "application/json";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".mp4")) return "video/mp4";
  if (lower.endsWith(".mp3")) return "audio/mpeg";
  if (lower.endsWith(".wav")) return "audio/wav";
  if (lower.endsWith(".ogg")) return "audio/ogg";
  if (lower.endsWith(".woff2")) return "font/woff2";
  if (lower.endsWith(".woff")) return "font/woff";
  if (lower.endsWith(".ttf")) return "font/ttf";
  if (lower.endsWith(".otf")) return "font/otf";
  return "application/octet-stream";
}

async function readErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as { error?: string };
    if (data?.error) return data.error;
  } catch {
    return null;
  }
  return null;
}

export default function Home() {
  const [phase, setPhase] = React.useState<UploadPhase>("idle");
  const [progress, setProgress] = React.useState({
    label: "",
    percent: 0,
    detail: ""
  });
  const [error, setError] = React.useState<string | null>(null);
  const [reviewUrl, setReviewUrl] = React.useState<string | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);

  const dropzoneStatus =
    phase === "error"
      ? "error"
      : phase === "success"
        ? "success"
        : phase === "uploading" || phase === "extracting"
          ? "uploading"
          : "idle";

  const reset = React.useCallback(() => {
    setPhase("idle");
    setError(null);
    setReviewUrl(null);
    setProgress({ label: "", percent: 0, detail: "" });
    setFileName(null);
  }, []);

  const handleFileSelect = React.useCallback(
    async (file: File) => {
      reset();
      setFileName(file.name);
      setError(null);

      if (!file.name.toLowerCase().endsWith(".zip")) {
        setError("Please upload a .zip file.");
        setPhase("error");
        return;
      }

      if (file.size > MAX_TOTAL_SIZE) {
        setError("ZIP is larger than 50 MB");
        setPhase("error");
        return;
      }

      setPhase("extracting");
      setProgress({
        label: "Extracting ZIP…",
        percent: 12,
        detail: "This usually takes a few seconds."
      });

      let entries: Record<string, Uint8Array>;
      try {
        const buffer = await file.arrayBuffer();
        entries = unzipSync(new Uint8Array(buffer));
      } catch {
        setError("Unable to read this ZIP file");
        setPhase("error");
        return;
      }

      const files: FileEntry[] = [];
      let totalBytes = 0;
      let hasBannerHtml = false;

      for (const [path, data] of Object.entries(entries)) {
        if (path.endsWith("/")) continue;
        if (path.startsWith("__MACOSX/") || path.includes("/__MACOSX/")) continue;
        if (path.endsWith(".DS_Store") || path.includes("/.DS_Store")) continue;

        const normalized = normalizeUploadPath(path);
        if (!normalized) {
          setError("ZIP contains invalid paths");
          setPhase("error");
          return;
        }

        if (normalized.includes("/") && normalized.toLowerCase().endsWith(".html")) {
          hasBannerHtml = true;
        }

        const bytes = data.length;
        if (bytes > MAX_FILE_SIZE) {
          setError("One or more files exceed 5 MB");
          setPhase("error");
          return;
        }

        totalBytes += bytes;
        files.push({
          path: normalized,
          bytes,
          data,
          contentType: getContentType(normalized)
        });
      }

      if (!hasBannerHtml) {
        setError("No banner HTML files found");
        setPhase("error");
        return;
      }

      if (totalBytes > MAX_TOTAL_SIZE) {
        setError("ZIP is larger than 50 MB");
        setPhase("error");
        return;
      }

      if (!files.length) {
        setError("ZIP is empty");
        setPhase("error");
        return;
      }

      setPhase("uploading");
      setProgress({
        label: "Preparing upload…",
        percent: 18,
        detail: `${files.length} files • ${formatBytes(totalBytes)}`
      });

      let uploadId = "";
      let initialReviewUrl = "";

      try {
        const createResponse = await fetch("/api/create-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ zipName: file.name })
        });

        if (!createResponse.ok) {
          const message = await readErrorMessage(createResponse);
          throw new Error(message ?? "Unable to start upload");
        }

        const createData = (await createResponse.json()) as {
          id: string;
          reviewUrl: string;
        };

        uploadId = createData.id;
        initialReviewUrl = createData.reviewUrl;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to start upload");
        setPhase("error");
        return;
      }

      let uploadedBytes = 0;
      let uploadedFiles = 0;

      for (const fileEntry of files) {
        try {
          const signResponse = await fetch("/api/sign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: uploadId,
              path: fileEntry.path,
              contentType: fileEntry.contentType
            })
          });

          if (!signResponse.ok) {
            const message = await readErrorMessage(signResponse);
            throw new Error(message ?? "Unable to sign upload");
          }

          const { url } = (await signResponse.json()) as { url: string };
          const blob = new Blob([fileEntry.data], {
            type: fileEntry.contentType
          });

          const uploadResponse = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": fileEntry.contentType },
            body: blob
          });

          if (!uploadResponse.ok) {
            throw new Error("A file failed to upload");
          }

          uploadedBytes += fileEntry.bytes;
          uploadedFiles += 1;

          const percent = Math.min(
            99,
            Math.round((uploadedBytes / totalBytes) * 100)
          );

          setProgress({
            label: "Uploading files…",
            percent,
            detail: `${uploadedFiles} of ${files.length} files uploaded`
          });
        } catch (err) {
          setError(err instanceof Error ? err.message : "Upload failed");
          setPhase("error");
          return;
        }
      }

      try {
        const finalizeResponse = await fetch("/api/finalize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: uploadId,
            files: files.map((fileEntry) => ({
              path: fileEntry.path,
              bytes: fileEntry.bytes
            }))
          })
        });

        if (!finalizeResponse.ok) {
          const message = await readErrorMessage(finalizeResponse);
          throw new Error(message ?? "Unable to finalize upload");
        }

        const finalizeData = (await finalizeResponse.json()) as {
          reviewUrl?: string;
        };

        setReviewUrl(finalizeData.reviewUrl ?? initialReviewUrl);
        setProgress({
          label: "Upload complete",
          percent: 100,
          detail: `${files.length} files ready for review`
        });
        setPhase("success");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to finalize upload");
        setPhase("error");
      }
    },
    [reset]
  );

  return (
    <PageContainer
      header={
        <AppHeader>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            HTML5 Banner Review
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Upload a banner ZIP and get a single review link
          </h1>
        </AppHeader>
      }
    >

      <Card>
        <CardHeader>
          <CardTitle>Upload ZIP</CardTitle>
          <CardDescription>
            Drag and drop your export, or choose a ZIP from your computer.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <Dropzone
            onFileSelect={handleFileSelect}
            disabled={phase === "uploading" || phase === "extracting"}
            status={dropzoneStatus}
            helperText={helperText}
            fileName={fileName}
          />

          {phase === "extracting" || phase === "uploading" ? (
            <UploadProgress
              label={progress.label}
              percent={progress.percent}
              detail={progress.detail}
            />
          ) : null}

          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Upload failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {phase === "success" && reviewUrl ? (
            <div className="flex flex-col gap-4">
              <Alert variant="success">
                <AlertTitle>Upload complete</AlertTitle>
                <AlertDescription>
                  Share this link with your client to review all banner sizes.
                </AlertDescription>
              </Alert>
              <ReviewLinkPanel reviewUrl={reviewUrl} />
              <Separator />
              <Button type="button" variant="ghost" onClick={reset}>
                Upload another
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
