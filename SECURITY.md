# Security

NovaDrive handles **sensitive medical and location data** during emergencies.

## What we do

- Medical profile and relay packets use **SecureStore** on device; auth tokens are not stored in plaintext AsyncStorage.
- Golden Hour Packet QR uses **SHA-256 integrity** (`expo-crypto`); blood type is omitted from minimal QR unless the user consents in profile.
- **No auto-dial** and **no auto-triage** on crash countdown — reduces false-alarm and legal risk.
- Guest/demo mode avoids sending PHI to Supabase until real auth + RLS is configured.

## Reporting

For hackathon or post-hackathon issues, open a [GitHub Security advisory](https://github.com/Stormynubee/novadrive/security/advisories/new) or email the team lead listed in the submission doc.

## Out of scope (P0)

- Production HIPAA compliance
- Penetration-tested backend
- Encrypted SMS to 108 (operators need human-readable text)

Do not commit `.env`, API keys, or real patient data to this repository.
