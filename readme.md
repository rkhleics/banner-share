# HTML5 Banner Review Uploader

## Purpose
Provide a non-technical, drag-and-drop tool that allows internal users to upload a ZIP of HTML5 banner exports and receive **one review link** showing all banner sizes on a single page.

This replaces the current workflow of emailing ZIP files and manually opening individual HTML banners.

## Core User Flow
1. User opens the uploader page
2. User drags & drops a ZIP exported from Adobe Animate
3. Tool uploads and hosts the contents
4. Tool returns a single review URL
5. Client reviews all banners on one page with restart and pause/play controls

## Target Users
- Producers
- Account Managers
- Designers
(Non-technical)

## Key Requirements
- Drag & drop upload UX
- ZIP-based upload (preserves folder structure)
- Single review link
- Same-origin hosting for iframe control
- Restart guaranteed
- Pause/Play supported where technically possible

## Non-Goals (v1)
- Comments/annotations
- Timeline scrubbing
- Banner editing
- User accounts (unless added later)

## Hosting & Stack
- Frontend: Next.js
- Hosting: Vercel
- Storage: Cloudflare R2 (S3-compatible) or Amazon S3
- Backend: Serverless API routes (Next.js)

## Setup
1. Install dependencies: `npm install`
2. Configure environment variables (see below)
3. Run locally: `npm run dev`

## Environment Variables
Required:
- `STORAGE_BUCKET`

Recommended (R2 / S3-compatible):
- `STORAGE_ENDPOINT` (example: `https://<account>.r2.cloudflarestorage.com`)
- `STORAGE_REGION` (R2 uses `auto`)
- `STORAGE_ACCESS_KEY_ID`
- `STORAGE_SECRET_ACCESS_KEY`
- `STORAGE_FORCE_PATH_STYLE` (`true` for R2)

The upload flow uses signed PUT URLs from the browser, so your storage bucket must allow CORS for `PUT`, `GET`, and `HEAD` from your app origin.

## Review Template
A reusable `review.html` template is available at `public/review-template/review.html`. If `review.html` is missing from the ZIP, the app generates a review page from uploaded HTML files.
