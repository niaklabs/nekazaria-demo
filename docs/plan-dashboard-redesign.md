# Plan: Dashboard Redesign — "Mi Explotacion" Home Screen

**Date:** 2026-03-18
**Status:** Draft — pending stakeholder review
**Design reference:** Pencil file `design-propossal-2.pen`, node `4cSKB` ("Consulta General Explotacion")

---

## Overview

Replace the current dashboard (greeting + 4 quick action cards) with an exploitation-centric home screen that shows the farmer their REGA identification, subexploitations by species, capacity, and key operational data at a glance. The sidebar already handles navigation to all features, so quick action cards are redundant.

**Target user:** Elderly livestock farmers in Bizkaia with low digital literacy, primarily on mobile.

---

## Design Decisions

| Decision | Rationale |
|---|---|
| Keep existing sidebar as-is | Already has all nav items (Dashboard, Scanner, Nacimiento, Normativa, Chat). No changes needed. |
| Remove quick action cards from dashboard | Sidebar covers navigation; the exploitation overview is more valuable real estate for a farmer's daily workflow. |
| Species filters work client-side | Small dataset per user (2-5 subexploitations typically). No need for server round-trips. |
| "Ver detalle" links are visual-only (v1) | No subexploitation detail page yet. Wired as placeholders for iteration. |
| Notification bell in header links to `/normativa` | Farmers need quick access to alerts/deadlines. Badge shows unread count. |
| Capacity bar color-coded | Red (>80% full), yellow (60-80%), green (<60%). Instant visual feedback on farm capacity. |
| Sustainability badge colors | Green = "ecologico", Yellow = "integrado", Gray = "convencional". Matches industry visual language. |
| Add location fields to Exploitation model | Design shows municipality + province. Currently missing from the model. |
| Show user's first exploitation | Most Bizkaia farmers have one exploitation. Multi-exploitation support can come later. |

---

## Implementation Steps

### Phase 1: Backend (Data Layer)

#### 1.1 Migration — Add location fields to `exploitations`
- Add columns: `municipality` (string, nullable), `province` (string, nullable)
- Run: `php artisan make:migration add_location_to_exploitations_table`

#### 1.2 Update Exploitation model
- Add `municipality`, `province` to `$fillable`

#### 1.3 Update DatabaseSeeder
- Set location data for demo exploitation: `municipality: "Bilbao"`, `province: "Bizkaia"`
- Ensure subexploitation data matches design (bovino produccion leche + ovino reproduccion carne)
- Update sustainability values to match design: bovino = "ecologico", ovino = "integrado"

#### 1.4 Create DashboardController
- `php artisan make:controller DashboardController --no-interaction`
- Load authenticated user's first exploitation with:
  - Eager-loaded subexploitations with animal counts (`withCount('animals')`)
  - Unread regulation count for notification badge
- Pass data to Inertia `dashboard` page

#### 1.5 Update route
- Replace inline `Inertia::render('dashboard')` with `DashboardController@index`

### Phase 2: Frontend (React Components)

#### 2.1 Create `ExploitationCard` component
- `resources/js/components/exploitation-card.tsx`
- Dark background card showing REGA code, warehouse icon, municipality + province
- Matches design: white text, `DM Sans` font equivalent (use system font stack or existing project font)

#### 2.2 Create `SpeciesFilter` component
- `resources/js/components/species-filter.tsx`
- Horizontal scrollable chip row
- Active chip: red background (`#E53935`), white text
- Inactive chip: white background, black border, black text
- Species derived from user's actual subexploitations (not hardcoded)
- "Todos" chip added as first option to show all
- Client-side state with `useState`

#### 2.3 Create `SubExploitationCard` component
- `resources/js/components/sub-exploitation-card.tsx`
- **Header:** Species + exploitation type, colored by species (bovino = red `#E53935`, ovino/caprino = black, porcino = dark gray, equino = brown)
- **Body:**
  - Row: "Sistema productivo" → value
  - Row: "Capacidad" → `current / max` with progress bar (color-coded)
  - Row: Sustainability badge + "Autoconsumo: SI/NO" badge
  - Divider
  - Footer: "Censo: X animales" + "Ver detalle >" link

#### 2.4 Create `NotificationBell` component
- `resources/js/components/notification-bell.tsx`
- Bell icon with red badge showing unread regulation count
- Links to `/normativa`

#### 2.5 Rewrite `dashboard.tsx` page
- **Header area:** "Mi Explotacion" title + province subtitle + NotificationBell
- **REGA Card:** ExploitationCard component
- **Filter section:** "FILTRAR POR ESPECIE" label + SpeciesFilter
- **Subexploitations section:** "SUBEXPLOTACIONES" label + filtered SubExploitationCard list
- Scrollable content area, mobile-first layout
- All data comes from Inertia props (no client-side fetching)

### Phase 3: Testing

#### 3.1 Feature test — DashboardController
- Test authenticated user sees exploitation data
- Test user without exploitation sees empty state
- Test unread regulation count is correct

#### 3.2 Run Pint
- `vendor/bin/pint --dirty --format agent`

---

## Files Modified

| File | Action |
|---|---|
| `database/migrations/xxxx_add_location_to_exploitations_table.php` | **Create** |
| `app/Models/Exploitation.php` | **Edit** — add fillable fields |
| `database/seeders/DatabaseSeeder.php` | **Edit** — add location + adjust sustainability |
| `app/Http/Controllers/DashboardController.php` | **Create** |
| `routes/web.php` | **Edit** — use DashboardController |
| `resources/js/components/exploitation-card.tsx` | **Create** |
| `resources/js/components/species-filter.tsx` | **Create** |
| `resources/js/components/sub-exploitation-card.tsx` | **Create** |
| `resources/js/components/notification-bell.tsx` | **Create** |
| `resources/js/pages/dashboard.tsx` | **Rewrite** |
| `tests/Feature/DashboardTest.php` | **Create** |

---

## Out of Scope (Future Iterations)

- Subexploitation detail page (behind "Ver detalle")
- Multi-exploitation support / exploitation switcher
- Real notification system (currently just links to normativa)
- Animal list within subexploitation
- Map view of exploitation location
- Porcino/Equino species support in seeders (only bovino + ovino seeded)

---

## Notes for Stakeholder Review

- This is a **demo-grade** implementation with mocked data
- All data comes from existing seeders — no external API integration
- The sidebar remains the primary navigation; the dashboard becomes an operational overview
- Mobile-first: designed for the farmer's phone, scales up to desktop via existing sidebar layout
- Species filter chips only show species the farmer actually has (no empty categories)
