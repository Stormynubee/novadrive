# Command Bridge UI Implementation Plan

> **For agentic workers:** Implement task-by-task. Medical spine unchanged.

**Goal:** Ship Command Bridge rebrand (A+C+D) across Margi mobile.

**Architecture:** Theme tokens → Hud* components → screen migrations in 3 phases.

**Tech Stack:** Expo 54, Reanimated/Animated, expo-google-fonts (Syne, DM Sans, JetBrains Mono)

---

## Phase 1 — Theme + demo spine
- [ ] tokens, typography, variants, Syne in `_layout`
- [ ] HudText, NovaButton, HudCard, HudAppBar, QuickActionTile, NovaLogo
- [ ] splash, home, journey/depart, journey, CrashCandidateModal

## Phase 2 — Emergency
- [ ] EmergencyStepShell, ProgressRail, QuestionCard, AnswerChips, CollapsibleChat, DispatchPanel, QrQuietZone, SeverityHero
- [ ] emergency/* + HoldSOSButton

## Phase 3 — Onboarding + polish
- [ ] OnboardingShell, auth, medical, accessibility, trip/plan, scan
- [ ] `tsc` + `npm test`
