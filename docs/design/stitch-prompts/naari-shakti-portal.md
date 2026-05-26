# Stitch prompt: Naari Shakti safety portal (mobile)

Government-aligned women's emergency safety portal inside Nova Drive — institutional navy and saffron, card-based layout, press-and-hold distress activation.

**DESIGN SYSTEM (REQUIRED):**

- Platform: Mobile, portrait-first (390×844 reference)
- Theme: Light institutional GovTech — trustworthy, urgent but not chaotic
- Background: Clean Surface Gray (#f8f9fa)
- Primary Navy: Deep Void Navy (#000a1e) for header, safety mode bar, navigation chrome
- Primary Accent: Saffron Orange (#fe6b00) for CTAs, emergency button, active highlights
- Text Primary: Near Black (#191c1d) for body copy
- Text Secondary: Medium Gray (#44474e) for subtitles
- Typography: Hanken Grotesk (headlines, NAARI SHAKTI title), Public Sans (labels, body)
- Cards: White (#ffffff) surfaces, 1px outline (#c4c6cf), soft elevation, 12–16px radius
- Icons: Material Symbols Outlined — filled variant for emergency and shield

**Page Structure:**

1. **Header:** Navy bar — back arrow, centered "NOVA DRIVE", emergency-share icon right
2. **Hero band:** Navy-to-container gradient — pill badge "GOVERNMENT INITIATIVE" with shield icon, large title "NAARI SHAKTI", subtitle about institutional safety for women citizens
3. **Emergency command card:** White card with saffron top accent — large circular orange button with 8-point emergency asterisk icon, label "EMERGENCY HELP", instruction "Press & Hold for 2 Seconds", subtext about nearby responders
4. **Quick actions (stacked rows):** "SMS Nearest Station" (police shield icon, silent distress), "Share Live Location" (crosshair icon, trusted contacts & police), chevron on each row
5. **Safety mode bar:** Full-width navy row — female symbol icon, "Safety Mode" + "ACTIVE • ENHANCED", orange toggle on right
6. **Quick help message:** Section label caps, text field with send icon, three pill presets (location help, vehicle follow, medical emergency)
7. **Bento row:** Citizen status card (avatar, verified name, green "Identity Confirmed") + Nearest safety point card (police HQ name, distance/ETA, black NAVIGATE button)
8. **Distress HUD overlay (hidden default):** Full-screen saffron scrim — "DISTRESS SIGNAL INITIATED", spinner, GPS message, "Speak to Officer" white button, "CANCEL ALERT" secondary

**Related screens (same design system):**

- **Home access card:** Orange-bordered row — female icon in saffron circle, "NAARI SHAKTI" / "Emergency Safety Portal", chevron
- **Protocol modal:** Blurred home behind — navy header with shield, "Naari Shakti Protocol", white body, full-width saffron "ENABLE PORTAL", text "Not Now"

**Context:** Match existing Nova Drive dashboard (System Ready banner, ENTER DRIVE MODE, Quick SOS, bottom tabs Home/Trip/Community/Profile). No bottom tab bar on the portal screen itself.

---

Design tokens reference: [novadrive-mobile/DESIGN.md](../../novadrive-mobile/DESIGN.md) and GovTech tokens in `src/theme/tokens.ts`.
