# UX Specification

## Upload Page (/)

### UI Elements
- Large drag & drop zone
- “Choose file” fallback button
- Helper text:
  “Upload a ZIP exported from Animate that includes review.html and size folders”

### States
- Idle
- Drag-over
- Uploading (progress bar)
- Success
- Error (clear, actionable messages)

### Errors (Examples)
- “ZIP is missing review.html”
- “ZIP is larger than 50 MB”
- “No banner HTML files found”

## Success Screen
- Message: “Upload complete”
- Button: Copy review link
- Button: Open review
- Optional expiry notice

## UX Principles
- One action only: upload ZIP
- No configuration required
- No technical language
