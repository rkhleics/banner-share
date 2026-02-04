import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";

import {
  buildStorageKey,
  getStorageClient,
  requireStorageBucket
} from "@/lib/storage";
import { isValidId, normalizeUploadPath } from "@/lib/paths";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MetaFile = { path: string; bytes?: number };

type Banner = { id: string; label: string; path: string };

function toWebStream(body: unknown) {
  if (!body) return null;
  return body instanceof Readable
    ? Readable.toWeb(body)
    : (body as ReadableStream<Uint8Array>);
}

function sizeLabel(id: string) {
  const match = id.match(/^(\d+)x(\d+)$/);
  if (!match) return id;
  return `${match[1]}x${match[2]}`;
}

function extractBanners(files: MetaFile[]) {
  const sizePattern = /^\d+x\d+$/;
  const topLevelFolders = new Set<string>();

  for (const file of files) {
    if (!file.path) continue;
    const parts = file.path.split("/");
    if (parts.length > 1 && parts[0]) {
      topLevelFolders.add(parts[0]);
    }
  }

  const commonPrefix =
    topLevelFolders.size === 1 ? Array.from(topLevelFolders)[0] : null;

  const stripPrefix = (path: string) => {
    if (!commonPrefix) return path;
    if (path.startsWith(`${commonPrefix}/`)) {
      return path.slice(commonPrefix.length + 1);
    }
    return path;
  };

  const bySize = new Map<string, { path: string; weight: number }>();
  const fallback: Banner[] = [];

  for (const file of files) {
    const path = file.path;
    if (!path || !path.toLowerCase().endsWith(".html")) continue;
    if (path === "review.html") continue;

    const displayPath = stripPrefix(path);

    const parts = displayPath.split("/");
    const folder = parts[0] ?? "";
    const fileName = parts[parts.length - 1] ?? "";

    if (sizePattern.test(folder)) {
      const weight = fileName.toLowerCase() === "index.html" ? 2 : 1;
      const current = bySize.get(folder);
      if (!current || weight > current.weight) {
        bySize.set(folder, { path, weight });
      }
      continue;
    }

    const id = folder || fileName.replace(/\.html$/i, "");
    fallback.push({ id, label: sizeLabel(id), path: `./${path}` });
  }

  const banners: Banner[] = bySize.size
    ? Array.from(bySize.entries()).map(([id, data]) => ({
        id,
        label: sizeLabel(id),
        path: `./${data.path}`
      }))
    : fallback;

  banners.sort((a, b) => {
    const aMatch = a.id.match(/^(\d+)x(\d+)$/);
    const bMatch = b.id.match(/^(\d+)x(\d+)$/);
    if (aMatch && bMatch) {
      const aW = Number(aMatch[1]);
      const aH = Number(aMatch[2]);
      const bW = Number(bMatch[1]);
      const bH = Number(bMatch[2]);
      const aArea = aW * aH;
      const bArea = bW * bH;
      return aArea - bArea || aW - bW || aH - bH;
    }
    if (aMatch) return -1;
    if (bMatch) return 1;
    return a.id.localeCompare(b.id);
  });

  return banners;
}

function buildReviewHtml(banners: Banner[], id: string) {
  const bannerData = JSON.stringify(banners);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Banner Review</title>
    <style>
      :root {
        --bg: #f5f6f8;
        --card: #ffffff;
        --border: #e2e8f0;
        --text: #0f172a;
        --muted: #64748b;
        --shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
        --radius: 14px;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: "IBM Plex Sans", "Segoe UI", sans-serif;
        background: var(--bg);
        color: var(--text);
      }

      .topbar {
        padding: 24px;
      }

      .topbar-center {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        text-align: center;
        max-width: 768px;
        margin: 0 auto;
      }

      .logo {
        width: 160px;
        height: auto;
        margin-left: 40px;
      }

      .topbar-grid {
        display: grid;
        grid-template-columns: 200px 1fr 200px;
        align-items: center;
      }

      header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 24px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .eyebrow {
        font-size: 20px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: var(--muted);
        margin: 0 0 6px 0;
        font-weight: 300;
      }

      h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 600;
      }

      .subtitle {
        margin: 6px 0 0 0;
        font-size: 13px;
        color: var(--muted);
      }

      main {
        max-width: 1200px;
        margin: 0 auto;
        padding: 48px 24px 48px;
      }

      .grid {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        align-items: flex-start;
      }

      .banner-card {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        width: max-content;
      }

      .banner-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 14px;
        background: #f8fafc;
        border-bottom: 1px solid var(--border);
        gap: 12px;
      }

      .banner-title {
        font-size: 14px;
        font-weight: 600;
      }

      .controls {
        display: inline-flex;
        gap: 8px;
      }

      .control-button {
        border: 1px solid #cbd5e1;
        background: #ffffff;
        color: #1e293b;
        border-radius: 999px;
        font-size: 12px;
        padding: 6px 12px;
        cursor: pointer;
        transition: background 0.15s ease, border-color 0.15s ease;
      }

      .control-button:hover {
        background: #f1f5f9;
        border-color: #94a3b8;
      }

      .control-button:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      .frame {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 14px;
        background: #f8fafc;
      }

      iframe {
        border: 1px solid var(--border);
        background: #ffffff;
        display: block;
      }

      .back-button {
        border: 1px solid #cbd5e1;
        background: #ffffff;
        color: #1e293b;
        border-radius: 999px;
        font-size: 13px;
        padding: 8px 16px;
        cursor: pointer;
        justify-self: end;
      }

      .back-button[hidden] {
        display: none;
      }

      body.is-focused .grid {
        display: block;
      }

      body.is-focused .banner-card {
        display: none;
      }

      body.is-focused .banner-card.is-active {
        display: flex;
        margin: 0 auto;
        max-width: 900px;
        transform: scale(1.03);
      }

      .empty {
        border: 1px dashed var(--border);
        border-radius: var(--radius);
        background: #ffffff;
        padding: 32px;
        text-align: center;
        color: var(--muted);
      }

      @media (max-width: 640px) {
        header {
          flex-direction: column;
          align-items: flex-start;
        }

        .controls {
          flex-wrap: wrap;
        }
      }
    </style>
  </head>
  <body>
    <div class="topbar">
      <div class="topbar-grid">
        <img src="/rkh-logo.png" alt="RKH" class="logo" />
        <div class="topbar-center">
          <p class="eyebrow">BannerShare</p>
        </div>
        <button id="backButton" class="back-button" type="button" hidden>
          Back to all sizes
        </button>
      </div>
    </div>
    <main>
      <div id="grid" class="grid"></div>
      <div id="empty" class="empty" hidden>No banner HTML files found.</div>
    </main>
    <script>
      const banners = ${bannerData};

      const grid = document.getElementById("grid");
      const empty = document.getElementById("empty");
      const backButton = document.getElementById("backButton");
      let activeCard = null;
      let lastFocused = null;

      const focusableSelector =
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])";

      function getTicker(iframe) {
        const win = iframe.contentWindow;
        if (!win) return null;
        if (win.createjs && win.createjs.Ticker) {
          return win.createjs.Ticker;
        }
        return null;
      }

      function getStage(iframe) {
        const win = iframe.contentWindow;
        if (!win) return null;
        if (win.stage) return win.stage;
        const an = win.AdobeAn;
        if (an) {
          if (typeof an.getComposition === "function" && an.compositions) {
            const ids = Object.keys(an.compositions);
            if (ids.length) {
              const comp = an.getComposition(ids[0]);
              if (comp && typeof comp.getStage === "function") {
                return comp.getStage();
              }
            }
          }
        }
        return null;
      }

      function getExportRoot(iframe) {
        const win = iframe.contentWindow;
        if (!win) return null;
        return win.exportRoot || null;
      }

      function getPlaybackState(iframe) {
        const stage = getStage(iframe);
        if (stage && typeof stage.tickEnabled === "boolean") {
          return !stage.tickEnabled;
        }
        const ticker = getTicker(iframe);
        if (ticker) {
          return !!ticker.paused;
        }
        const root = getExportRoot(iframe);
        if (root && typeof root.paused === "boolean") {
          return root.paused;
        }
        return null;
      }

      function setPlaybackState(iframe, paused) {
        const ticker = getTicker(iframe);
        const stage = getStage(iframe);
        let handled = false;
        if (ticker) {
          if (typeof ticker.setPaused === "function") {
            ticker.setPaused(paused);
          } else {
            ticker.paused = paused;
          }
          handled = true;
        }
        if (stage) {
          if (typeof stage.setAutoPlay === "function") {
            stage.setAutoPlay(!paused);
            handled = true;
          }
          if (typeof stage.tickEnabled === "boolean") {
            stage.tickEnabled = !paused;
            handled = true;
          }
        }
        return handled;
      }

      function syncPauseButton(button, iframe) {
        const paused = getPlaybackState(iframe);
        if (paused === null) {
          button.disabled = true;
          button.textContent = "Pause";
          button.setAttribute("aria-pressed", "false");
          return;
        }
        button.disabled = false;
        button.textContent = paused ? "Play" : "Pause";
        button.setAttribute("aria-pressed", String(paused));
      }

      function restartIframe(iframe) {
        const src = iframe.getAttribute("src");
        if (!src) return;
        iframe.setAttribute("src", src);
      }

      function createCard(banner) {
        const card = document.createElement("article");
        card.className = "banner-card";
        card.dataset.bannerId = banner.id;
        card.tabIndex = -1;

        const header = document.createElement("div");
        header.className = "banner-header";

        const title = document.createElement("div");
        title.className = "banner-title";
        title.textContent = banner.label;

        const controls = document.createElement("div");
        controls.className = "controls";

        const pauseButton = document.createElement("button");
        pauseButton.className = "control-button";
        pauseButton.type = "button";
        pauseButton.textContent = "Pause";
        pauseButton.setAttribute("aria-pressed", "false");

        const restartButton = document.createElement("button");
        restartButton.className = "control-button";
        restartButton.type = "button";
        restartButton.textContent = "Restart";

        const focusButton = document.createElement("button");
        focusButton.className = "control-button";
        focusButton.type = "button";
        focusButton.textContent = "Focus";

        controls.appendChild(pauseButton);
        controls.appendChild(restartButton);
        controls.appendChild(focusButton);

        header.appendChild(title);
        header.appendChild(controls);

        const frame = document.createElement("div");
        frame.className = "frame";

        const iframe = document.createElement("iframe");
        iframe.src = banner.path;
        iframe.title = banner.label;

        const size = banner.id.split("x");
        iframe.width = size[0] || "300";
        iframe.height = size[1] || "250";
        iframe.loading = "lazy";

        frame.appendChild(iframe);
        card.appendChild(header);
        card.appendChild(frame);

        restartButton.addEventListener("click", (event) => {
          event.stopPropagation();
          restartIframe(iframe);
          setTimeout(() => syncPauseButton(pauseButton, iframe), 80);
        });

        pauseButton.addEventListener("click", (event) => {
          event.stopPropagation();
          const current = getPlaybackState(iframe);
          if (current === null) return;
          const nextPaused = !current;
          setPlaybackState(iframe, nextPaused);
          syncPauseButton(pauseButton, iframe);
        });

        focusButton.addEventListener("click", (event) => {
          event.stopPropagation();
          location.hash = banner.id;
        });

        card.addEventListener("click", () => {
          location.hash = banner.id;
        });

        iframe.addEventListener("load", () => {
          syncPauseButton(pauseButton, iframe);
          let attempts = 0;
          const poll = setInterval(() => {
            attempts += 1;
            syncPauseButton(pauseButton, iframe);
            if (!pauseButton.disabled || attempts > 20) {
              clearInterval(poll);
            }
          }, 250);
        });

        return card;
      }

      function setActiveCard(card) {
        if (activeCard) {
          activeCard.classList.remove("is-active");
        }
        activeCard = card;
        if (activeCard) {
          activeCard.classList.add("is-active");
        }
      }

      function enterFocus(id) {
        const card = document.querySelector(\"[data-banner-id='\" + id + \"']\");
        if (!card) return;
        lastFocused = document.activeElement;
        setActiveCard(card);
        document.body.classList.add("is-focused");
        backButton.hidden = false;
        const focusable = card.querySelectorAll(focusableSelector);
        if (focusable.length) {
          focusable[0].focus();
        } else {
          card.focus();
        }
      }

      function exitFocus() {
        setActiveCard(null);
        document.body.classList.remove("is-focused");
        backButton.hidden = true;
        if (lastFocused && lastFocused.focus) {
          lastFocused.focus();
        }
      }

      function syncFromHash() {
        const id = location.hash.replace("#", "");
        if (id) {
          enterFocus(id);
        } else {
          exitFocus();
        }
      }

      function clearHash() {
        history.pushState("", document.title, window.location.pathname + window.location.search);
        syncFromHash();
      }

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          clearHash();
        }

        if (event.key === "Tab" && document.body.classList.contains("is-focused")) {
          const card = activeCard;
          if (!card) return;
          const focusable = Array.from(card.querySelectorAll(focusableSelector));
          if (!focusable.length) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      });

      backButton.addEventListener("click", clearHash);

      if (!banners.length) {
        empty.hidden = false;
      } else {
        banners.forEach((banner) => {
          grid.appendChild(createCard(banner));
        });
      }

      window.addEventListener("hashchange", syncFromHash);
      syncFromHash();
    </script>
  </body>
</html>`;
}

function applyHeaders(headers: Headers, cacheControl: string) {
  headers.set("Cache-Control", cacheControl);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "no-referrer");
  headers.set("Cross-Origin-Resource-Policy", "same-origin");
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string; path: string[] } }
) {
  if (!params?.id || !isValidId(params.id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const joinedPath = params.path?.join("/") ?? "";
  const normalized = normalizeUploadPath(joinedPath);

  if (!normalized) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const cacheControl =
    normalized === "review.html"
      ? "public, max-age=60, must-revalidate"
      : "public, max-age=300";

  const client = getStorageClient();
  const bucket = requireStorageBucket();

  const respondWithObject = async (key: string) => {
    const response = await client.send(
      new GetObjectCommand({ Bucket: bucket, Key: key })
    );

    if (!response.Body) {
      return new Response("Not found", { status: 404 });
    }

    const body = toWebStream(response.Body);
    if (!body) {
      return new Response("Not found", { status: 404 });
    }

    const headers = new Headers();
    headers.set("Content-Type", response.ContentType ?? "application/octet-stream");
    applyHeaders(headers, cacheControl);

    if (response.ContentLength) {
      headers.set("Content-Length", response.ContentLength.toString());
    }

    return new Response(body, { headers });
  };

  const handleStorageError = (error: unknown) => {
    const statusCode = (error as { $metadata?: { httpStatusCode?: number } })
      ?.$metadata?.httpStatusCode;

    if (statusCode === 404 || (error as { name?: string }).name === "NoSuchKey") {
      return new Response("Not found", { status: 404 });
    }

    return new Response("Unable to fetch file", { status: 500 });
  };

  if (normalized === "review.html") {
    try {
      const key = buildStorageKey(params.id, normalized);
      return await respondWithObject(key);
    } catch (error) {
      const statusCode = (error as { $metadata?: { httpStatusCode?: number } })
        ?.$metadata?.httpStatusCode;
      const isMissing =
        statusCode === 404 || (error as { name?: string }).name === "NoSuchKey";

      if (!isMissing) {
        return new Response("Unable to fetch file", { status: 500 });
      }
    }

    try {
      const metaKey = buildStorageKey(params.id, "_meta.json");
      const metaResponse = await client.send(
        new GetObjectCommand({ Bucket: bucket, Key: metaKey })
      );

      if (!metaResponse.Body) {
        return new Response("Not found", { status: 404 });
      }

      const metaBody = toWebStream(metaResponse.Body);
      if (!metaBody) {
        return new Response("Not found", { status: 404 });
      }

      const metaText = await new Response(metaBody).text();
      const meta = JSON.parse(metaText) as { files?: MetaFile[] };
      const banners = extractBanners(meta.files ?? []);
      const html = buildReviewHtml(banners, params.id);

      const headers = new Headers();
      headers.set("Content-Type", "text/html; charset=utf-8");
      applyHeaders(headers, cacheControl);

      return new Response(html, { headers });
    } catch (error) {
      return handleStorageError(error);
    }
  }

  try {
    const key = buildStorageKey(params.id, normalized);
    return await respondWithObject(key);
  } catch (error) {
    return handleStorageError(error);
  }
}
