# Emergency Selection Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every SOS and “I need help” action opens the Emergency Selection screen (Road Accident, Natural Calamity, Human Crime) before START triage—never triage directly.

**Architecture:** One canonical route constant (`EMERGENCY_SELECTION_PATH`) used by all entry points; `session.incidentType` set when a card is tapped; triage screen redirects back to selection if `incidentType` is missing. Locate remains in the 5-step flow for users who enter via “Continue to incident selection” after GPS capture.

**Tech Stack:** Expo Router, React Native, Jest, AppContext `EmergencySession`

---

## File map

| File | Responsibility |
|------|----------------|
| `src/lib/emergency/emergencyNavigation.ts` | Canonical `/emergency/selection` path + triage gate helper |
| `src/lib/emergency/incidentCatalog.ts` | Three incident cards (copy, CTA, accent) |
| `src/lib/emergency/cancelSosCountdown.ts` | 10s cancel window labels |
| `app/emergency/selection.tsx` | Selection UI screen |
| `src/components/emergency/EmergencyIncidentCard.tsx` | Single incident card |
| `app/emergency/triage.tsx` | START triage; redirects if no `incidentType` |
| `app/(tabs)/explore.tsx` | Quick SOS → selection |
| `app/journey.tsx` | Hold SOS 3s + header emergency → selection |
| `src/components/SafetyMonitorBridge.tsx` | Crash modal “I need help” → selection |
| `src/components/DashboardHeader.tsx` | Tab header emergency icon → selection |
| `app/emergency/locate.tsx` | Step 1 of 5-step flow → “Continue to incident selection” |

---

### Task 1: Central emergency route (TDD)

**Files:**
- Create: `src/lib/emergency/emergencyNavigation.ts`
- Create: `src/lib/emergency/emergencyNavigation.test.ts`

- [x] **Step 1: Write the failing test**

```typescript
import {
  EMERGENCY_SELECTION_PATH,
  shouldGateTriageWithoutIncident,
} from './emergencyNavigation';

describe('emergencyNavigation', () => {
  it('uses the emergency selection route for all SOS entry points', () => {
    expect(EMERGENCY_SELECTION_PATH).toBe('/emergency/selection');
  });

  it('blocks triage until an incident type is chosen', () => {
    expect(shouldGateTriageWithoutIncident(undefined)).toBe(true);
    expect(shouldGateTriageWithoutIncident('road_accident')).toBe(false);
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/emergency/emergencyNavigation.test.ts`  
Expected: FAIL — module not found

- [x] **Step 3: Write minimal implementation**

```typescript
import type { IncidentType } from '../types';

export const EMERGENCY_SELECTION_PATH = '/emergency/selection';

export function shouldGateTriageWithoutIncident(incidentType?: IncidentType): boolean {
  return !incidentType;
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/emergency/emergencyNavigation.test.ts`  
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add novadrive-mobile/src/lib/emergency/emergencyNavigation.ts \
  novadrive-mobile/src/lib/emergency/emergencyNavigation.test.ts
git commit -m "feat(mobile): add canonical emergency selection route"
```

---

### Task 2: Wire all SOS entry points to selection

**Files:**
- Modify: `app/(tabs)/explore.tsx` — Quick SOS `onProceed`
- Modify: `app/journey.tsx` — `onSOS` + header `emergency-share`
- Modify: `src/components/SafetyMonitorBridge.tsx` — `onConfirmAlert` (“I need help”)
- Modify: `src/components/DashboardHeader.tsx` — `onEmergency`

- [x] **Step 1: Replace `/emergency/locate` and `/emergency/triage` with constant**

```typescript
import { EMERGENCY_SELECTION_PATH } from '../lib/emergency/emergencyNavigation';
// ...
beginEmergencyFlow();
router.push(EMERGENCY_SELECTION_PATH as Href);
```

Apply in all four files above.

- [x] **Step 2: Register stack screen**

In `app/_layout.tsx`:

```tsx
<Stack.Screen name="emergency/selection" options={{ headerShown: false }} />
```

- [ ] **Step 3: Manual smoke**

| Trigger | Expected screen |
|---------|-----------------|
| Home → Quick SOS → Proceed | Emergency Selection |
| Drive HUD → Hold SOS 3s | Emergency Selection |
| Impact modal → I need help | Emergency Selection |
| Tab header emergency icon | Emergency Selection |
| Direct `/emergency/triage` URL | Redirect to Selection |

- [ ] **Step 4: Commit**

```bash
git add novadrive-mobile/app novadrive-mobile/src/components
git commit -m "fix(mobile): route all SOS entry points to emergency selection"
```

---

### Task 3: Triage gate + incident selection screen

**Files:**
- Create: `app/emergency/selection.tsx`
- Create: `src/lib/emergency/incidentCatalog.ts` + tests
- Create: `src/lib/emergency/cancelSosCountdown.ts` + tests
- Modify: `app/emergency/triage.tsx`
- Modify: `src/context/AppContext.tsx` — `setIncidentType`, `session.incidentType`

- [x] **Step 1: Triage redirect guard**

```typescript
useFocusEffect(
  useCallback(() => {
    if (shouldGateTriageWithoutIncident(session.incidentType)) {
      router.replace(EMERGENCY_SELECTION_PATH as Href);
    }
  }, [session.incidentType])
);
```

- [x] **Step 2: Selection card tap → triage**

```typescript
const onSelect = (type: IncidentType) => {
  setIncidentType(type);
  router.push('/emergency/triage' as Href);
};
```

- [ ] **Step 3: Run full test suite**

Run: `npm test` && `npm run typecheck`  
Expected: all green

- [ ] **Step 4: Commit**

```bash
git add novadrive-mobile/app/emergency novadrive-mobile/src/lib/emergency \
  novadrive-mobile/src/components/emergency novadrive-mobile/src/context/AppContext.tsx
git commit -m "feat(mobile): emergency selection screen before START triage"
```

---

### Task 4: Docs and device matrix

**Files:**
- Modify: `docs/DEVICE_SMOKE_MATRIX.md`

- [x] **Step 1: Update rows 11, 19, 20, 20b** for selection-first flow

- [ ] **Step 2: Commit**

```bash
git add novadrive-mobile/docs/DEVICE_SMOKE_MATRIX.md
git commit -m "docs(mobile): smoke matrix for emergency selection routing"
```

---

## Stitch prompt (enhanced — Emergency Selection)

Use this if regenerating the screen in Stitch:

A trustworthy GovTech mobile **Emergency Selection** screen: institutional navy header, three large incident cards, 10-second cancel window, light institutional background.

**DESIGN SYSTEM (REQUIRED):**
- Platform: Mobile, portrait-first
- Theme: Light, institutional, navy-forward, calm under stress
- Background: Surface Bright (#f8f9fa)
- Primary Chrome: Deep Navy (#000a1e) for header and Road Accident actions
- Emergency Saffron (#fe6b00 / #a04100) for Natural Calamity highlight and HIGH PRIORITY badge
- Error Red (#ba1a1a) for Human Crime card and URGENT DISPATCH
- Text Primary: On Surface (#191c1d); Text Secondary: On Surface Variant (#44474e)
- Typography: Hanken Grotesk headlines; Public Sans body; label buttons uppercase with letter-spacing
- Cards: White surface, 12px radius, left accent stripe, subtle shadow; center card scaled with orange glow border

**Page Structure:**
1. **Fixed Header:** Emergency icon + “Nova Drive | Incident Tracker” + notification bell on navy bar
2. **Title Block:** “Emergency Selection” + instructional subtext (centered)
3. **Incident Cards (vertical stack):**
   - Road Accident — car crash icon, navy CTA “INITIATE SOS”
   - Natural Calamity — tsunami icon, HIGH PRIORITY pill, saffron glow, CTA “ACTIVATE PROTOCOL”
   - Human Crime — shield icon, red CTA “URGENT DISPATCH”
4. **Cancel Row:** Outlined button “CANCEL SOS (10s)” counting down to “CANCEL SOS (EXPIRED)” disabled
5. **Footer:** Navy bar “Nova Drive Platform”

---

## Self-review

| Spec requirement | Task |
|------------------|------|
| Quick SOS → selection | Task 2 — explore.tsx |
| Hold SOS → selection | Task 2 — journey.tsx |
| I need help → selection | Task 2 — SafetyMonitorBridge |
| Three incident options | Task 3 — selection + catalog |
| Then triage | Task 3 — onSelect → triage |
| Never triage without pick | Task 3 — triage guard |

**Root cause of user bug:** Selection work was local-only (not committed/pushed); Hold SOS and “I need help” still routed to `/emergency/locate`, and old builds skipped selection entirely.

---

## Execution handoff

**Plan saved to:** `docs/superpowers/plans/2026-05-27-emergency-selection-routing.md`

**Two execution options:**

1. **Subagent-Driven (recommended)** — Fresh subagent per task, review between tasks  
2. **Inline Execution** — Continue in this session; remaining work is commit + device smoke + push

**Which approach?**
