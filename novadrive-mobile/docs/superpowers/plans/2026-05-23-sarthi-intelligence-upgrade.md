# Sarthi Intelligence Upgrade — Implementation Record

**Status:** Implemented (2026-05-23)

## Delivered

- `SarthiUserContext` + `buildSarthiContext.ts`
- `sarthiStrings.ts` (en/hi/ta welcome, greeting, fallback)
- `sarthiKnowledgeBase.ts` (24 intents, crisis playbooks)
- `sarthiOffline.ts` matcher with personalization
- `sarthiEngine.ts` offline-first routing (priority ≥ 70)
- `sarthiSession.ts` + `SarthiGreetingBridge` on Home tab
- BFF Gemini context-aware prompts (`maxOutputTokens: 256`)
- 46 Jest tests passing

## Verify manually

1. Settings → Tamil → Sarthi offline reply in Tamil
2. Airplane mode → “crash” / “SOS” → KB playbook
3. Cold start → Home → one-time Sarthi banner
4. Named profile → welcome uses name
