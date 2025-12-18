# Glassmorphism Dark Theme Design System

This document describes the dark glassmorphism theme applied to the `/learn` routes. Use this guide to apply consistent styling across new pages.

---

## Color Palette

### Background Colors
| Name | Value | Usage |
|------|-------|-------|
| Deep Background | `#0b101a` | Main page background |
| Sidebar Background | `rgba(13, 17, 26, 0.7)` | Sidebar with transparency |
| Glass Background | `rgba(255, 255, 255, 0.03)` | Panel/card backgrounds |

### Accent Colors
| Name | Hex Value | Tailwind Class | Usage |
|------|-----------|----------------|-------|
| Cyan (primary) | `#22d3ee` | `cyan-400` | Borders, glows, active states |
| Cyan (button bg) | `#0e7490` | `cyan-700` | Button backgrounds (WCAG AA compliant with white text) |
| Cyan (button hover) | `#0891b2` | `cyan-600` | Button hover state |
| Orange | `#f59e0b` | `amber-500` | Secondary accent |
| Green | `#10b981` | `emerald-500` | Success states |
| Red | `#ef4444` | `red-500` | Destructive/error states |

### Text Colors
| Name | Value | Tailwind Class | Usage |
|------|-------|----------------|-------|
| Primary Text | `#ffffff` | `text-white` | Headings, important text |
| Secondary Text | `#94a3b8` | `text-slate-400` | Body text, descriptions |
| Muted Text | `#64748b` | `text-slate-500` | Labels, timestamps |
| Disabled Text | `#475569` | `text-slate-600` | Disabled states |

### Border Colors
| Name | Value | Usage |
|------|-------|-------|
| Glass Border | `rgba(255, 255, 255, 0.07)` | Default panel borders |
| Subtle Border | `rgba(255, 255, 255, 0.04)` | Very subtle dividers |
| Cyan Glow Border | `rgba(34, 211, 238, 0.2)` | Accent panel borders |

---

## Reusable Components

### 1. Button Component (`~/components/ui/button.tsx`)

#### Variants for Dark Theme

**Cyan Button** - Primary action button
```tsx
<Button variant="cyan" className="rounded-xl px-6 py-2.5 text-sm font-bold">
  Action
</Button>
```
- Background: `#0e7490` (cyan-700)
- Text: white
- Hover: `#0891b2` (cyan-600) with glow
- Shadow: `shadow-lg shadow-cyan-500/20`
- WCAG AA compliant (4.7:1 contrast ratio)

**Glass Button** - Secondary action button
```tsx
<Button variant="glass" className="rounded-xl px-5 py-2.5 text-xs font-bold">
  Secondary Action
</Button>
```
- Background: `rgba(255, 255, 255, 0.03)` with backdrop-blur
- Text: `slate-300` → white on hover
- Border: `rgba(255, 255, 255, 0.07)`

### 2. GlassPanel Component (`~/components/ui/glass-panel.tsx`)

A reusable container with glassmorphism styling and optional colored glow.

```tsx
import { GlassPanel } from "~/components/ui/glass-panel";

// Cyan glow variant (default)
<GlassPanel variant="cyan" padding="md">
  Content here
</GlassPanel>

// Plain glass without glow
<GlassPanel variant="default" padding="lg">
  Content here
</GlassPanel>
```

#### Variants
| Variant | Border | Glow Shadow |
|---------|--------|-------------|
| `default` | `border-white/[0.07]` | none |
| `cyan` | `border-cyan-500/20` | `shadow-[0_0_15px_rgba(34,211,238,0.1)]` |
| `orange` | `border-orange-500/20` | `shadow-[0_0_15px_rgba(245,158,11,0.1)]` |
| `green` | `border-emerald-500/20` | `shadow-[0_0_15px_rgba(16,185,129,0.1)]` |
| `red` | `border-red-500/20` | `shadow-[0_0_15px_rgba(239,68,68,0.1)]` |

#### Padding Options
| Padding | Value |
|---------|-------|
| `none` | No padding |
| `sm` | `p-4` (16px) |
| `md` | `p-6` (24px) |
| `lg` | `p-8` (32px) |

---

## CSS Utility Classes

Located in `src/styles/app.css`:

### `.glass`
Base glassmorphism effect for panels and cards.
```css
.glass {
  backdrop-blur: 24px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(255, 255, 255, 0.03);
}
```

### `.sidebar-glass`
Heavier glassmorphism for sidebars.
```css
.sidebar-glass {
  backdrop-blur: 40px;
  border-right: 1px solid rgba(255, 255, 255, 0.04);
  background: rgba(13, 17, 26, 0.7);
}
```

### `.nav-active`
Active navigation item styling.
```css
.nav-active {
  background: linear-gradient(90deg, rgba(34, 211, 238, 0.12) 0%, transparent 100%);
  border-left: 3px solid #22d3ee;
  color: #fff;
}
```

### `.btn-cyan`
Cyan button styling (used by Button variant="cyan").
```css
.btn-cyan {
  background-color: #0e7490;
  color: white;
  font-weight: 900;
  transition: all 200ms;
}
.btn-cyan:hover {
  background-color: #0891b2;
  box-shadow: 0 0 15px rgba(14, 116, 144, 0.5);
}
```

### `.prism-bg`
Rainbow prism background effect.
```css
.prism-bg {
  position: fixed;
  inset: 0;
  z-index: -10;
  background:
    radial-gradient(circle at 10% 20%, rgba(34, 211, 238, 0.1) 0%, transparent 40%),
    radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 40%),
    radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.04) 0%, transparent 60%);
  filter: blur(80px);
  background-color: #0b101a;
}
```

### `.custom-scrollbar`
Styled scrollbar for dark theme.
```css
.custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
```

---

## Spacing & Layout

### Standard Spacing
| Name | Value | Tailwind | Usage |
|------|-------|----------|-------|
| xs | 4px | `gap-1`, `p-1` | Tight spacing |
| sm | 8px | `gap-2`, `p-2` | Small spacing |
| md | 16px | `gap-4`, `p-4` | Default spacing |
| lg | 24px | `gap-6`, `p-6` | Section spacing |
| xl | 32px | `gap-8`, `p-8` | Large section spacing |

### Border Radius
| Name | Value | Tailwind | Usage |
|------|-------|----------|-------|
| Default | 8px | `rounded-lg` | Buttons, small elements |
| Medium | 12px | `rounded-xl` | Cards, buttons |
| Large | 16px | `rounded-2xl` | Panels, major containers |

### Common Layout Patterns

**Page Container**
```tsx
<div className="flex w-full h-screen overflow-hidden bg-[#0b101a] text-slate-200">
  {/* Sidebar */}
  <aside className="hidden lg:flex h-full shrink-0 w-96">
    {/* Sidebar content */}
  </aside>

  {/* Main Content */}
  <main className="flex-1 flex flex-col min-w-0 h-full">
    {/* Header */}
    <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 bg-[#0b101a]/40 backdrop-blur-md">
      {/* Header content */}
    </header>

    {/* Scrollable Content */}
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8 space-y-6">
      {/* Page content */}
    </div>
  </main>
</div>
```

**Sidebar Width**
- Expanded: `w-96` (384px)
- Collapsed: `w-16` (64px)

---

## Typography

### Font Families
- **Sans-serif**: Inter (default body text)
- **Monospace**: JetBrains Mono (code, timestamps)

### Font Weights
| Name | Value | Tailwind | Usage |
|------|-------|----------|-------|
| Regular | 400 | `font-normal` | Body text |
| Medium | 500 | `font-medium` | Emphasis |
| Semibold | 600 | `font-semibold` | Subheadings |
| Bold | 700 | `font-bold` | Headings |
| Black | 900 | `font-black` | Primary buttons |

### Text Sizes
| Element | Size | Tailwind | Weight |
|---------|------|----------|--------|
| Page Title | 18px | `text-lg` | Bold |
| Section Label | 10px | `text-[10px]` | Black, uppercase, tracking-[0.2em] |
| Body Text | 14px | `text-sm` | Normal |
| Small Text | 12px | `text-xs` | Normal |
| Button Text | 12px | `text-xs` | Bold/Black |

---

## Interactive States

### Buttons
```
Default → Hover → Active → Disabled
```

**Cyan Button States**
- Default: `bg-[#0e7490]`
- Hover: `bg-[#0891b2]` + glow shadow
- Disabled: `opacity-50`, `pointer-events-none`

**Glass Button States**
- Default: `glass` + `text-slate-300`
- Hover: `bg-white/10` + `text-white`
- Disabled: `opacity-50`, `pointer-events-none`

### Navigation Items
- Default: `text-slate-400`
- Hover: `text-white` + `bg-white/5`
- Active: `.nav-active` class (cyan gradient + left border)

### Important: Cursor Pointer
All clickable elements MUST have `cursor-pointer` class:
```tsx
<button className="cursor-pointer ...">
```

---

## Icon Sizing

| Context | Size | Tailwind |
|---------|------|----------|
| Button icon | 16px | `w-4 h-4` |
| Small button icon | 14px | `w-3.5 h-3.5` |
| Navigation icon | 16px | `w-4 h-4` |
| Large decorative | 32px | `w-8 h-8` |

---

## Example: Building a New Panel

```tsx
import { GlassPanel } from "~/components/ui/glass-panel";
import { Button } from "~/components/ui/button";
import { FileText } from "lucide-react";

function MyNewPanel() {
  return (
    <GlassPanel variant="cyan" padding="md">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
          <FileText className="w-5 h-5 text-cyan-400" />
        </div>
        <h3 className="text-lg font-bold text-white">Panel Title</h3>
      </div>

      {/* Content */}
      <p className="text-slate-400 mb-6">
        Panel description text goes here.
      </p>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="glass" className="rounded-xl px-5 py-2.5 text-xs font-bold">
          Cancel
        </Button>
        <Button variant="cyan" className="rounded-xl px-6 py-2.5 text-xs font-bold">
          Confirm
        </Button>
      </div>
    </GlassPanel>
  );
}
```

---

## Accessibility Notes

1. **Color Contrast**: The cyan button (`#0e7490`) with white text meets WCAG AA (4.7:1 ratio)
2. **Focus States**: Buttons include `focus-visible:ring-2` for keyboard navigation
3. **Cursor**: All interactive elements must show `cursor-pointer`
4. **ARIA Labels**: Toggle buttons should include descriptive `aria-label` attributes

---

## Files Modified

### Core Components (Reusable)
- `src/components/ui/button.tsx` - Added `glass` and `cyan` variants
- `src/components/ui/glass-panel.tsx` - NEW reusable panel component with glow variants

### Styles
- `src/styles/app.css` - Added glassmorphism classes, updated `.btn-cyan` for accessibility

### Learn Route Components (Using Reusable Components)
- `src/routes/learn/$slug/_layout.tsx` - Main layout with collapsible sidebar
- `src/routes/learn/$slug/_layout.index.tsx` - Uses `<GlassPanel variant="cyan">` for video player
- `src/routes/learn/$slug/-components/video-controls.tsx` - Uses `<GlassPanel variant="cyan" padding="sm">`
- `src/routes/learn/$slug/-components/video-content-tabs-panel.tsx` - Uses `<GlassPanel variant="cyan">`
- `src/routes/learn/$slug/-components/video-header.tsx` - Header with action buttons
- `src/routes/learn/$slug/-components/comment-list.tsx` - Discussion empty state
- `src/routes/learn/$slug/-components/delete-segment-button.tsx` - Delete button styling
- `src/routes/learn/-components/desktop-navigation.tsx` - Sidebar with collapsed state
- `src/routes/learn/-components/mobile-navigation.tsx` - Mobile navigation
- `src/routes/learn/-components/new-module-button.tsx` - Inline button styling
- `src/routes/learn/-components/module-accordion-header.tsx` - Module toggle
- `src/routes/learn/-components/module-panel.tsx` - New segment button
- `src/routes/learn/-components/user-menu.tsx` - Removed theme toggle (moved to header)
- `src/routes/learn/course-completed.tsx` - Social buttons with glass variant

---

## Quick Reference: Applying to New Pages

### Step 1: Add Background
```tsx
<div className="bg-[#0b101a] text-slate-200 min-h-screen">
  <div className="prism-bg" /> {/* Rainbow gradient background */}
  {/* Page content */}
</div>
```

### Step 2: Use GlassPanel for Cards
```tsx
import { GlassPanel } from "~/components/ui/glass-panel";

<GlassPanel variant="cyan" padding="md">
  {/* Card content */}
</GlassPanel>
```

### Step 3: Use Button Variants
```tsx
import { Button } from "~/components/ui/button";

<Button variant="cyan">Primary Action</Button>
<Button variant="glass">Secondary Action</Button>
```

### Step 4: Apply Text Colors
- Headings: `text-white`
- Body: `text-slate-400`
- Muted: `text-slate-500`
- Disabled: `text-slate-600`

### Step 5: Add Scrollable Areas
```tsx
<div className="overflow-y-auto custom-scrollbar">
  {/* Scrollable content */}
</div>
```
