# Feature Spec: Krotal Scanner (Crotal OCR via PWA Camera)

## Overview

Camera-based crotal (ear tag) scanner that uses the device camera through the PWA to read animal identification codes. The farmer points their phone at an animal's ear tag, the system reads the code (ES + 13 digits), and returns the animal's information from the local database.

For the demo: real camera access via PWA, with **simulated OCR processing** — the recognition logic is mocked but the camera UX is real.

**Target audience**: Diputación Foral de Bizkaia demo presentation.

---

## Demo Scope

| Aspect | Approach |
|--------|----------|
| Camera access | Real — PWA MediaDevices API (getUserMedia) |
| OCR processing | Mocked — simulates recognition after 1-2 seconds |
| Animal lookup | Real — queries local DB by crotal code |
| Offline fallback | Out of scope for demo |
| Manual input | Real — fallback text input if camera fails |

---

## How the Mock OCR Works

Since we don't have a real OCR engine for the demo, the scanner will:

1. **Open the real camera** (rear-facing, with flash toggle)
2. **Show a scanning overlay** (viewfinder rectangle + scanning animation)
3. **After 2 seconds of "scanning"**: randomly pick one of the seeded animal crotal codes from the database
4. **Display the result** as if it was recognized
5. **Allow manual input** as alternative (type crotal code directly)

This gives a realistic demo experience — the camera is real, the UI feels real, the result is real data from the DB. The only mocked part is the OCR recognition itself.

### Future Real Implementation Notes (for reference)
- Use Google ML Kit Text Recognition or Tesseract.js for on-device OCR
- Pattern matching for crotal format: `ES` + 2 digits (province) + 3 digits (municipality) + 7 digits (ID)
- Confidence threshold: only accept if confidence > 85%
- Multiple frame analysis for accuracy

---

## User Flow

### Entry Points
1. **Standalone**: From main navigation → "Escanear Crotal"
2. **From wizard**: Step 2 of Comunicar Nacimiento → "Escanear crotal" button (returns the identified animal back to the wizard)

### Flow

```
[User taps "Escanear Crotal"]
    → [Camera permission request]
        → Denied: [Show permission instructions screen]
        → Granted: [Camera viewfinder opens]
            → [Scanning animation runs for 1-2s]
            → [Result: crotal recognized]
                → [Show animal card with data]
                    → [Actions: "Ver ficha", "Volver", or return to wizard]
            → [Result: error (demo: 10% chance)]
                → [Show tips + manual input option]
```

---

## Screens

### Screen 1 — Camera Viewfinder
- **Full-screen camera** (rear camera by default)
- **Viewfinder overlay**: Semi-transparent dark overlay with a clear rectangle in the center (where the crotal should be positioned)
- **Scanning animation**: Horizontal line that sweeps up and down inside the viewfinder rectangle
- **Controls at bottom**:
  - Flash toggle (torch on/off)
  - Manual input button ("Introducir código")
  - Back/close button
- **Instructions text** (top): "Enfoca el crotal del animal dentro del recuadro"
- **Status text** (below viewfinder): "Buscando crotal..." with pulsing animation

### Screen 2 — Animal Result Card
- **Crotal code** (large, prominent): e.g. "ES048012345678"
- **Animal info card**:
  - Species + breed (with icon)
  - Sex (with icon)
  - Birth date + age
  - Name (if any)
  - Sub-exploitation name
  - Status badge (active/restricted)
- **Action buttons**:
  - "Ver ficha completa" → navigate to animal detail page
  - "Escanear otro" → back to camera
  - If called from wizard: "Seleccionar este animal" → returns to wizard with animal selected

### Screen 3 — Error / Tips
Shown when recognition "fails" (10% of the time in demo, to show the error UX):
- **Message**: "No se ha podido leer el crotal"
- **Tips list** (with icons):
  - "Limpia el crotal si está sucio"
  - "Acerca el teléfono a 10-15 cm"
  - "Busca buena iluminación"
  - "Mantén el teléfono estable"
- **Actions**:
  - "Reintentar" → back to camera
  - "Introducir código manualmente" → manual input

### Screen 4 — Manual Input
- **Text input field**: Formatted input for crotal code (auto-prefixes "ES")
- **Validation**: Must match pattern ES + 13 digits
- **"Buscar" button**: Looks up in the DB
- **Result**: Same animal card as Screen 2, or "Animal no encontrado"

### Screen 5 — Permission Denied
- **Clear illustration/icon** of a camera with an X
- **Step-by-step instructions** to enable camera permissions:
  - iOS: "Ve a Ajustes → Safari → Cámara → Permitir"
  - Android: "Ve a Ajustes → Apps → Navegador → Permisos → Cámara"
- **"Introducir código manualmente" button** as fallback

---

## Technical Implementation

### Backend (Laravel)

| Component | Details |
|-----------|---------|
| **Controller** | `KrotalScannerController` |
| **Routes** | `GET /scanner` → scanner page, `GET /api/animals/by-crotal/{code}` → JSON lookup |
| **Response** | Returns animal data with relationships (sub-exploitation, mother) |

### Frontend (Inertia + React)

| Component | Details |
|-----------|---------|
| **Page** | `resources/js/pages/scanner/index.tsx` |
| **Camera component** | `resources/js/components/scanner/CameraViewfinder.tsx` — uses `navigator.mediaDevices.getUserMedia()` with `{ video: { facingMode: 'environment' } }` |
| **Overlay component** | `resources/js/components/scanner/ScannerOverlay.tsx` — SVG overlay with viewfinder cutout |
| **Result component** | `resources/js/components/scanner/AnimalResultCard.tsx` |
| **Manual input** | `resources/js/components/scanner/ManualCrotalInput.tsx` |

### Camera Implementation (PWA)

```typescript
// Core camera setup
const stream = await navigator.mediaDevices.getUserMedia({
    video: {
        facingMode: 'environment', // Rear camera
        width: { ideal: 1280 },
        height: { ideal: 720 },
    }
});

// Flash/torch toggle (if supported)
const track = stream.getVideoTracks()[0];
const capabilities = track.getCapabilities();
if (capabilities.torch) {
    await track.applyConstraints({ advanced: [{ torch: true }] });
}
```

### Mock OCR Logic

```typescript
const simulateOCR = async (): Promise<ScanResult> => {
    // Simulate processing time (1-2 seconds)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    // 90% success rate for demo
    if (Math.random() > 0.1) {
        // Fetch a random animal crotal from the API
        const response = await fetch('/api/animals/random-crotal');
        const animal = await response.json();
        return { success: true, crotalCode: animal.crotal_code, animal };
    }

    return { success: false, error: 'recognition_failed' };
};
```

### i18n Keys

All strings under `scanner.*` namespace:
- `scanner.title`: "Escanear Crotal"
- `scanner.instructions`: "Enfoca el crotal del animal dentro del recuadro"
- `scanner.searching`: "Buscando crotal..."
- `scanner.recognized`: "Crotal identificado"
- `scanner.error`: "No se ha podido leer el crotal"
- `scanner.manual_input`: "Introducir código manualmente"
- `scanner.tips.*`: All scanning tips
- `scanner.permissions.*`: Permission denied messages

---

## Integration with Wizard

The scanner can be invoked from the birth registration wizard (Step 2 — Identify Mother). The communication pattern:

1. Wizard renders a "Escanear crotal" button
2. Button navigates to `/scanner?returnTo=nacimientos.crear&field=mother_id`
3. After successful scan, scanner redirects back with the animal ID as a query param
4. Wizard picks up the animal ID and pre-fills the mother selection

Alternative (simpler for demo): Use a modal/sheet that opens the camera inline without navigating away from the wizard.

---

## UI/UX Guidelines

- **Full screen**: Camera viewfinder should be immersive (no header/nav)
- **Dark UI**: Dark overlays and controls for outdoor visibility
- **Large buttons**: Flash toggle and manual input need to be tappable with gloves
- **Fast feedback**: Haptic vibration (if available) on successful recognition
- **Retry friendly**: Easy to go back to scanning after an error

---

## Out of Scope (Demo)

- Real OCR text recognition engine
- Multiple crotal format support (only ES format)
- Batch scanning (scan multiple animals in sequence)
- Offline crotal lookup
- Photo capture and storage of the crotal image
