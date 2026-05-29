# Naari Shakti Design Spec

## Purpose

Gender-gated women’s safety portal inside Nova Drive mobile: home access card, opt-in protocol modal, full emergency dashboard with hold-to-activate distress, SMS to nearest police station, GPS sharing, women’s helpline, ICE community alert, and emergency voice recording.

## Eligibility

- `gender === 'female'` on device profile (self-reported during medical onboarding or auth).
- “Verified female user” in UI copy matches local demo trust model (no Aadhaar API).

## Flows

1. **Onboarding:** auth (optional gender) → medical (required gender) → accessibility → home.
2. **Home:** Naari Shakti card visible only for eligible users. First tap → protocol modal (Enable / Not Now). After enable → direct to portal.
3. **Portal:** Emergency hold 2s → TTS help cue → GPS → recording → SMS compose → distress HUD. Quick actions for station SMS, location share, helpline 181.

## Helplines

| Service | Number |
|---------|--------|
| Women’s helpline | 181 |
| Women’s distress | 1091 |
| Unified emergency | 112 |
| Police | 100 |

## Demo limits

- SMS opens OS composer; user must tap Send.
- Nearest station from seeded police list + haversine.
- Recording stored locally during session; not uploaded automatically.

## Visual source

User HTML mockups: home card, protocol modal, portal dashboard (Care Path royal blue + saffron).
