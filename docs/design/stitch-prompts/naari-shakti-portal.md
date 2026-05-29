# Stitch prompt: Naari Shakti safety portal (mobile)

Government-aligned women's emergency safety portal inside **Margi** — Care Path royal blue and vibrant orange, card-based layout, press-and-hold distress activation.

**DESIGN SYSTEM (REQUIRED):**

- Platform: Mobile, portrait-first (390×844 reference)
- Theme: Light **Care Path** — compassionate, institutional, generous whitespace
- Background: Canvas (#f8f9fb)
- Surface: White (#ffffff) for cards and sheets
- Primary Accent: Royal Blue (#0056b3) for header, safety mode bar, primary CTAs, wordmark
- Urgent Accent: Vibrant Orange (#ff8c00) for emergency button, SOS, active highlights
- Safe Green: (#249c53) for verified / identity confirmed states
- Text Primary: Ink (#1a2a3d)
- Text Secondary: Muted (#4a5568)
- Typography: Hanken Grotesk (headlines, NAARI SHAKTI title), Public Sans (labels, body), JetBrains Mono (HUD labels)
- Cards: White surfaces, soft blue-tint shadow, 12px radius
- Icons: Material Symbols Outlined — filled variant for emergency and shield

**Page Structure:**

1. **Header:** Royal blue bar — back arrow, centered "MARGI", emergency-share icon right
2. **Hero band:** Blue gradient — pill badge "GOVERNMENT INITIATIVE" with shield icon, large title "NAARI SHAKTI", subtitle about institutional safety for women citizens
3. **Emergency command card:** White card with orange top accent — large circular orange button with 8-point emergency asterisk icon, label "EMERGENCY HELP", instruction "Press & Hold for 2 Seconds", subtext about nearby responders
4. **Quick actions (stacked rows):** "SMS Nearest Station" (police shield icon, silent distress), "Share Live Location" (crosshair icon, trusted contacts & police), chevron on each row
5. **Safety mode bar:** Full-width royal blue row — female symbol icon, "Safety Mode" + "ACTIVE • ENHANCED", orange toggle on right
6. **Quick help message:** Section label caps, text field with send icon, three pill presets (location help, vehicle follow, medical emergency)
7. **Bento row:** Citizen status card (avatar, verified name, green "Identity Confirmed") + Nearest safety point card (police HQ name, distance/ETA, blue NAVIGATE button)
8. **Distress HUD overlay (hidden default):** Full-screen orange scrim — "DISTRESS SIGNAL INITIATED", spinner, GPS message, "Speak to Officer" white button, "CANCEL ALERT" secondary

**Related screens (same design system):**

- **Home primary stack (female users only):** Below System Ready — royal blue horizontal "ENTER DRIVE MODE" card stacked above orange "NAARI SHAKTI / SAFETY PORTAL" card with pulse-rotate female icon. Male users see only the drive card.
- **Protocol modal (female only, first tap):** Blurred home — "Unverified female user detected", ENABLE PORTAL / Not Now. Never shown to male users.

**Context:** Match existing Margi dashboard (System Ready banner, ENTER DRIVE MODE, Quick SOS, bottom tabs Home/Trip/Community/Profile). No bottom tab bar on the portal screen itself.

---

Design tokens: [novadrive-mobile/DESIGN.md](../../novadrive-mobile/DESIGN.md) · `src/theme/tokens.ts`
