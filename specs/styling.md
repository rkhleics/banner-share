# STYLING.md

## Styling Specification

This document defines the styling approach for:
1. The **Uploader App** (internal, non-technical users)
2. The **Review Hub (review.html)** shown to clients

The goal is a clean, calm, professional UI that:
- requires no design decisions from users
- is readable and accessible
- does not interfere with banner playback or timing

---

## Global Principles

### Design Goals
- Neutral, agency-grade appearance
- Low visual noise
- Clear hierarchy and states
- Accessibility-first (contrast, focus, keyboard)

### Typography
- Font stack:


- Base font size: 16px
- Line height: 1.4–1.6
- Font weights:
- Headings: 600–700
- Body: 400–500

### Spacing Scale (px)
| Token | Value |
|----|----|
| xs | 4 |
| sm | 8 |
| md | 12 |
| lg | 16 |
| xl | 24 |
| xxl | 32 |

---

## Uploader App Styling

### Styling Approach
- Use **Tailwind CSS** for layout and spacing
- Use **shadcn/ui** components for buttons, cards, alerts, progress, toasts
- Avoid heavy theming; customize only via Tailwind tokens

### Layout
- Centered column layout
- Max width: `640–720px`
- Page padding: `24px`
- Content stacked vertically with `gap: 16–24px`

### Upload Card
- Large dashed dropzone
- Rounded corners (12–16px)
- Border changes on drag-over
- Disabled state during upload

#### Dropzone States
| State | Visual |
|---|---|
| Idle | Dashed neutral border |
| Drag-over | Accent border + soft tinted background |
| Uploading | Solid border, muted background |
| Error | Red border + error message |
| Success | Green border + success message |

### Progress
- Horizontal progress bar
- Percentage label
- Optional: file count indicator
- Avoid per-file logs in UI

### Buttons
- Primary action: solid accent
- Secondary: outline or ghost
- Destructive (if needed): red
- Minimum height: 40px
- Clear hover/focus states

### Messaging
- Errors: red icon + short explanation + fix
- Success: green icon + next action buttons
- Helper text: muted color, small size

---

## Review Hub (review.html) Styling

### Styling Constraints
- No external CSS libraries
- No build step
- All styling inline or in a `<style>` block
- No dependencies that could interfere with banner code

### Visual Tone
- Neutral background
- Light card surfaces
- Subtle shadows
- Clear borders around banners

### Layout
- Max width: `1100–1200px`
- Page padding: `16–24px`
- Responsive grid using `auto-fit` / `minmax`

### Banner Grid
- Grid gap: `12–16px`
- Columns:
- Desktop: 3–4 (depending on sizes)
- Tablet: 2
- Mobile: 1

### Banner Card
- White surface
- Rounded corners (12–14px)
- Thin border
- Soft shadow
- Overflow hidden

### Banner Header
- Size label (e.g. 300×250)
- Controls aligned right:
- Restart
- Pause/Play
- Focus

### Banner Frame
- Neutral background behind iframe
- Thin visible border around iframe
- Centered horizontally
- Padding to avoid edge clipping

### Controls
- Button height: 32–36px
- Text or icon + text
- Tooltip on hover
- Disabled state if feature unavailable

---

## Focus Mode Styling

### Behaviour
- Activated via banner click, Focus button, or URL hash
- All non-focused banners hidden
- Focused banner centered

### Visual Treatment
- Optional dimmed background
- Increased padding around focused banner
- Slightly increased scale (max 1.25×)
- Controls remain visible

### Exit UI
- “Back to all sizes” button
- ESC key supported
- Button positioned consistently (top-left or top-center)

---

## Accessibility

### Requirements
- All interactive elements keyboard accessible
- Visible focus styles
- Sufficient contrast (WCAG AA)
- Buttons have clear labels or aria-labels
- Do not rely on color alone for state

---

## Mobile Considerations
- Single-column layout
- Controls stack if needed
- Avoid horizontal scrolling
- Ensure tap targets ≥ 44px

---

## What NOT to Do
- Do not load external CSS frameworks in review.html
- Do not animate layout changes heavily
- Do not apply global styles that could affect banner iframes
- Do not theme review.html differently per campaign

---

## LLM Agent Styling Instructions (Copy/Paste)
> For the uploader app, use Tailwind CSS with shadcn/ui components.  
> For review.html, use a custom inline CSS block only.  
> Keep styles neutral, accessible, and minimal.  
> Do not introduce external CSS or JS libraries into review.html.
