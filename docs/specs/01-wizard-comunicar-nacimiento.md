# Feature Spec: Wizard — Comunicar Nacimiento (Birth Registration)

## Overview

Multi-step wizard that allows a livestock farmer to register the birth of a new animal (bovine, ovine, caprine, equine) through a guided flow. For the demo, this wizard uses mocked MUGIDE data but follows the real business logic and validation rules described in the functional spec.

**Target audience**: Diputación Foral de Bizkaia demo presentation.

---

## Demo Scope (What We Build)

| Aspect | Approach |
|--------|----------|
| Data source | Seeded Laravel models (mocked MUGIDE data) |
| Form submission | Persists to local DB, no real SEDE/MUGIDE integration |
| Validation | Real business rules (capacity check, legal deadline, active mother) |
| i18n | Spanish first, using i18n files for future EU/EN support |
| Auth | Uses existing Fortify auth (mocked Giltza for demo) |

---

## Data Model (Laravel Models + Seeders)

### Models Required

#### `Exploitation` (Explotación)
| Field | Type | Description |
|-------|------|-------------|
| id | bigint | PK |
| user_id | FK → users | Owner |
| rega_code | string | REGA code (ES + 48 + municipality + 7 digits) |
| name | string | Farm name |
| created_at / updated_at | timestamps | |

#### `SubExploitation` (Subexplotación)
| Field | Type | Description |
|-------|------|-------------|
| id | bigint | PK |
| exploitation_id | FK → exploitations | Parent |
| species | enum | bovine, ovine, caprine, equine, porcine, avian, cunicular, apicultural, piscicultural |
| exploitation_type | string | e.g. "Producción de leche" |
| zootechnical_classification | string | e.g. "Producción" |
| productive_system | string | Mixto, Extensivo, Intensivo |
| current_capacity | integer | Current animal count |
| max_capacity | integer | Max allowed |
| sustainability | string nullable | Integrado, Ecológico |
| self_consumption | boolean | |
| census_date | date | Last census update |
| status | enum | active, inactive, restricted |

#### `Animal`
| Field | Type | Description |
|-------|------|-------------|
| id | bigint | PK |
| sub_exploitation_id | FK → sub_exploitations | |
| crotal_code | string unique | ES + 13 digits |
| species | enum | Same as SubExploitation |
| breed | string | e.g. "Pirenaica", "Latxa" |
| sex | enum | male, female |
| name | string nullable | Optional animal name |
| birth_date | date | |
| mother_id | FK → animals nullable | Mother reference |
| father_id | FK → animals nullable | Father reference |
| status | enum | active, deceased, sold, transferred |
| created_at / updated_at | timestamps | |

#### `BirthRegistration` (Comunicación de Nacimiento)
| Field | Type | Description |
|-------|------|-------------|
| id | bigint | PK |
| sub_exploitation_id | FK | |
| mother_id | FK → animals | |
| father_id | FK → animals nullable | |
| birth_type | enum | simple, multiple |
| calf_count | integer | Number of calves |
| status | enum | draft, submitted, approved, rejected |
| submitted_at | timestamp nullable | |
| reference_code | string nullable | e.g. "NC-2026-048-00234" |
| created_at / updated_at | timestamps | |

#### `BirthRegistrationCalf` (Cría registrada)
| Field | Type | Description |
|-------|------|-------------|
| id | bigint | PK |
| birth_registration_id | FK | |
| sex | enum | male, female |
| breed | string | Pre-filled from mother |
| name | string nullable | |
| birth_date | date | Defaults to today |
| assigned_crotal | string nullable | Assigned after submission |

### Seeders

Seed **1 exploitation** with **2 sub-exploitations** (bovine + ovine), each with 8-12 animals. Include a mix of males/females, different breeds, and ages. This provides enough data for a realistic demo walkthrough.

---

## Wizard Flow (6 Steps)

### Step 1 — Select Sub-Exploitation
- **Screen**: Card list of user's sub-exploitations
- **Each card shows**: Species icon + name, type, capacity bar (current/max), status badge
- **Validation**: Block if capacity = max (show warning)
- **Auto-select**: If only one sub-exploitation, skip to step 2

### Step 2 — Identify the Mother
- **Screen**: Searchable list of active females in the selected sub-exploitation
- **Each row shows**: Crotal code, breed, age, name (if any)
- **Search**: Filter by crotal code or name
- **OCR shortcut**: Button "Escanear crotal" → navigates to the Krotal Scanner, returns selected animal (cross-feature integration)
- **Validation**: Mother must be female, active, and belong to the selected sub-exploitation

### Step 3 — Father (Optional)
- **Screen**: Collapsible section, closed by default
- **If opened**: Same searchable list but filtered to active males
- **Can be skipped** — most farmers don't identify the father

### Step 4 — Calf Data
- **Birth type**: Simple / Multiple toggle
- **If multiple**: Show quantity input (2-4)
- **Per calf card**:
  - Birth date (date picker, defaults to today)
  - Sex (male/female toggle)
  - Breed (pre-filled from mother, editable)
  - Name (optional text input)
- **Legal deadline alert**: If birth_date is > 7 days ago, show orange warning: "Este nacimiento supera el plazo legal de 7 días para comunicar. Se recomienda registrarlo cuanto antes."
- **"Add another calf" button** for multiple births

### Step 5 — Summary & Confirmation
- **Full summary card** with all entered data, organized by section
- **Each section is editable** (click to go back to that step)
- **Validation panel**:
  - Mother is active ✅
  - Birth date is valid ✅
  - Capacity not exceeded ✅ (or ⚠️ if it will reach max)
  - Within legal deadline ✅ (or ⚠️)
- **"Enviar comunicación" button** (primary, prominent)

### Step 6 — Confirmation
- **Success screen**: "Nacimiento registrado" with confetti/check animation
- **Shows**:
  - Reference code (auto-generated)
  - Assigned crotal code(s) for each calf (auto-generated mock)
  - New capacity count
  - Quick actions: "Ver animal", "Registrar otro nacimiento", "Volver al panel"
- **On submit**: Creates `BirthRegistration` + `BirthRegistrationCalf` records + creates new `Animal` records with status=active

---

## Technical Implementation

### Backend (Laravel)

| Component | Details |
|-----------|---------|
| **Controller** | `BirthRegistrationController` (resource) with `create`, `store` methods |
| **Form Request** | `StoreBirthRegistrationRequest` with all validation rules |
| **Route** | `GET /nacimientos/crear` → wizard page, `POST /nacimientos` → store |
| **Business logic** | Service class `BirthRegistrationService` handles: capacity validation, crotal generation (mock), animal creation, reference code generation |

### Frontend (Inertia + React)

| Component | Details |
|-----------|---------|
| **Page** | `resources/js/pages/nacimientos/crear.tsx` |
| **Wizard state** | `useForm` from Inertia for final submission + local React state for step navigation |
| **Step components** | One component per step in `resources/js/components/nacimientos/` |
| **Progress indicator** | Step bar at the top showing current position (1-6) |
| **Animations** | Smooth transitions between steps (slide left/right) |
| **Responsive** | Mobile-first design (this is a PWA for farmers in the field) |

### i18n Strategy
- Use Laravel's `lang/` directory with JSON files: `es.json` (default)
- Frontend: pass translations via Inertia shared data or a dedicated translations endpoint
- All UI strings extracted to translation keys from day 1
- Structure: `wizard.birth.step1_title`, `wizard.birth.mother_label`, etc.

---

## UI/UX Guidelines (for Diputación demo)

- **Mobile-first**: Design for 375px width, scale up
- **Large touch targets**: Minimum 48px tap targets (elderly farmers with thick fingers)
- **High contrast**: Clear text on backgrounds, avoid subtle grays
- **Visual feedback**: Loading states, success animations, error highlights
- **Simple language**: No technical jargon. "Tu vaca" not "Bovino hembra en subexplotación"
- **Semaphore system**: Green/Yellow/Red badges for capacity and validation states
- **Step indicator**: Visual breadcrumb showing wizard progress

---

## KPIs to Track (demo instrumentation)

For the demo, instrument basic events (can be console.log for now, PostHog later):

| Event | When |
|-------|------|
| `wizard.birth.started` | User opens the wizard |
| `wizard.birth.step_completed` | Each step completed (with step number) |
| `wizard.birth.abandoned` | User leaves before submitting (with last step) |
| `wizard.birth.submitted` | Successful submission |
| `wizard.birth.ocr_used` | User used crotal scanner to identify mother |

---

## Out of Scope (Demo)

- Real MUGIDE/SEDE integration
- Digital signature flow (Giltza level Alto)
- Push notifications
- PDF generation of the registration
- Offline mode (queue + sync)
