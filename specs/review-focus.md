
# REVIEW_FOCUS_MODE.md

## Feature: Banner Focus Mode (Preview Link)

### Purpose
Allow clients reviewing the preview link to focus on **one banner at a time** while still keeping the default view as a **multi-size grid**.

This supports deeper inspection of a specific size (animation timing, copy, frame-by-frame review) without requiring separate links or pages.

---

## Default Behaviour
- Opening the review link shows **all banners** in a responsive grid.
- Each banner runs independently with its own controls (Restart, Pause/Play).
- This remains the primary comparison view.

---

## Focus Mode Behaviour

### Entry
Focus mode can be triggered by:
1. Clicking anywhere on a banner card
2. Clicking a **“Focus”** button in the banner controls
3. Opening the URL with a hash:
   - `review.html#300x250`

### In Focus Mode
- Only the selected banner is visible
- The banner is:
  - centered horizontally and vertically
  - optionally scaled up (without distorting aspect ratio)
- All banner controls remain available
- A clear **“Back to all sizes”** control is shown
- Optional: darkened or neutral background for clarity

### Exit
Focus mode can be exited by:
- Clicking **“Back to all sizes”**
- Pressing the `ESC` key
- Clearing the URL hash

---

## URL Hash Support
- Each banner is assigned an ID (e.g. `160x600`, `300x250`)
- When a hash is present:
  - `review.html#300x250`
  - The page loads directly into focus mode for that banner
- Useful for client feedback:
  > “Please review the animation on #300x250”

---

## Technical Requirements

### Implementation Scope
- **Client-side only**
- No backend changes
- No page reloads
- No iframe reloads when entering/exiting focus mode

### State Management
- Focus mode is controlled via:
  - a CSS class on the document body (e.g. `.is-focused`)
  - the current URL hash

### Accessibility
- Focus mode must:
  - be keyboard accessible
  - trap focus within the focused banner when active (if feasible)
  - restore focus to the previously focused element on exit

---

## Non-Goals
- No editing or commenting tools
- No separate URLs per banner (hash-based only)
