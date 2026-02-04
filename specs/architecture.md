# Architecture Overview

## High-Level Design
This is a small internal web app consisting of:
- A static frontend for upload UX
- Serverless API routes for upload coordination
- Object storage for banner files
- Same-origin proxy routes for serving uploaded assets

## Why Same-Origin Matters
Pause/Play controls require the review page to access iframe contents.
Browsers block this unless both are served from the same origin.

Therefore:
- Banner files are stored in object storage
- They are **served through the Next.js app domain** via proxy routes

## Flow Diagram
User ZIP
  ↓
Client-side unzip
  ↓
Direct upload to object storage
  ↓
Proxy-served via /r/[id]/... routes
  ↓
review.html loads banners in iframes

## Key Design Decisions
- Client-side unzip to avoid serverless timeouts
- ZIP upload only (not individual files)
- Static hosting for review content
- No database required for v1
