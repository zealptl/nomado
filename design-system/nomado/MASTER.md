# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Nomado
**Generated:** 2026-04-18
**Category:** Collaborative Travel Itinerary Planner

---

## Global Rules

### Color Palette

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary (pop) | `#5C7A5F` | `--color-primary` |
| Secondary | `#C67B5C` | `--color-secondary` |
| Accent | `#D4C4A8` | `--color-accent` |
| Background | `#F5F0E1` | `--color-background` |
| Text | `#2C1A0E` | `--color-text` |
| Muted Text | `#7C6A5A` | `--color-text-muted` |
| Glass Surface | `rgba(255,255,255,0.6)` | `--color-surface` |
| Glass Border | `rgba(255,255,255,0.3)` | `--color-border` |

**Color Notes:** Warm cream base + sage green primary pop. Earth tones throughout. Light mode only.

### Typography

- **Heading Font:** Playfair Display
- **Body Font:** Inter
- **Mood:** warm, elegant, editorial, clean, readable
- **Google Fonts:** [Playfair Display + Inter](https://fonts.google.com/share?selection.family=Inter:wght@300;400;500;600;700|Playfair+Display:wght@400;500;600;700)

**CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
```

**Usage:**
```css
h1, h2, h3, h4 { font-family: 'Playfair Display', serif; }
body, p, span, input, button { font-family: 'Inter', sans-serif; }
```

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(44,26,14,0.06)` | Subtle lift |
| `--shadow-md` | `0 4px 12px rgba(44,26,14,0.08)` | Cards, buttons |
| `--shadow-lg` | `0 10px 32px rgba(92,122,95,0.12)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 48px rgba(44,26,14,0.12)` | Hero images, featured cards |

---

## Style: Glassmorphism on Warm Earth Base

Frosted glass cards floating over a warm cream background. Clean, calm, and inviting.

**Key Effects:**
```css
/* Glass card */
.glass-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(44, 26, 14, 0.08);
}

/* Warm background base */
body {
  background-color: #F5F0E1;
  background-image: radial-gradient(ellipse at 20% 50%, rgba(214,196,168,0.3) 0%, transparent 60%),
                    radial-gradient(ellipse at 80% 20%, rgba(92,122,95,0.1) 0%, transparent 50%);
}
```

---

## Component Specs

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: #5C7A5F;
  color: white;
  padding: 12px 24px;
  border-radius: 10px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 14px;
  transition: all 200ms ease;
  cursor: pointer;
  border: none;
}

.btn-primary:hover {
  background: #4A6550;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(92,122,95,0.3);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #5C7A5F;
  border: 1.5px solid #5C7A5F;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-secondary:hover {
  background: rgba(92,122,95,0.08);
}
```

### Cards

```css
.card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(44,26,14,0.08);
  transition: all 200ms ease;
  cursor: pointer;
}

.card:hover {
  box-shadow: 0 12px 40px rgba(44,26,14,0.12);
  transform: translateY(-2px);
}
```

### Inputs

```css
.input {
  padding: 12px 16px;
  border: 1px solid rgba(124,106,90,0.25);
  border-radius: 10px;
  background: rgba(255,255,255,0.7);
  font-size: 16px;
  font-family: 'Inter', sans-serif;
  color: #2C1A0E;
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: #5C7A5F;
  outline: none;
  box-shadow: 0 0 0 3px rgba(92,122,95,0.15);
}
```

### Modals

```css
.modal-overlay {
  background: rgba(44, 26, 14, 0.3);
  backdrop-filter: blur(4px);
}

.modal {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.4);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(44,26,14,0.15);
  max-width: 500px;
  width: 90%;
}
```

### Tags / Pills

```css
.pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
  background: rgba(92,122,95,0.12);
  color: #5C7A5F;
  border: 1px solid rgba(92,122,95,0.2);
  cursor: pointer;
  transition: all 150ms ease;
}

.pill.active {
  background: #5C7A5F;
  color: white;
  border-color: #5C7A5F;
}
```

---

## Page Pattern

**Split panel layout (desktop):** Left nav panel (fixed, ~280px) + right scrollable content panel.
**Mobile:** Two tabs — "Overview" | "Days" — stacked full-width.

---

## Anti-Patterns (Do NOT Use)

- ❌ Dark mode — light mode only
- ❌ Coral/orange primary — already used by Wanderlog
- ❌ Heavy information density — keep things hidden until needed
- ❌ Generic stock photos — user uploads their own
- ❌ Emojis as icons — use SVG icons (Lucide, Heroicons)
- ❌ Missing cursor:pointer — all clickable elements must have it
- ❌ Layout-shifting hovers — avoid scale transforms that shift layout
- ❌ Low contrast text — maintain 4.5:1 minimum ratio
- ❌ Instant state changes — always use transitions (150-300ms)
- ❌ Invisible focus states — must be visible for accessibility

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from Lucide or Heroicons
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
- [ ] Glass cards use `backdrop-filter: blur(15px)` with rgba background
- [ ] Playfair Display for headings, Inter for body
