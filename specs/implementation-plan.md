# Implementation Plan

## Phase 0 — Setup
- Create Next.js app (App Router)
- Configure env vars for storage
- Add storage SDK (R2 or S3)

## Phase 1 — Upload UI
- Build drag & drop interface
- Add ZIP validation
- Add progress indicators

## Phase 2 — Client-side unzip
- Use jszip or fflate
- Extract files to memory
- Validate structure

## Phase 3 — Upload files
- Call /api/create-upload
- Request signed URLs per file
- Upload blobs directly to storage
- Track progress

## Phase 4 — Finalize
- Call /api/finalize
- Store _meta.json
- Return review link

## Phase 5 — Proxy route
- Implement /r/[id]/[...path]
- Stream files
- Set headers

## Phase 6 — Review template
- Provide reusable review.html
- Document usage for production teams

## Phase 7 — QA
- Test with real Animate exports
- Verify Restart + Pause/Play
- Validate cross-browser behavior

## Phase 8 — Ops (Optional)
- Add auto-expiry rules
- Add admin listing page
