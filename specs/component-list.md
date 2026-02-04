# COMPONENT_LIST.md

## Component Inventory

This document defines the **exact UI components** to be used in the Banner Review Uploader app.

The goal is:
- predictable UX for non-technical users
- minimal custom UI work
- high accessibility
- fast implementation by a human or LLM agent

---

## Frontend Stack
- Framework: Next.js (App Router)
- Styling: Tailwind CSS
- Component primitives: shadcn/ui (Radix-based)

---

## Page-Level Components

### 1. Upload Page (`/`)
**Purpose:** Entry point for uploading banner ZIPs

#### Components Used
- `PageContainer` (layout wrapper – custom)
- `Card` (shadcn/ui)
- `CardHeader`
- `CardTitle`
- `CardDescription`
- `Dropzone` (custom, built with `<input type="file">`)
- `Progress` (shadcn/ui)
- `Alert` (shadcn/ui)
- `Button` (shadcn/ui)
- `Separator` (shadcn/ui)
- `Tooltip` (shadcn/ui)

#### Interactions
- Drag & drop ZIP
- Click to browse
- Upload progress
- Error/success feedback

---

### 2. Success Screen (inline state)
**Purpose:** Show completed upload and review link

#### Components Used
- `Alert` (variant: success)
- `Button` (primary: Copy link)
- `Button` (secondary: Open review)
- `Button` (ghost: Upload another)
- `Tooltip` (copy confirmation)

---

### 3. Error State (inline)
**Purpose:** Clear, actionable errors

#### Components Used
- `Alert` (variant: destructive)
- `Button` (ghost or secondary for retry)

---

## Reusable UI Components

### 4. PageContainer (custom)
**Purpose:** Consistent layout and max-width control

**Structure**
- Centers content
- Applies padding
- Sets max width

---

### 5. Dropzone (custom)
**Purpose:** Primary interaction for non-technical users

#### Built With
- `<input type="file" accept=".zip">`
- Drag event handlers
- Tailwind utility classes

#### States
- Idle
- Drag-over
- Uploading (disabled)
- Error
- Success

#### Visuals
- Dashed border
- Accent highlight on drag-over
- Disabled opacity when uploading

---

### 6. UploadProgress (custom wrapper)
**Purpose:** Show upload status

#### Internals
- `Progress` component
- Text labels:
  - status (“Extracting ZIP…”, “Uploading files…”)
  - percentage
  - file count

---

### 7. Review Link Panel (custom)
**Purpose:** Present the final review URL

#### Components Used
- `Input` (read-only)
- `Button` (Copy)
- `Button` (Open in new tab)
- `Tooltip` (copy confirmation)

---

## Optional / Phase 2 Components

### 8. Toast Notifications
**Purpose:** Lightweight confirmation feedback

- `Toast`
- `ToastProvider`

Use sparingly (e.g. “Link copied”).

---

### 9. Campaign Metadata (Optional)
**Purpose:** Add context for uploads

#### Components Used
- `Input` (Campaign name)
- `Textarea` (Notes)

Optional; omit from v1 if not needed.

---

## Review Hub (review.html) Components

> NOTE: review.html uses **custom HTML + CSS only**, no shadcn/ui.

### BannerCard
- Container
- Header:
  - Size label
  - Buttons: Restart, Pause/Play, Focus
- Body:
  - iframe wrapper

### Focus Overlay
- “Back to all sizes” button
- Optional dim background
- ESC key handler

---

## Component Usage Rules

### Must Use
- `Button`, `Alert`, `Progress` from shadcn/ui
- Tailwind for spacing/layout

### Must NOT Use
- External CSS frameworks in review.html
- Complex animation libraries
- Heavy theming systems

---

## Installation Notes (for the agent)

Required shadcn/ui components to install:
- button
- card
- alert
- progress
- tooltip
- separator
- input
- textarea (optional)
- toast (optional)

---

## LLM Agent Instructions (Copy/Paste)
> Use Tailwind CSS and shadcn/ui components listed in this document.  
> Do not introduce additional UI libraries.  
> Build only the components defined here unless explicitly asked to extend functionality.
