import assert from "node:assert/strict";
import test from "node:test";

import {
  detectBannerSizeFromHtml,
  detectBannerSizeFromPath
} from "./banner-size.ts";

test("detects exact size folders and file names", () => {
  assert.deepEqual(detectBannerSizeFromPath("campaign/320x50/index.html"), {
    width: 320,
    height: 50,
    id: "320x50",
    label: "320x50"
  });

  assert.deepEqual(detectBannerSizeFromPath("campaign/728x90.html"), {
    width: 728,
    height: 90,
    id: "728x90",
    label: "728x90"
  });
});

test("detects sizes embedded in The Brief export names", () => {
  assert.deepEqual(
    detectBannerSizeFromPath(
      "Google Display & Video 360/102570_AHG_Summer_Just_Say_Yes_2026-320x50-px/index.html"
    ),
    {
      width: 320,
      height: 50,
      id: "320x50",
      label: "320x50"
    }
  );
});

test("prefers exact size segments before loose embedded matches", () => {
  assert.deepEqual(
    detectBannerSizeFromPath("campaign/300x250/creative-160x600/index.html"),
    {
      width: 300,
      height: 250,
      id: "300x250",
      label: "300x250"
    }
  );
});

test("parses ad.size metadata from banner html", () => {
  assert.deepEqual(
    detectBannerSizeFromHtml(
      `<!doctype html><meta charset="utf-8"><meta name="ad.size" content="width=970,height=250">`
    ),
    {
      width: 970,
      height: 250,
      id: "970x250",
      label: "970x250"
    }
  );
});

test("returns null when no size metadata can be found", () => {
  assert.equal(detectBannerSizeFromPath("campaign/index.html"), null);
  assert.equal(detectBannerSizeFromHtml("<html><head></head></html>"), null);
});
