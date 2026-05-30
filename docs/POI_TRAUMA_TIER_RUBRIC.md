# POI trauma tier rubric (Margi C1)

| Tier | Label | Assignment criteria | Examples |
|------|-------|---------------------|----------|
| 1 | Trauma center | Hospital advertises 24×7 trauma/ER with surgical capability; or state-designated trauma center | Apollo Greams Trauma, SRMC Emergency |
| 2 | Hospital ER | General hospital with emergency department; no verified dedicated trauma bay | District HQ hospitals, medical college hospitals |
| 3 | Clinic / PHC | Primary health centre, urban clinic, no 24×7 surgical ER | NH48 PHC, Tambaram clinic |

**Rules:**
- Tier must be assigned by verifier after phone call or official hospital website check.
- If phone unreachable after 2 attempts on 2 days, set `verified=0` and `phone=` empty; do not invent numbers.
- Never assign tier 1 without explicit trauma/ER confirmation.
- Police stations and Naari demo stations use separate tables; do not mix into `emergency_nodes`.
