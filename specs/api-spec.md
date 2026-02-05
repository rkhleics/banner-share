# API Specification

## POST /api/create-upload
Creates a new review session.

### Request
{
  "campaignName": "optional",
  "zipName": "banners.zip"
}

### Response
{
  "id": "abc123",
  "basePath": "reviews/abc123/",
  "reviewUrl": "https://domain.com/r/abc123/review.html"
}

---

## POST /api/sign
Returns a signed PUT URL for uploading a file.

### Request
{
  "id": "abc123",
  "path": "160x600/index.html",
  "contentType": "text/html"
}

### Response
{
  "url": "https://signed-put-url"
}

---

## POST /api/finalize
Finalizes the upload and writes metadata.

### Request
{
  "id": "abc123",
  "files": [
    { "path": "review.html", "bytes": 1234 }
  ]
}

### Response
{
  "ok": true,
  "reviewUrl": "/r/abc123/review.html"
}
