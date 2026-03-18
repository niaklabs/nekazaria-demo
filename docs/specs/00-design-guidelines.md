# NekazarIA Demo — Design Guidelines

Extracted from the Pencil `.pen` design file (`design-propossal-2.pen`) with 37 screens.

---

## Screen Structure (Mobile-First PWA)

All screens follow a consistent vertical layout:

```
┌──────────────────────────┐
│ Status Bar (h: 54-62px)  │  padding: [14, 24, 0, 24]
├──────────────────────────┤
│ Navigation Bar           │  padding: [0, 24] or [12, 24]
├──────────────────────────┤
│ Progress Bar (wizards)   │  padding: [0, 24] or [16, 24]
├──────────────────────────┤
│ Content (fill_container) │  padding: [16, 24, 24, 24]
│                          │  layout: vertical
│                          │  gap: 16-24
├──────────────────────────┤
│ Bottom Bar (optional)    │  padding: [16, 24, 24, 24]
└──────────────────────────┘
```

- **Frame width**: 402px (mobile viewport)
- **Frame height**: 874px (standard), varies by content (664-1480px)
- **Background**: `#FFFFFF`
- **Clip**: `true` on all screens
- **Layout**: `vertical` on all screens

---

## Typography

**Font Family**: `DM Sans` (Google Font — clean, geometric, highly readable)

| Role | Size | Weight | Letter Spacing |
|------|------|--------|----------------|
| Screen title | 24px | 700 (Bold) | — |
| Section label (uppercase) | 12px | 600 (SemiBold) | 2px |
| Body text / descriptions | 14px | 500 (Medium) | — |
| Status bar time | 17px | 600 (SemiBold) | — |
| Step badge text | 14px | 700 (Bold) | — |
| Card content | 14-16px | 500-600 | — |
| Small labels | 12px | 500-600 | — |

**Line height**: 1.4 for multi-line body text

**Text wrapping**: Use `textGrowth: "fixed-width"` with `width: "fill_container"` for descriptive text

---

## Color Palette

### Core Colors
| Usage | Color | Hex |
|-------|-------|-----|
| Background | White | `#FFFFFF` |
| Primary text | Black | `#000000` |
| Secondary text | Gray | `#757575` |
| Surface / Input background | Light Gray | `#F5F5F5` |
| Primary action (CTA) | Red | `#E53935` |
| Success background | Light Green | `#E8F5E9` |
| Success text/icon | Green | `#4CAF50` / `#2E7D32` |
| Warning background | Light Amber | `#FFF3E0` |
| Warning text | Amber | `#E65100` |
| Error/Urgent | Red | `#E53935` |
| Info | Blue | `#1565C0` |
| Scanner dark UI | Dark | `#1A1A1A` / `#2A2A2A` |

### Semantic Colors (for Regulations/Alerts)
| Severity | Badge BG | Text |
|----------|----------|------|
| Urgent | `#E53935` | `#FFFFFF` |
| Warning | `#FFF3E0` | `#E65100` |
| Info | `#E3F2FD` | `#1565C0` |
| Success | `#E8F5E9` | `#2E7D32` |

---

## Spacing System

| Token | Value | Usage |
|-------|-------|-------|
| Content padding | 24px | Left/right content padding on all screens |
| Content top padding | 16px | Top padding in content area |
| Section gap | 20-24px | Between major sections |
| Element gap | 8-16px | Between related elements |
| Card padding | 12-16px | Internal card padding |
| Input padding | 18px horizontal | Search/input fields |
| Button padding | 18px | Primary action buttons |
| Badge padding | [4, 10] | Step/status badges |

---

## Components Pattern Library

### Primary Button (CTA)
```
fill: #E53935
padding: 18
width: fill_container
justifyContent: center
alignItems: center
gap: 8
text: white, DM Sans, 16px, 700
```

### Secondary Button (Outlined)
```
stroke: { fill: "#000000", thickness: 2 }
padding: 18
width: fill_container
justifyContent: center
alignItems: center
text: black, DM Sans, 16px, 600
```

### Input Field / Search Bar
```
fill: #F5F5F5
height: 52
padding: [0, 18]
alignItems: center
gap: 14 (for icon + text)
cornerRadius: 0 (sharp corners throughout the design)
```

### Card (with border)
```
stroke: { fill: "#000000", thickness: 2 }
layout: vertical
width: fill_container
clip: true (optional)
```

### Info Card (colored background)
```
fill: #F5F5F5 (neutral) or #E8F5E9 (success) or #FFF3E0 (warning)
padding: 12
gap: 8
alignItems: center
width: fill_container
```

### Step Badge
```
fill: #E53935
padding: [4, 10]
text: white, DM Sans, 14px, 700
```

### Progress Bar
```
height: 4
gap: 4
width: fill_container
children: segments with fill #E53935 (active) or #E0E0E0 (inactive)
```

### Section Label (Uppercase)
```
content: "UPPERCASE LABEL"
fill: #757575
fontFamily: DM Sans
fontSize: 12
fontWeight: 600
letterSpacing: 2
```

### Navigation Bar
```
padding: [0, 24]
alignItems: center
gap: 8
justifyContent: space_between (when has right element)
```

---

## Chat/Chatbot UI Pattern

From the NekazarIA chat screens:

### Chat Header
```
fill: #FFFFFF
height: 56
padding: [0, 16]
gap: 12
alignItems: center
stroke: { align: "inside", fill: "#000000", thickness: { bottom: 2 } }
```

### Chat Area
```
padding: 16-24
gap: 16-24
layout: vertical
fill: #FFFFFF
```

### Chat Bottom Input
```
fill: #FFFFFF
height: 60
padding: [0, 16]
gap: 12
alignItems: center
stroke: { align: "inside", fill: "#000000", thickness: { top: 2 } }
```

---

## Krotal Scanner UI Pattern

From the scanner screens:

### Camera Mode
```
fill: #1A1A1A (screen background)
Camera BG: fill: #2A2A2A
stroke: { fill: "#000000", thickness: 2 } on outer frame
```

### Scanner Success / Error
```
Standard white screen layout
Success: green tones (#E8F5E9, #4CAF50)
Error: content area with tips list
```

---

## Regulations / Alerts (Aurreikus) Pattern

From the Aurreikus (anticipation) screens:

### Timeline Screen
```
Tab Bar at bottom: cornerRadius: 100, fill: #F5F5F5, height: 83
padding: [12, 21, 21, 21], justifyContent: space_around
```

### Event Detail
```
Vertical layout with gap: 24
Content padding: [0, 24]
```

---

## Key Design Principles (from the .pen file analysis)

1. **No border radius** — All cards, inputs, and buttons use sharp corners (cornerRadius: 0). This gives a bold, utilitarian feel appropriate for a farming/government app.

2. **Black borders** — Cards and containers use `stroke: { fill: "#000000", thickness: 2 }` instead of shadows. Strong, clear boundaries.

3. **Red as primary action** — `#E53935` is the single action color. Used for CTAs, step badges, and progress indicators.

4. **Monochrome + Red** — The palette is essentially black/white/gray + red. Green only for success states, amber for warnings.

5. **Dense but readable** — Content areas use gap: 16-24px. Not overly spacious, but clear hierarchy via typography weight.

6. **Mobile-first 402px** — All designs target mobile viewport. The PWA should match this.

7. **DM Sans everywhere** — Single font family, hierarchy through size and weight only.

8. **Fill container pattern** — Most elements use `width: fill_container` for responsive behavior.

9. **Consistent structure** — Every screen follows: Status Bar → Nav → Content. No exceptions.

10. **WhatsApp-like chat** — Chat screens use bordered header/footer with content area between, familiar messaging pattern.

---

## Tailwind CSS Mapping

For implementation in the Laravel + Inertia + React PWA:

```css
/* tailwind.config / CSS custom properties */
--color-primary: #E53935;
--color-bg: #FFFFFF;
--color-surface: #F5F5F5;
--color-text: #000000;
--color-text-secondary: #757575;
--color-success: #E8F5E9;
--color-success-text: #2E7D32;
--color-warning: #FFF3E0;
--color-warning-text: #E65100;
--color-info: #E3F2FD;
--color-info-text: #1565C0;
--color-scanner-bg: #1A1A1A;

--font-family: 'DM Sans', sans-serif;
--radius: 0; /* Sharp corners throughout */
--border: 2px solid #000000;
```

### Key Tailwind Classes
```
/* Primary button */
bg-[#E53935] text-white font-bold text-base py-[18px] w-full text-center

/* Secondary button */
border-2 border-black text-black font-semibold text-base py-[18px] w-full text-center

/* Input field */
bg-[#F5F5F5] h-[52px] px-[18px] flex items-center gap-[14px] w-full

/* Card */
border-2 border-black w-full

/* Section label */
text-xs font-semibold text-[#757575] tracking-[2px] uppercase

/* Screen title */
text-2xl font-bold text-black

/* Body text */
text-sm font-medium text-[#757575] leading-[1.4]

/* Content wrapper */
px-6 pt-4 pb-6 flex flex-col gap-5
```
