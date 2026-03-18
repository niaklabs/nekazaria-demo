# Task: Boilerplate Cleanup & NekazarIA Theming

## Objective

Strip the Laravel React Starter Kit boilerplate down to what NekazarIA needs, and apply the design system from the `.pen` file as the base theme. This is the foundation step before implementing any feature.

---

## Phase 1: Cleanup — Remove / Modify Boilerplate

### 1.1 Remove Unnecessary Pages

| Page | Action |
|------|--------|
| `welcome.tsx` | **Replace** with redirect to `/dashboard` (or login if unauthenticated) |
| `settings/appearance.tsx` | **Remove** — no dark mode for demo, single theme |
| `settings/security.tsx` | **Keep but simplify** — remove 2FA UI for demo |
| `settings/profile.tsx` | **Keep** — farmers may need basic profile |

### 1.2 Simplify Navigation

**Current sidebar** has: Dashboard, Repository link, Documentation link.

**Replace with NekazarIA navigation:**

| Item | Icon | Route | Badge |
|------|------|-------|-------|
| Mi Explotación | `Home` | `/dashboard` | — |
| Escanear Crotal | `Camera` | `/scanner` | — |
| Comunicar Nacimiento | `Baby` | `/nacimientos/crear` | — |
| Normativa | `Bell` | `/normativa` | Unread count (red dot) |
| NekazarIA Chat | `MessageCircle` | `/chat` | — |

**Footer:** Remove external links. Keep user menu.

### 1.3 Update Dashboard

Replace the current gradient welcome screen with a NekazarIA-appropriate dashboard:
- Greeting: "Hola, {firstName}!" (keep)
- Date in Spanish (keep)
- Quick actions grid: 4 cards linking to the 4 main features
- Alert summary widget (from regulations — latest 2-3 alerts)
- Exploitation summary card (REGA code, sub-exploitation count, animal count)

### 1.4 Remove Dark Mode

- Remove `useAppearance()` hook usage (or keep hook but lock to light mode)
- Remove dark mode CSS variables from `app.css`
- Remove appearance settings page and route
- The `.pen` designs are all white/light — no dark mode in the demo

### 1.5 Clean Routes

**Remove:**
- `GET /` welcome page → redirect to dashboard
- Appearance settings route

**Keep:**
- Auth routes (Fortify)
- Dashboard
- Profile settings

**Will add later (during feature implementation):**
- `/nacimientos/crear` — Birth wizard
- `/scanner` — Krotal scanner
- `/normativa` — Regulations
- `/normativa/campanas/{campaign}` — Campaign detail
- `/chat` — Chatbot
- `/api/animals/by-crotal/{code}` — Animal lookup
- `/api/animals/random-crotal` — Mock OCR
- `/api/regulations/{id}/read` — Mark alert read
- `/api/regulations/{id}/resolve` — Mark alert resolved
- `/chat/messages` — Send chat message

---

## Phase 2: Theming — Apply NekazarIA Design System

### 2.1 Font Change

**Current**: Instrument Sans (via Bunny Fonts)
**Target**: DM Sans (Google Font)

- Update font import in `app.blade.php` or font configuration
- Change CSS `--font-sans` to `'DM Sans', sans-serif`

### 2.2 Color System Override

Replace the current OKLch shadcn color scheme with NekazarIA colors in `app.css`:

```css
:root {
  /* NekazarIA Color System */
  --background: #FFFFFF;
  --foreground: #000000;
  --card: #FFFFFF;
  --card-foreground: #000000;
  --popover: #FFFFFF;
  --popover-foreground: #000000;
  --primary: #E53935;
  --primary-foreground: #FFFFFF;
  --secondary: #F5F5F5;
  --secondary-foreground: #000000;
  --muted: #F5F5F5;
  --muted-foreground: #757575;
  --accent: #F5F5F5;
  --accent-foreground: #000000;
  --destructive: #E53935;
  --destructive-foreground: #FFFFFF;
  --border: #000000;
  --input: #F5F5F5;
  --ring: #E53935;
  --radius: 0px;

  /* Semantic alert colors */
  --success: #E8F5E9;
  --success-foreground: #2E7D32;
  --warning: #FFF3E0;
  --warning-foreground: #E65100;
  --info: #E3F2FD;
  --info-foreground: #1565C0;

  /* Sidebar (reuse main colors) */
  --sidebar-background: #FFFFFF;
  --sidebar-foreground: #000000;
  --sidebar-primary: #E53935;
  --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: #F5F5F5;
  --sidebar-accent-foreground: #000000;
  --sidebar-border: #000000;
}
```

### 2.3 Border Radius = 0

The `.pen` designs use **no border radius** anywhere. Override shadcn defaults:

```css
:root {
  --radius: 0px;
}
```

This will affect all shadcn components (Button, Card, Input, etc.) since they use `rounded-[var(--radius)]`.

### 2.4 Border Style

The design uses `2px solid black` borders instead of subtle gray borders:

- Update `--border` to `#000000`
- Consider adding a utility class or updating shadcn `Card` component to use `border-2` instead of `border`

### 2.5 Typography Utilities

Add custom utility classes or Tailwind theme extensions:

```css
/* In app.css or as Tailwind utilities */
.text-section-label {
  @apply text-xs font-semibold text-[#757575] tracking-[2px] uppercase;
}

.text-screen-title {
  @apply text-2xl font-bold text-black;
}

.text-body {
  @apply text-sm font-medium text-[#757575] leading-[1.4];
}
```

### 2.6 Button Variants

Update shadcn Button component or add NekazarIA-specific variants:

- **Primary**: `bg-[#E53935] text-white font-bold py-[18px] w-full border-0`
- **Secondary/Outline**: `border-2 border-black text-black font-semibold py-[18px] w-full bg-transparent`
- **Ghost**: Keep for nav items

### 2.7 Logo & Branding

- Replace the default Laravel logo in `app-logo.tsx` and `app-logo-icon.tsx`
- Use "NekazarIA" text or a simple icon placeholder
- Update `manifest.json` name (already "Nekarzaria" — keep)
- Update page titles to "NekazarIA"

---

## Phase 3: i18n Setup

### 3.1 Backend (Laravel)

Create `lang/es.json` with initial translations:

```json
{
  "dashboard.greeting": "Hola, :name!",
  "dashboard.welcome": "Bienvenido a NekazarIA",
  "nav.exploitation": "Mi Explotación",
  "nav.scanner": "Escanear Crotal",
  "nav.birth": "Comunicar Nacimiento",
  "nav.regulations": "Normativa",
  "nav.chat": "NekazarIA Chat"
}
```

### 3.2 Frontend (Inertia Shared Data)

Share translations with all Inertia pages via `HandleInertiaRequests` middleware:

```php
public function share(Request $request): array
{
    return [
        ...parent::share($request),
        'locale' => app()->getLocale(),
        'translations' => fn () => $this->getTranslations(),
    ];
}
```

### 3.3 React Translation Hook

Create a simple `useTranslation()` hook:

```typescript
// resources/js/hooks/use-translation.ts
export function useTranslation() {
    const { translations, locale } = usePage<SharedData>().props;

    function t(key: string, replacements?: Record<string, string>): string {
        let text = translations[key] ?? key;
        if (replacements) {
            Object.entries(replacements).forEach(([k, v]) => {
                text = text.replace(`:${k}`, v);
            });
        }
        return text;
    }

    return { t, locale };
}
```

---

## Phase 4: Base Models & Seeders (Shared Foundation)

These models are needed by ALL 4 features. Create them during this cleanup phase:

### Models to Create
1. `Exploitation` — with factory + seeder
2. `SubExploitation` — with factory + seeder
3. `Animal` — with factory + seeder

### Seeder Strategy

`DatabaseSeeder` creates:
- 1 demo user (email: `demo@nekazaria.eus`, password: `password`)
- 1 exploitation (REGA: `ES048012300001`, name: "Baserri Etxeberri")
- 2 sub-exploitations:
  - Bovine: "Producción de leche", capacity 45/50, Extensivo
  - Ovine: "Producción de carne", capacity 22/30, Mixto
- 10 bovine animals (6 female, 4 male, mixed breeds: Pirenaica, Asturiana, Rubia Gallega)
- 8 ovine animals (5 female, 3 male, breeds: Latxa, Carranzana)

This gives enough data for all 4 demo features to work with.

---

## Execution Order

1. Font change (DM Sans)
2. Color system override in `app.css`
3. Border radius = 0
4. Remove dark mode
5. Update navigation items
6. Replace welcome page
7. Update dashboard
8. Clean routes
9. Logo/branding update
10. Create base models + migrations
11. Create seeders + run seed
12. i18n setup (backend + frontend hook)
13. Run Pint + tests

---

## Out of Scope

- Feature-specific models (BirthRegistration, Regulation, ChatMessage, etc.) — created during each feature's implementation
- Feature-specific pages and routes — created during each feature's implementation
- Production optimizations
