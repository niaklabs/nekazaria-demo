# Feature Spec: AI Chatbot (Agente NekazarIA)

## Overview

A conversational assistant embedded in the app that helps farmers understand their exploitation data, navigate regulations, and get guidance on procedures — all in simple, jargon-free Spanish. The chatbot follows a WhatsApp-like interface familiar to the target demographic.

For the demo: **mocked AI responses** using a predefined conversation tree with canned responses. No real LLM integration, but the UI and interaction patterns are production-ready.

**Target audience**: Diputación Foral de Bizkaia demo presentation.

---

## Demo Scope

| Aspect | Approach |
|--------|----------|
| AI/LLM | Mocked — predefined response patterns |
| Conversation UI | Real — WhatsApp-style chat interface |
| Data context | Real — responses reference seeded DB data (animal counts, alerts) |
| Voice input | Out of scope for demo |
| Multilingual | Spanish only, i18n-ready for Euskera |
| Conversation history | Persisted in DB per user session |

---

## Mock Response Strategy

Instead of a real LLM, we use a **keyword-matching + template system**:

1. User sends a message
2. Backend matches keywords against predefined patterns
3. Returns a templated response populated with real data from the DB
4. Includes suggested follow-up questions (quick reply buttons)

### Response Pattern Table

| Keywords (any match) | Response Template | Quick Replies |
|---------------------|-------------------|---------------|
| `animales`, `cuantos`, `tengo` | "Tienes {count} animales en tu explotación. {bovine_count} bovinos en {sub_name} y {ovine_count} ovinos en {sub_name_2}." | "Ver mis bovinos", "Ver mis ovinos" |
| `bloqueado`, `inmovilizado`, `problema` | "Tienes {count} animales inmovilizados por la campaña {campaign_name}. Para desbloquearlos debes completar el muestreo. ¿Quieres que te explique cómo?" | "Sí, explícame", "Ver animales bloqueados" |
| `nacimiento`, `registrar`, `cría`, `parir` | "Para comunicar un nacimiento, necesitas saber la madre y la fecha de parto. El plazo legal es de 7 días. ¿Quieres que te guíe paso a paso?" | "Empezar registro", "¿Qué necesito?" |
| `movimiento`, `guía`, `trasladar`, `mover` | "Para mover animales necesitas una guía de movimiento. Te haré falta saber: destino, animales, fecha y medio de transporte. ¿Empezamos?" | "Crear guía", "¿Qué tipos hay?" |
| `campaña`, `sanitaria`, `BVD`, `tuberculosis` | "Tienes la campaña {campaign_name} activa. Progreso: {sampled}/{total} animales muestreados. Te quedan {pending} pendientes." | "Ver pendientes", "¿Cuándo termina?" |
| `ayuda`, `help`, `no entiendo` | "Estoy aquí para ayudarte. Puedo resolver dudas sobre tus animales, trámites, campañas sanitarias, o alertas. ¿Sobre qué quieres preguntar?" | "Mis animales", "Mis alertas", "Hacer un trámite" |
| `explicame`, `facil`, `sencillo`, `qué significa` | "¡Claro! Te lo explico en sencillo: {contextual_explanation}." | Contextual |
| `hola`, `buenos días`, `buenas` | "¡Hola {farmer_name}! ¿En qué puedo ayudarte hoy?" | "Mis animales", "Mis alertas", "Hacer un trámite" |
| _default (no match)_ | "No he entendido del todo. ¿Puedes decírmelo de otra forma? También puedes preguntarme sobre tus animales, trámites, campañas o alertas." | "Mis animales", "Mis alertas", "Ayuda" |

### Response Enrichment

Before returning, the backend enriches templates with real data:
- `{count}` → actual animal count from DB
- `{farmer_name}` → auth user's first name
- `{campaign_name}` → from SanitaryCampaign model
- `{sampled}/{total}` → from campaign data
- etc.

---

## Data Model

### `ChatConversation`
| Field | Type | Description |
|-------|------|-------------|
| id | bigint | PK |
| user_id | FK → users | |
| started_at | timestamp | |
| last_message_at | timestamp | |

### `ChatMessage`
| Field | Type | Description |
|-------|------|-------------|
| id | bigint | PK |
| conversation_id | FK → chat_conversations | |
| role | enum | user, assistant |
| content | text | Message text |
| quick_replies | json nullable | Array of suggested reply buttons |
| metadata | json nullable | Extra data (matched pattern, linked entities) |
| created_at | timestamp | |

---

## Screen Layout

### Chat Screen (`/chat`)

#### Header
- **NekazarIA avatar**: Friendly icon/illustration
- **Title**: "NekazarIA Laguntzailea" (helper in Euskera)
- **Status**: "En línea" (always, for demo)
- **Close button**: Back to previous screen

#### Message Area (Scrollable)
WhatsApp-style message bubbles:

- **User messages**: Right-aligned, colored background (e.g., green-ish)
- **Assistant messages**: Left-aligned, white/light background with NekazarIA avatar
- **Timestamps**: Subtle, grouped by time period
- **Quick reply buttons**: Horizontal scrollable chips below the last assistant message
- **Typing indicator**: Three animated dots when "processing" (simulated 0.5-1.5s delay)

```
┌─────────────────────────────────────────┐
│ 🤖 NekazarIA          En línea     ✕   │
├─────────────────────────────────────────┤
│                                         │
│   ┌──────────────────────────────┐      │
│   │ 🤖 ¡Hola Aitor! ¿En qué    │      │
│   │    puedo ayudarte hoy?      │      │
│   └──────────────────────────────┘      │
│   [Mis animales] [Mis alertas] [Trámite]│
│                                         │
│           ┌──────────────────────┐      │
│           │ ¿Por qué tengo       │      │
│           │ animales bloqueados? │      │
│           └──────────────────────┘      │
│                                         │
│   ┌──────────────────────────────┐      │
│   │ 🤖 Tienes 2 animales        │      │
│   │    inmovilizados por la      │      │
│   │    campaña BVD 2026. Para    │      │
│   │    desbloquearlos debes      │      │
│   │    completar el muestreo.    │      │
│   │    ¿Quieres que te explique  │      │
│   │    cómo?                     │      │
│   └──────────────────────────────┘      │
│   [Sí, explícame] [Ver bloqueados]      │
│                                         │
├─────────────────────────────────────────┤
│ [📷] Escribe tu mensaje...    [Enviar]  │
└─────────────────────────────────────────┘
```

#### Input Area (Fixed Bottom)
- **Text input**: Full-width, with placeholder "Escribe tu mensaje..."
- **Send button**: Arrow icon, disabled when empty
- **Camera shortcut** (optional): Quick access to crotal scanner from chat
- **"Explícamelo fácil" button**: Persistent floating button (appears when on other pages too)

---

## "Explícamelo Fácil" Button (Global)

A floating action button (FAB) available on ALL pages of the app that opens the chatbot with the current page context:

- **On exploitation panel**: Pre-fills "Explícame mi explotación"
- **On animal detail**: Pre-fills "Explícame la ficha de este animal"
- **On regulations**: Pre-fills "Explícame esta alerta"
- **On wizard steps**: Pre-fills "No entiendo este paso"

Implementation: A global React component that reads the current route and passes context to the chat.

---

## Technical Implementation

### Backend (Laravel)

| Component | Details |
|-----------|---------|
| **Controller** | `ChatController` with `index` (show chat), `store` (send message) |
| **Service** | `ChatbotService` — keyword matching, template rendering, data enrichment |
| **Routes** | `GET /chat` → chat page, `POST /chat/messages` → send message (returns assistant response) |
| **Models** | `ChatConversation`, `ChatMessage` |

#### ChatbotService Logic (Pseudocode)

```php
class ChatbotService
{
    public function respond(string $userMessage, User $user): ChatResponse
    {
        $patterns = $this->getPatterns(); // Keyword → template map
        $matched = $this->matchPattern($userMessage, $patterns);

        $data = $this->gatherContext($user); // Animals, alerts, campaigns from DB
        $response = $this->renderTemplate($matched->template, $data);
        $quickReplies = $matched->quickReplies;

        return new ChatResponse($response, $quickReplies);
    }

    private function matchPattern(string $message, array $patterns): Pattern
    {
        $message = Str::lower($message);

        foreach ($patterns as $pattern) {
            foreach ($pattern->keywords as $keyword) {
                if (Str::contains($message, $keyword)) {
                    return $pattern;
                }
            }
        }

        return $this->defaultPattern();
    }
}
```

### Frontend (Inertia + React)

| Component | Details |
|-----------|---------|
| **Page** | `resources/js/pages/chat/index.tsx` |
| **Components** | `ChatBubble.tsx`, `QuickReplyChips.tsx`, `TypingIndicator.tsx`, `ChatInput.tsx`, `ExplainButton.tsx` (global FAB) |
| **State** | Local React state for messages array + optimistic UI for sending |
| **Scroll** | Auto-scroll to bottom on new messages |
| **Animation** | Typing dots animation (CSS), message entrance animation (slide up) |

### Message Flow

1. User types message or taps quick reply
2. Message appears immediately in chat (optimistic)
3. Show typing indicator (0.5-1.5s random delay)
4. POST to `/chat/messages` with message content
5. Backend matches pattern, enriches template, stores both messages
6. Response appears with quick reply buttons
7. Scroll to bottom

### i18n Keys

All strings under `chat.*` namespace:
- `chat.title`: "NekazarIA Laguntzailea"
- `chat.status_online`: "En línea"
- `chat.input_placeholder`: "Escribe tu mensaje..."
- `chat.explain_button`: "Explícamelo fácil"
- `chat.greeting`: "¡Hola {name}! ¿En qué puedo ayudarte hoy?"
- `chat.default_response`: "No he entendido del todo..."
- `chat.quick_reply.*`: All quick reply button texts

---

## UI/UX Guidelines

- **WhatsApp-familiar**: The chat should feel like WhatsApp, not a corporate chatbot widget
- **Simple language**: All responses use everyday language. "Tus vacas" not "bovinos en subexplotación"
- **Quick replies are key**: Most farmers won't type — they'll tap suggested buttons. Make them prominent.
- **Typing delay**: The simulated delay (0.5-1.5s) makes it feel like the bot is "thinking" — more natural than instant response
- **Avatar**: Friendly, non-robotic. Could be a stylized farmer or a friendly animal mascot
- **Persistent**: Chat history persists between sessions (stored in DB)
- **Non-intrusive**: The "Explícamelo fácil" FAB should be visible but not block content

---

## Demo Scenario (Scripted Walkthrough for Diputación)

For the presentation, prepare this conversation flow:

1. **Farmer**: "Hola"
2. **Bot**: "¡Hola Aitor! ¿En qué puedo ayudarte hoy?" + quick replies
3. **Farmer** taps: "Mis alertas"
4. **Bot**: "Tienes 3 alertas pendientes: 1 urgente (animales inmovilizados) y 2 de atención. ¿Quieres que te explique la más urgente?"
5. **Farmer** taps: "Sí, explícame"
6. **Bot**: "Tienes 2 animales bloqueados por la campaña BVD 2026. Esto significa que no puedes moverlos hasta que les hagan el análisis. Para resolverlo, el veterinario tiene que tomar muestras. ¿Quieres ver qué animales son?"
7. **Farmer** taps: "Ver animales bloqueados"
8. **Bot**: Shows animal details inline + link to campaign detail page

This demonstrates: natural language, contextual data, simple explanations, and navigation integration.

---

## Out of Scope (Demo)

- Real LLM/AI integration (Laravel AI, Claude, etc.)
- Voice input/output
- Euskera language
- Initiating transactions from chat (e.g., "registra un nacimiento")
- Rich media responses (images, documents, maps)
- Conversation analytics
- Offline conversation cache
