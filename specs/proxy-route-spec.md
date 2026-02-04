# Proxy Route Specification

## Route
GET /r/[id]/[...path]

## Responsibilities
- Fetch object from storage:
  reviews/{id}/{path}
- Stream file to client
- Set correct Content-Type
- Apply safe caching headers
- Enforce basic security headers

## Required Headers
- X-Content-Type-Options: nosniff
- Referrer-Policy: no-referrer
- Cross-Origin-Resource-Policy: same-origin

## Caching
- review.html: max-age=60
- Assets: max-age=300 (or higher if safe)

## Error Handling
- 404 if file not found
- 400 if path traversal detected
