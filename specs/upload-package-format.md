# Upload Package Format

## Required ZIP Structure

The uploaded ZIP must extract to the following structure:

review.html
160x600/
  index.html
  *.js
  images/*
300x250/
  index.html
728x90/
  index.html

## Required Files
- `review.html` at the root of the ZIP

## review.html Responsibilities
- Displays all banner sizes in a grid
- Loads banners via relative paths (e.g. ./160x600/index.html)
- Provides Restart + Pause/Play controls per banner

## Validation Rules
Upload should fail if:
- ZIP does not contain `review.html`
- No HTML files are found inside size folders
- ZIP exceeds size limits

## Notes
- File and folder names must be preserved
- Relative paths must remain intact
