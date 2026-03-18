# Feature Spec: Regulations Screen (Anticipación Normativa)

## Overview

A dashboard screen that shows the farmer proactive alerts, upcoming deadlines, and regulatory notifications related to their exploitation. This is the "anticipation engine" of NekazarIA — the system that analyzes exploitation data and surfaces actionable information before the farmer has to go looking for it.

For the demo: fully mocked alerts and regulations data, seeded in the database, presented in a realistic UI that demonstrates the value proposition to the Diputación.

**Target audience**: Diputación Foral de Bizkaia demo presentation.

---

## Demo Scope

| Aspect | Approach |
|--------|----------|
| Alert data | Seeded — pre-created alerts in the DB |
| Rule engine | Not implemented — alerts are static/seeded |
| Real-time updates | Not implemented — static data |
| Notification delivery | Not implemented — only in-app display |
| Actions from alerts | Navigation links to relevant pages (wizard, scanner, animal detail) |

---

## Data Model

### `Regulation` (Normativa / Alerta)
| Field | Type | Description |
|-------|------|-------------|
| id | bigint | PK |
| exploitation_id | FK → exploitations | |
| type | enum | See alert types below |
| severity | enum | info, warning, urgent |
| title | string | Short title |
| description | text | Detailed explanation in simple language |
| action_label | string nullable | CTA button text, e.g. "Ver animales pendientes" |
| action_url | string nullable | Where the CTA navigates to |
| due_date | date nullable | Deadline if applicable |
| is_read | boolean | Has the farmer seen it |
| is_resolved | boolean | Has the action been completed |
| metadata | json nullable | Extra data (animal IDs, campaign info, etc.) |
| created_at / updated_at | timestamps | |

### Alert Types (enum)

| Type | Description | Severity |
|------|-------------|----------|
| `sanitary_campaign` | Active sanitary campaign with pending animals | warning |
| `animal_immobilized` | Animal blocked due to sanitary issue | urgent |
| `birth_deadline` | Animals pending birth registration within legal deadline | warning |
| `census_reminder` | Annual census declaration reminder | info |
| `subsidy_open` | Relevant subsidy/grant open for applications | info |
| `movement_pending` | Movement guide pending validation | warning |
| `document_expiring` | Stable book or certificate about to expire | warning |
| `capacity_warning` | Sub-exploitation approaching max capacity | info |

### Seeder Data (Demo Scenarios)

Seed **8-10 alerts** covering different types and severities to demonstrate the full range:

1. **URGENT**: "2 animales inmovilizados por campaña BVD 2026" → action: "Ver cómo resolverlo"
2. **WARNING**: "La campaña BVD 2026 termina el 10/06. Te quedan 5 animales pendientes de muestreo." → action: "Ver animales pendientes"
3. **WARNING**: "3 nacimientos pendientes de comunicar antes del 25/03" → action: "Comunicar nacimiento"
4. **WARNING**: "Guía de movimiento GM-2026-048-00198 pendiente de validación" → action: "Ver estado"
5. **INFO**: "Convocatoria abierta: Ayudas a la ganadería ecológica 2026" → action: "Ver detalles"
6. **INFO**: "Declaración de censo anual pendiente para subexplotación avícola" → action: "Declarar censo"
7. **WARNING**: "Libro de establo caduca el 15/04/2026" → action: "Solicitar renovación"
8. **INFO**: "Subexplotación bovina al 90% de capacidad (45/50)" → action: "Ver subexplotación"

---

## Screen Layout

### Main Regulations Screen (`/normativa`)

#### Header Section
- **Page title**: "Mis Alertas y Normativa"
- **Summary badges** (horizontal scroll on mobile):
  - Red badge: X urgent alerts
  - Yellow badge: X warnings
  - Blue badge: X info
- **Filter tabs**: "Todas" | "Pendientes" | "Resueltas"

#### Alert Cards (Main Content)

Each alert is a card with:

```
┌─────────────────────────────────────────┐
│ 🔴 URGENTE                    hace 2h   │
│                                         │
│ 2 animales inmovilizados — BVD 2026     │
│                                         │
│ Tienes 2 animales bloqueados por la     │
│ campaña sanitaria BVD. Para             │
│ desbloquearlos debes completar el       │
│ muestreo.                               │
│                                         │
│ [Ver cómo resolverlo →]                 │
│                                         │
│ Vence: 10 junio 2026                    │
└─────────────────────────────────────────┘
```

**Card elements**:
- **Severity badge**: Color-coded (red/yellow/blue) with icon
- **Timestamp**: Relative time ("hace 2h", "ayer", "hace 3 días")
- **Title**: Bold, concise
- **Description**: 2-3 lines in simple language (no jargon)
- **Action button**: If action_url exists, show CTA button
- **Due date**: If applicable, show with countdown ("quedan 12 días")
- **Read indicator**: Unread cards have a left border accent + slightly different background
- **Resolve action**: Swipe or button to mark as resolved

#### Empty State
When all alerts are resolved:
- Illustration of a relaxed farmer
- "Todo al día. No tienes alertas pendientes."
- "Te avisaremos cuando haya algo nuevo."

---

## Sanitary Campaign Detail (Sub-screen)

When a farmer taps on a sanitary campaign alert, show a dedicated detail view:

### Campaign Detail (`/normativa/campanas/{id}`)

- **Campaign name**: "Campaña BVD 2026"
- **Status badge**: "En proceso" / "Completa"
- **Progress bar**: X/Y animales muestreados (e.g., 7/12)
- **Lists**:
  - **Pendientes de muestreo**: Animal cards with crotal, breed, age
  - **Muestreados**: Same cards, with green checkmark
  - **Inmovilizados**: Cards with red badge + reason in simple language + "Resolver" button
- **Action**: "Contactar veterinario" (mocked — just shows a phone number)

This is a separate seeded model for the demo:

### `SanitaryCampaign`
| Field | Type | Description |
|-------|------|-------------|
| id | bigint | PK |
| exploitation_id | FK | |
| name | string | e.g. "BVD 2026" |
| status | enum | in_progress, completed |
| start_date | date | |
| end_date | date | |
| total_animals | integer | |
| sampled_animals | integer | |

### `CampaignAnimal` (pivot)
| Field | Type | Description |
|-------|------|-------------|
| id | bigint | PK |
| sanitary_campaign_id | FK | |
| animal_id | FK | |
| status | enum | pending, sampled, immobilized |
| immobilization_reason | string nullable | In simple language |

---

## Technical Implementation

### Backend (Laravel)

| Component | Details |
|-----------|---------|
| **Controller** | `RegulationController` with `index`, `show` methods |
| **Controller** | `SanitaryCampaignController` with `show` method |
| **Routes** | `GET /normativa` → regulations index, `GET /normativa/campanas/{campaign}` → campaign detail |
| **API** | `PATCH /api/regulations/{id}/read` → mark as read, `PATCH /api/regulations/{id}/resolve` → mark as resolved |

### Frontend (Inertia + React)

| Component | Details |
|-----------|---------|
| **Page** | `resources/js/pages/normativa/index.tsx` |
| **Page** | `resources/js/pages/normativa/campanas/show.tsx` |
| **Components** | `AlertCard.tsx`, `SeverityBadge.tsx`, `AlertFilters.tsx`, `CampaignProgress.tsx` |
| **State** | Optimistic updates for read/resolve actions |

### i18n Keys

All strings under `regulations.*` namespace:
- `regulations.title`: "Mis Alertas y Normativa"
- `regulations.filter_all`: "Todas"
- `regulations.filter_pending`: "Pendientes"
- `regulations.filter_resolved`: "Resueltas"
- `regulations.severity.urgent`: "Urgente"
- `regulations.severity.warning`: "Atención"
- `regulations.severity.info`: "Información"
- `regulations.empty_state`: "Todo al día. No tienes alertas pendientes."
- `regulations.due_in`: "Quedan {days} días"
- `regulations.campaign.*`: Campaign-specific strings

---

## UI/UX Guidelines

- **Color system**: Red (#EF4444) for urgent, Yellow (#F59E0B) for warning, Blue (#3B82F6) for info
- **Cards should feel like WhatsApp messages**: Familiar, simple, scannable
- **Description language**: "Tienes 2 animales bloqueados" not "2 registros con estado INMOVILIZADO en campaña sanitaria código BVD-2026-048"
- **Countdown urgency**: As due dates approach, card styling becomes more prominent
- **Badge count on navigation**: Show unread count on the nav item (red dot + number)
- **Mobile-first**: Cards stack vertically, full width

---

## Dashboard Integration

The main dashboard should show a **summary widget** with:
- Count of unread alerts by severity
- Latest 2-3 urgent/warning alerts
- "Ver todas las alertas" link

---

## Out of Scope (Demo)

- Real rule engine (event-driven alert generation)
- Push notifications (FCM/SMS)
- WhatsApp channel integration
- Backoffice rule configuration
- Real-time alert updates via WebSocket
- Multi-exploitation alerts (demo has 1 exploitation)
