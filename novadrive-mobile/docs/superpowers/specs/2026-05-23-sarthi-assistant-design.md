# Sarthi Assistant — Design Spec

**Sarthi — AI Assistant · Powered by NovaDrive**  
Road safety co-pilot for IIT Madras RoadSoS / NovaDrive mobile P0.

## Purpose

General-purpose in-app assistant (not emergency triage FSM). Helps with corridor planning, SOS guidance, and offline-safe fallbacks when the LLM BFF is unreachable.

## UX

1. **FAB** on main tabs (Home, Trip, Community, Profile) — hidden on `journey`, `emergency/*`, `scan`.
2. **Mini window** (~40% height): header, last messages, **More** → `/sarthi`.
3. **Full screen** `/sarthi`: reference layout (session pill, bubbles, action cards, composer, bottom bar).
4. **Session greeting:** first Home (`explore`) focus per cold start — banner + a11y: *"I'm here to help you"* (localized).

## Message model

```ts
type SarthiRole = 'user' | 'assistant' | 'system';
type SarthiMessage = {
  id: string;
  role: SarthiRole;
  text: string;
  createdAt: number;
  actionCard?: { title: string; subtitle: string };
};
```

## User context (identity + language + journey)

```ts
type SarthiUserContext = {
  journeyPhase: 'IDLE' | 'ACTIVE';
  corridorLabel?: string;
  language: 'en' | 'hi' | 'ta';       // from Settings
  displayName?: string;
  mode: 'guest' | 'auth';
  medicalSummary?: string;          // one-line for BFF only
  hasEmergencyContacts: boolean;
  regionalProtocols: boolean;
};
```

Built from `AppContext.profile` via `buildSarthiUserContext()`.

## Online / offline

| State | Behavior |
|-------|----------|
| Online | POST BFF with full `SarthiUserContext` |
| Offline | `sarthiKnowledgeBase` intent matcher (24+ playbooks, 3 languages) |
| High-priority KB match (≥70) while online | **Offline-first** — skip network for speed |
| Fetch error | Offline KB + fallback string |

## Offline knowledge base

Categories: emergency, road_safety, journey, breakdown, distress, app_help.

- File: `src/lib/sarthi/sarthiKnowledgeBase.ts`
- Matcher: `src/lib/sarthiOffline.ts` with `{{name}}`, `{{corridor}}`, `{{mode}}` templates
- Strings: `src/lib/sarthi/sarthiStrings.ts`

## BFF contract

`POST /api/sarthi/chat`

```json
{
  "messages": [{ "role": "user|assistant", "content": "..." }],
  "context": { "journeyPhase", "language", "displayName", "mode", "medicalSummary", ... }
}
```

Model: **Gemini 2.0 Flash** (`gemini-2.0-flash`). Env: `GOOGLE_GENERATIVE_AI_API_KEY`.

## Route gating

`SarthiOverlayBridge` hides on `journey`, `emergency`, `scan`.

## Security

API keys only in `novadrive/.env`. Mobile never embeds provider keys. No full medical JSON in logs.
