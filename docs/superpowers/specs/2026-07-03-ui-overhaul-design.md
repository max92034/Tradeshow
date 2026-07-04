# TradeShow App — UI Overhaul Design Spec

**Date:** 2026-07-03  
**Version:** 3.0  
**Scope:** Complete visual redesign with new 3-mode design system  
**Target:** Mobile-first tradeshow quotation tool (phones + tablets)  

---

## 1. Design Philosophy

**"Calm Authority"** — A tool that feels instantly professional, fast, and trustworthy on a noisy tradeshow floor. No decorative noise. Every pixel serves the workflow: find a product, add it to the quote, export. The UI gets out of the way so the salesperson can focus on the buyer.

**Core principles:**
- **Information hierarchy first** — SKU and price are the loudest elements on a product card
- **Touch-optimized** — 44px minimum tap targets, generous spacing, thumb-reachable actions
- **Zero decorative clutter** — No gradients on UI chrome, no decorative background patterns, no ornamental shadows
- **Dark mode for battery & eye strain** — Tradeshow floors are bright; dark mode reduces glare and saves OLED battery
- **Metallic gold variant for premium branding** — When the brand wants to make a statement

---

## 2. Design System — Three Modes

All three modes share the **same layout, same component structure, same spacing system**. Only colors and typography accents change. This ensures consistency and makes theme switching trivial.

### 2.1 Mode A: Light Professional (Default)

A refined, warm-neutral light theme inspired by Linear, Notion, and modern SaaS dashboards. Clean, airy, and easy to scan under bright lights.

**Color Palette:**

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#f7f5f2` | Page background |
| `--bg-secondary` | `#eeede9` | Section backgrounds, hover states |
| `--bg-card` | `#ffffff` | Cards, modals, drawers |
| `--bg-elevated` | `#ffffff` | Elevated cards (with shadow) |
| `--text-primary` | `#1c1c1e` | Headlines, primary text |
| `--text-secondary` | `#3a3a3c` | Body text, descriptions |
| `--text-muted` | `#8e8e93` | Placeholders, timestamps, hints |
| `--text-inverse` | `#ffffff` | Text on dark/accent backgrounds |
| `--accent` | `#0071e3` | Primary actions, active states, links |
| `--accent-hover` | `#005bb5` | Accent hover |
| `--accent-soft` | `#e8f1fa` | Accent backgrounds, badges |
| `--accent-muted` | `#f0f7ff` | Very subtle accent tint |
| `--border` | `#d1d1d6` | Borders, dividers |
| `--border-soft` | `#e5e5ea` | Subtle borders |
| `--success` | `#34c759` | Success states, saved confirmations |
| `--warning` | `#ff9500` | Warnings, errors that need attention |
| `--danger` | `#ff3b30` | Errors, destructive actions |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.04)` | Subtle elevation |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.06)` | Cards, dropdowns |
| `--shadow-lg` | `0 12px 32px rgba(0,0,0,0.08)` | Modals, drawers |
| `--shadow-xl` | `0 24px 48px rgba(0,0,0,0.12)` | Full-screen overlays |

**Header:**
- Background: `#ffffff` with `backdrop-filter: blur(12px)`
- Border-bottom: `1px solid var(--border-soft)`
- No background images, no gradients, no patterns

### 2.2 Mode B: Dark Professional

A deep, high-contrast dark mode for OLED devices and dim exhibition halls. Inspired by Apple Dark Mode and Linear's dark theme.

**Color Palette:**

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#000000` | Page background (pure black for OLED) |
| `--bg-secondary` | `#1c1c1e` | Section backgrounds |
| `--bg-card` | `#1c1c1e` | Cards |
| `--bg-elevated` | `#2c2c2e` | Elevated surfaces |
| `--text-primary` | `#ffffff` | Primary text |
| `--text-secondary` | `#ebebf5` | Body text (90% white) |
| `--text-muted` | `#8e8e93` | Muted text |
| `--text-inverse` | `#1c1c1e` | Text on light backgrounds |
| `--accent` | `#0a84ff` | Brighter blue for dark bg contrast |
| `--accent-hover` | `#409cff` | Hover state |
| `--accent-soft` | `#1c3d5c` | Subtle accent backgrounds |
| `--accent-muted` | `#122536` | Very subtle accent |
| `--border` | `#38383a` | Borders |
| `--border-soft` | `#2c2c2e` | Subtle borders |
| `--success` | `#30d158` | Success |
| `--warning` | `#ff9f0a` | Warning |
| `--danger` | `#ff453a` | Danger |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.3)` | Elevation |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.4)` | Cards |
| `--shadow-lg` | `0 12px 32px rgba(0,0,0,0.5)` | Modals |
| `--shadow-xl` | `0 24px 48px rgba(0,0,0,0.6)` | Overlays |

**Header:**
- Background: `rgba(28, 28, 30, 0.8)` with `backdrop-filter: blur(20px)`
- Border-bottom: `1px solid var(--border)`

### 2.3 Mode C: Metallic Gold (Premium Variant)

A sophisticated gold-accented theme for premium brand presence. Uses real metallic gold tones (not yellow) with deep charcoal. Think: luxury watch brand, high-end furniture catalog.

**Color Palette:**

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0f0f0f` | Deep charcoal background |
| `--bg-secondary` | `#1a1a1a` | Section backgrounds |
| `--bg-card` | `#141414` | Card surfaces |
| `--bg-elevated` | `#1f1f1f` | Elevated surfaces |
| `--text-primary` | `#f5f5f0` | Warm white text |
| `--text-secondary` | `#c8c8c0` | Secondary text |
| `--text-muted` | `#7a7a72` | Muted text |
| `--text-inverse` | `#0f0f0f` | Text on gold backgrounds |
| `--accent` | `#c9a96e` | Metallic gold (not yellow) |
| `--accent-hover` | `#dbbc82` | Lighter gold on hover |
| `--accent-soft` | `#2a2518` | Subtle gold tint backgrounds |
| `--accent-muted` | `#1f1c14` | Very subtle gold |
| `--border` | `#2a2a2a` | Borders |
| `--border-soft` | `#1f1f1f` | Subtle borders |
| `--success` | `#4ade80` | Success (green for contrast) |
| `--warning` | `#fbbf24` | Warning |
| `--danger` | `#f87171` | Danger |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.4)` | Elevation |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.5)` | Cards |
| `--shadow-lg` | `0 12px 32px rgba(0,0,0,0.6)` | Modals |
| `--shadow-xl` | `0 24px 48px rgba(0,0,0,0.7)` | Overlays |

**Header:**
- Background: `rgba(15, 15, 15, 0.85)` with `backdrop-filter: blur(20px)`
- Border-bottom: `1px solid rgba(201, 169, 110, 0.2)` (subtle gold line)
- Gold accent line: `2px` height at bottom with `linear-gradient(90deg, transparent, #c9a96e, transparent)`

---

## 3. Typography System

**Typeface:** Use the system font stack for maximum performance and native feel. No web font loading on slow tradeshow Wi-Fi.

```css
--font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-mono: "SF Mono", "SFMono-Regular", "Consolas", "Liberation Mono", Menlo, Courier, monospace;
```

**Scale (fluid, using clamp where possible):**

| Token | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| `text-hero` | `28px` mobile / `36px` desktop | 700 | 1.1 | -0.02em | Empty state headlines |
| `text-h1` | `22px` mobile / `28px` desktop | 700 | 1.2 | -0.01em | Modal titles, drawer headers |
| `text-h2` | `18px` mobile / `22px` desktop | 600 | 1.3 | -0.01em | Section headers |
| `text-h3` | `16px` mobile / `18px` desktop | 600 | 1.3 | 0 | Card titles, product names |
| `text-body` | `15px` mobile / `16px` desktop | 400 | 1.5 | 0 | Body text, descriptions |
| `text-small` | `13px` | 400 | 1.4 | 0 | Metadata, dimensions |
| `text-caption` | `12px` | 500 | 1.3 | 0.01em | Badges, labels, timestamps |
| `text-mono` | `14px` | 500 | 1.3 | 0.02em | SKU numbers, prices |

**Gold mode accent:** In Mode C only, headings can use a subtle gold gradient text:
```css
.theme-gold h1, .theme-gold h2 {
  background: linear-gradient(135deg, #c9a96e 0%, #e8d5a3 50%, #c9a96e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```
This is the **only** place gradients are allowed in the entire UI.

---

## 4. Spacing System

Use a consistent 4px base grid. All spacing values are multiples of 4.

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | `4px` | Tight gaps, icon padding |
| `space-2` | `8px` | Inline gaps, small padding |
| `space-3` | `12px` | Card internal padding (compact) |
| `space-4` | `16px` | Card internal padding (standard) |
| `space-5` | `20px` | Section gaps |
| `space-6` | `24px` | Page horizontal padding mobile |
| `space-8` | `32px` | Page horizontal padding desktop |
| `space-10` | `40px` | Section vertical spacing |
| `space-12` | `48px` | Large section spacing |

**Border Radius:**

| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | `8px` | Buttons, small inputs |
| `radius-md` | `12px` | Cards, badges |
| `radius-lg` | `16px` | Modals, large containers |
| `radius-xl` | `24px` | Full-screen panels |
| `radius-full` | `9999px` | Pills, FABs, avatars |

---

## 5. Component Redesign

### 5.1 ProductCard

**Current problems:**
- Zero-value fields render as "0" (already partially fixed, but needs guard reinforcement)
- Colored section headers (violet, emerald, amber, rose) create visual noise
- Image container has fixed height with no aspect ratio handling
- "Add" button is small and hard to tap
- No visual distinction between product info and action area

**New design:**

```
┌─────────────────────────────────────┐
│  [Image: aspect-ratio 4/3,          │
│   object-fit: cover, rounded-t-xl]  │
├─────────────────────────────────────┤
│  [Collection badge — top-left of    │
│   image area, absolute positioned]  │
│                                     │
│  WU78317AA                    [Add] │
│  Lavender Fairy Thinking Pose       │
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │ 12×8×6cm │  │ 24 / CTN │        │
│  │   0.5kg  │  │  $12.50  │        │
│  └──────────┘  └──────────┘        │
│                                     │
│  [Category > Subcategory]           │
└─────────────────────────────────────┘
```

**Specs:**
- Card: `bg-card`, `rounded-xl`, `border: 1px solid var(--border-soft)`, `shadow-sm`
- Hover: `shadow-md`, `translateY(-2px)`, `border-color: var(--border)` — transition `200ms ease`
- Image container: `aspect-ratio: 4/3`, `overflow: hidden`, `border-radius: 12px 12px 0 0`
- Image: `object-fit: cover`, `width: 100%`, `height: 100%`
- Image error fallback: Show a centered `Package` icon in `bg-secondary` instead of blank space
- Collection badge: `position: absolute`, `top: 12px`, `left: 12px`, `bg-accent-soft`, `text-accent`, `text-caption`, `rounded-full`, `px-2.5 py-1`
- SKU: `text-mono`, `text-primary`, `font-weight: 600`, `font-size: 15px`
- Description: `text-body`, `text-secondary`, `line-clamp-2`
- Info grid: 2-column CSS grid, `gap: 8px`, each cell is `bg-secondary`, `rounded-lg`, `p-3`
- Info cell content: Label in `text-muted` + `text-caption`, value in `text-secondary` + `text-small`
- Price: `text-mono`, `text-accent`, `font-weight: 700`, `font-size: 16px`
- Add button: `w-full`, `bg-accent`, `text-inverse`, `rounded-lg`, `py-3`, `font-weight: 600`
- Add button hover: `bg-accent-hover`, `shadow-md`
- Add button active: `scale(0.97)`
- Add button state after click: Brief "Added" text with checkmark icon, `bg-success`, `200ms`, then revert

**Hide rules (reinforced):**
- Do NOT render any field where value is `0`, `null`, `undefined`, or empty string
- `weight` only shows if `> 0`
- `length/width/height` only show if at least one is `> 0`, and only display the ones that are `> 0`
- `cartonQty` only shows if `> 0`
- `innerQty` only shows if `> 0`
- `cartonL/cartonW/cartonH` only show if at least one is `> 0`

### 5.2 SearchHeader

**Current problems:**
- Dark background header feels heavy
- Mobile hamburger menu doesn't close after toggling theme/language
- Voice button on desktop is small

**New design:**

```
┌──────────────────────────────────────────────────┐
│  [Blur backdrop header]                          │
│  TradeShow    [Search input..........] [Mic] [🛒]│
└──────────────────────────────────────────────────┘
```

**Specs:**
- Background: `rgba(bg-primary, 0.8)` + `backdrop-filter: blur(20px)` + `saturation(180%)`
- Border-bottom: `1px solid var(--border-soft)`
- Height: `64px` mobile / `72px` desktop
- Padding: `0 16px` mobile / `0 32px` desktop
- Logo: `TradeShow` — "Trade" in `text-primary`, "Show" in `text-accent`, `font-weight: 700`, `font-size: 20px`
- Search input: `flex: 1`, `bg-secondary`, `rounded-full`, `height: 40px`, `pl-11 pr-4`
- Search icon: `absolute left-4`, `text-muted`, `size: 18px`
- Search placeholder: `"Search SKU, name, or keyword..."`
- Voice button (desktop): `40px` circle, `bg-accent-soft`, `text-accent`, `hover: bg-accent + text-inverse`
- Cart button: `40px` circle, `bg-accent`, `text-inverse`, `relative` with badge
- Badge: `absolute -top-1 -right-1`, `min-w-[20px] h-5`, `bg-danger`, `text-inverse`, `text-caption`, `rounded-full`
- Mobile: Logo hidden, search full width, voice + cart on right

**Mobile menu fixes:**
- Theme toggle and voice language toggle must call `closeMenu()` after toggling
- Menu closes on outside click (already implemented, keep)

### 5.3 VoiceSearchButton (Mobile)

**Current problems:**
- Large fixed button at bottom can block content
- Indicator text above button is too wordy
- No haptic feedback indication

**New design:**

```
         ┌─────────────────┐
         │  🎤 "77123"     │  ← transcript indicator
         └─────────────────┘
              ┌─────┐
              │  🎤 │         ← FAB
              └─────┘
```

**Specs:**
- Position: `fixed bottom-6 left-1/2 -translate-x-1/2`
- Size: `64px` diameter (was `80px` — slightly smaller to be less obtrusive)
- Shape: `rounded-full`
- Default state: `bg-accent`, `text-inverse`, `shadow-lg`
- Listening state: `bg-danger` (red to indicate recording), `scale-110`, pulse ring animation
- Processing state: `bg-warning`, slow spin animation on icon
- Transcript indicator: `position: absolute`, `bottom: 80px`, `bg-card`, `text-primary`, `rounded-xl`, `px-4 py-2`, `shadow-lg`, `border: 1px solid var(--border-soft)`
- Error indicator: `bg-danger`, `text-inverse`, same position
- `touch-none` class to prevent scroll while holding
- `z-index: 50`
- Safe-area inset: Add `pb-safe` (use `env(safe-area-inset-bottom)`) to the page container so content isn't hidden behind the FAB

**States:**

| State | Visual |
|-------|--------|
| Idle | `bg-accent`, subtle shadow |
| Preparing | `bg-secondary`, pulse opacity, "Preparing..." |
| Listening | `bg-danger`, pulsing ring, "Listening..." |
| Processing | `bg-warning`, icon spins, "Processing..." |
| Success | `bg-success`, checkmark icon, shows transcript for 1.5s |
| Error | `bg-danger`, shake animation, shows error for 3s |

### 5.4 OrderDrawer

**Current problems:**
- Full-width on mobile is fine but buttons are cramped
- No safe-area padding for notched phones
- Buyer form fields are small on mobile

**New design:**

```
┌────────────────────────────────┐
│  ← Quotation          [Save]   │
├────────────────────────────────┤
│  [Buyer Info Form]             │
│  Name*     [____________]      │
│  Company*  [____________]      │
│  Email*    [____________]      │
│  Nationality* [Dropdown ▼]     │
├────────────────────────────────┤
│  ITEMS (3)              [+ Add]│
│  ┌──────────────────────────┐  │
│  │ [img] WU78317AA     [🗑] │  │
│  │ Lavender Fairy...   $12.50│  │
│  └──────────────────────────┘  │
│  ┌──────────────────────────┐  │
│  │ [img] WU78318BB     [🗑] │  │
│  │ Rose Fairy...       $15.00│  │
│  └──────────────────────────┘  │
├────────────────────────────────┤
│  Subtotal              $27.50  │
│  Total Items                3  │
│  Total Cartons              2  │
├────────────────────────────────┤
│  [Export Excel]  [Email Quote] │
│  [     New Quote     ]         │
└────────────────────────────────┘
```

**Specs:**
- Width: `100vw` mobile / `420px` desktop
- Background: `bg-card`
- Border-left (desktop): `1px solid var(--border-soft)`
- Shadow (desktop): `shadow-xl`
- Header: `sticky top-0`, `bg-card`, `border-bottom: 1px solid var(--border-soft)`, `px-4 py-3`
- Title: `text-h1`
- Close button: `40px` circle, `hover: bg-secondary`
- Content padding: `px-4`
- Bottom padding: `pb-8` + `pb-[calc(2rem+env(safe-area-inset-bottom))]` for notched phones

**CartItem redesign:**
- Horizontal layout: `64px` thumbnail + info + delete
- Thumbnail: `64px` square, `rounded-lg`, `object-fit: cover`
- SKU: `text-mono`, `text-primary`, `font-weight: 600`
- Description: `text-small`, `text-secondary`, `line-clamp-1`
- Price: `text-mono`, `text-accent`, right-aligned
- Delete button: `40px` circle, `hover: bg-danger/10 hover:text-danger`
- Border-bottom: `1px solid var(--border-soft)` between items

**BuyerInfoForm redesign:**
- Fields stack vertically on mobile, 2-column on desktop
- Input: `input-field` style (see 5.7)
- Label: `text-caption`, `text-muted`, `mb-1`
- Required indicator: `*` in `text-danger`
- Nationality dropdown: Searchable, virtualized list, `rounded-xl`, `shadow-lg`
- Validation: Inline error below field, `text-danger`, `text-caption`

**OrderSummary footer:**
- Sticky at bottom of drawer
- Background: `bg-card` with `border-top: 1px solid var(--border-soft)`
- Totals row: `flex justify-between`, `text-body`
- Buttons: Full-width stack on mobile, side-by-side on desktop
- Primary action (Export): `btn-primary`, full width
- Secondary action (Email): `btn-secondary`, full width
- Tertiary (New Quote): `btn-ghost`, full width, `text-danger`

### 5.5 ResultsGrid

**Current problems:**
- No virtualization — all cards render at once
- Skeleton height mismatch causes layout shift
- `animate-fade-in` on every card is expensive

**New design:**

**Specs:**
- Grid: `grid-cols-1` mobile / `grid-cols-2` tablet / `grid-cols-3` desktop / `grid-cols-4` xl
- Gap: `16px`
- Padding-top: `16px`
- Virtualization: **Implement** using `react-window` or CSS `content-visibility: auto` on each card
- If using CSS-only: `.card { content-visibility: auto; contain-intrinsic-size: 400px; }`
- Animation: Remove per-card fade-in. Use a single staggered reveal on the grid container only.

**Empty state:**
- Centered illustration (use `Package` icon at `64px`, `text-muted`)
- Title: `text-h2`, `"No products found"`
- Subtitle: `text-body`, `"Try a different search term or upload your catalog."`

**Loading state:**
- Skeleton cards: Same grid layout, `bg-secondary` blocks
- Image area: `aspect-ratio: 4/3`, `rounded-t-xl`, shimmer animation
- Text lines: 3 lines of varying width, `8px` height each, `rounded-full`
- No per-card animation — skeleton is static

### 5.6 Modals (Upload, History, Settings)

**New design:**

**Specs:**
- Overlay: `bg-black/40`, `backdrop-filter: blur(4px)`
- Modal container: `bg-card`, `rounded-xl` (mobile full-screen, desktop `max-w-lg` centered)
- Mobile: Full screen with slide-up animation
- Desktop: Centered with `shadow-xl`, `scale` entrance animation
- Header: `px-6 py-4`, `border-bottom: 1px solid var(--border-soft)`, `flex justify-between items-center`
- Title: `text-h1`
- Close button: `40px` circle, `hover: bg-secondary`
- Body: `px-6 py-4`, `overflow-y: auto`, `max-h-[70vh]`
- Footer (if actions): `px-6 py-4`, `border-top: 1px solid var(--border-soft)`, `flex justify-end gap-3`

**UploadModal:**
- Drop zone: `border: 2px dashed var(--border)`, `rounded-xl`, `p-8`, `bg-secondary`, `hover: border-accent`
- Active drag state: `border-accent`, `bg-accent-soft`
- File list: Each file as a row with progress bar
- Supported formats hint: `text-caption`, `text-muted`

**OrderHistoryModal:**
- Order list: Vertical stack of `OrderCard` components
- Each order: `bg-secondary`, `rounded-lg`, `p-4`, `hover: bg-elevated`
- Order info: Buyer name, date, item count, total
- Actions: Load (primary), Delete (ghost, danger color)

**SettingsModal:**
- Theme selector: 3 option cards side-by-side (Light, Dark, Gold), each with a color preview
- Selected state: `ring-2 ring-accent`
- Voice language: Toggle between `中文` and `English`
- About section: App version, build date

### 5.7 Form Elements

**Input field:**
- `w-full`, `px-4 py-3`, `bg-secondary`, `border: 1px solid var(--border-soft)`, `rounded-lg`
- `text-primary`, `text-body`
- Focus: `border-accent`, `ring-2 ring-accent/20`
- Error: `border-danger`, `ring-2 ring-danger/20`
- Disabled: `opacity-50`, `cursor-not-allowed`
- Placeholder: `text-muted`

**Button variants:**

| Variant | Background | Text | Border | Shadow | Hover |
|---------|-----------|------|--------|--------|-------|
| Primary | `bg-accent` | `text-inverse` | none | `shadow-sm` | `bg-accent-hover`, `shadow-md` |
| Secondary | `bg-secondary` | `text-primary` | `1px solid var(--border)` | none | `bg-elevated`, `border-muted` |
| Ghost | transparent | `text-secondary` | none | none | `bg-secondary`, `text-primary` |
| Danger | `bg-danger` | `text-inverse` | none | `shadow-sm` | `opacity-90` |

All buttons: `rounded-lg`, `px-4 py-2.5`, `font-weight: 600`, `text-body`, `active: scale(0.97)`, `transition: 150ms ease`

**Toggle switch:**
- Track: `w-11 h-6`, `rounded-full`, `bg-muted`
- Active track: `bg-accent`
- Thumb: `w-5 h-5`, `rounded-full`, `bg-white`, `shadow-sm`
- Thumb position: `translateX(0)` off, `translateX(20px)` on
- Transition: `200ms ease`

---

## 6. Layout Principles

### 6.1 Mobile (< 640px)
- Single column product grid
- Full-width search bar
- Voice FAB at bottom center
- Order drawer: full-screen slide-up
- Modals: full-screen
- Horizontal padding: `16px`
- Bottom safe-area padding: `env(safe-area-inset-bottom)`

### 6.2 Tablet (640px - 1024px)
- 2-column product grid
- Side drawer for orders (not full-screen)
- Modals: centered with max-width
- Horizontal padding: `24px`

### 6.3 Desktop (> 1024px)
- 3-4 column product grid
- Persistent order drawer option? No — keep as overlay drawer to maximize product viewing area
- Modals: centered
- Horizontal padding: `32px`
- Max content width: `1400px` centered

### 6.4 Z-Index Hierarchy

| Layer | Z-Index | Element |
|-------|---------|---------|
| Background | 0 | Page content |
| Content | 1 | `content-layer` class |
| Sticky header | 30 | SearchHeader |
| Drawer | 40 | OrderDrawer overlay + panel |
| Modal | 50 | Modal overlay + container |
| Toast | 60 | Toast notifications |
| FAB | 50 | VoiceSearchButton |

---

## 7. Motion & Animation

**Philosophy:** Motion should feel instant and responsive. No decorative animations. Every animation communicates state change.

**Allowed animations:**

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| Fade in | `200ms` | `ease-out` | Modal/drawer entrance |
| Slide up | `250ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | Mobile drawer, FAB indicator |
| Scale press | `100ms` | `ease-out` | Button active states |
| Scale entrance | `200ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | Modal content |
| Shake | `300ms` | `ease-in-out` | Error states |
| Pulse ring | `1.5s` | `ease-in-out infinite` | Recording indicator |
| Spinner | `1s` | `linear infinite` | Loading states |

**Disabled animations:**
- No per-card entrance animations on scroll (performance killer with 500+ cards)
- No parallax
- No bouncing entrance on page load
- No gradient animations on UI chrome

**Reduced motion:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 8. Accessibility

- **Color contrast:** All text meets WCAG AA (4.5:1 for normal, 3:1 for large)
- **Touch targets:** Minimum `44×44px` for all interactive elements
- **Focus indicators:** `ring-2 ring-accent ring-offset-2` on keyboard focus
- **Screen reader:** All icons have `aria-label`, all buttons have descriptive text
- **Form labels:** All inputs have associated `<label>` elements
- **Modal traps:** Focus trap inside modals, `Escape` key closes
- **Semantic HTML:** Use `<header>`, `<main>`, `<nav>`, `<section>`, `<dialog>` appropriately

---

## 9. Theme Switching Architecture

**Current state:** `useSettingsStore` has `theme: 'minimal' | 'trumpian'` and `useTheme()` hook has `light | dark`.

**New architecture:**

Replace both with a single source of truth in `useSettingsStore`:

```typescript
type ThemeMode = 'light' | 'dark' | 'gold';

interface SettingsState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}
```

**CSS implementation:**

```css
/* Base variables are defined in :root (light mode) */

/* Dark mode override */
.theme-dark {
  --bg-primary: #000000;
  --bg-secondary: #1c1c1e;
  /* ... all dark tokens ... */
}

/* Gold mode override */
.theme-gold {
  --bg-primary: #0f0f0f;
  --bg-secondary: #1a1a1a;
  /* ... all gold tokens ... */
}
```

**Apply theme:**
```typescript
useEffect(() => {
  document.documentElement.classList.remove('theme-light', 'theme-dark', 'theme-gold');
  document.documentElement.classList.add(`theme-${theme}`);
}, [theme]);
```

**Remove the separate `useTheme.ts` hook** — consolidate everything into `useSettingsStore`.

---

## 10. Asset & Font Strategy

**Fonts:** Use system font stack only. No Google Fonts, no self-hosted fonts. Tradeshow Wi-Fi is unreliable.

**Icons:** Continue using `lucide-react`. Replace custom `VoiceIcon` SVG with Lucide's `Mic` icon for consistency, or keep the custom one if it has the pulse-ring animation.

**Images:** Product images loaded from URLs. Fallback to `Package` icon on error.

**No decorative assets:** Remove the `body::before` and `body::after` background patterns. They add visual noise and hurt perceived performance. The background should be a solid `var(--bg-primary)`.

---

## 11. Implementation Checklist

### Phase 1: Foundation
- [ ] Remove `useTheme.ts` hook, consolidate into `useSettingsStore`
- [ ] Remove old `theme-minimal` and `theme-trumpian` classes
- [ ] Implement new `theme-light`, `theme-dark`, `theme-gold` CSS variables in `index.css`
- [ ] Remove body background patterns (`body::before`, `body::after`)
- [ ] Update `App.tsx` to use new theme class system

### Phase 2: Global Components
- [ ] Redesign `SearchHeader` with blur backdrop
- [ ] Fix mobile menu auto-close on theme/language toggle
- [ ] Redesign `VoiceSearchButton` with new states and smaller size
- [ ] Redesign `OrderDrawer` with safe-area padding
- [ ] Redesign all modals with new overlay and container styles

### Phase 3: Product & Cart
- [ ] Redesign `ProductCard` with new info grid layout
- [ ] Reinforce zero-value hiding guards
- [ ] Add image error fallback
- [ ] Redesign `CartItem` with horizontal layout
- [ ] Redesign `ResultsGrid` with CSS containment

### Phase 4: Forms & Details
- [ ] Redesign `BuyerInfoForm` inputs
- [ ] Add inline validation styling
- [ ] Redesign `OrderSummary` footer buttons
- [ ] Update `SettingsModal` with theme selector cards

### Phase 5: Polish
- [ ] Verify all touch targets >= 44px
- [ ] Verify color contrast ratios
- [ ] Add `prefers-reduced-motion` support
- [ ] Test all three themes on mobile and desktop
- [ ] Test dark mode on OLED device

---

## 12. Anti-Patterns to Avoid

- ❌ No gradient backgrounds on UI chrome (headers, cards, buttons)
- ❌ No decorative background patterns or textures
- ❌ No per-card scroll animations (use CSS containment instead)
- ❌ No more than one accent color per theme
- ❌ No `box-shadow` on every card by default (only on hover/elevation)
- ❌ No uppercase text for labels (use sentence case)
- ❌ No border-radius smaller than `8px` on interactive elements
- ❌ No custom web fonts (system fonts only)
- ❌ No generic card grids without clear hierarchy
- ❌ No floating dashboards or stat strips

---

*End of Design Specification*
