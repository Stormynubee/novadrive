## Summary

<!-- What does this PR change and why? -->

## Type

- [ ] P0 — hackathon demo / medical safety
- [ ] P1/P2 — post-MVP (note in description)
- [ ] Docs / CI only

## Test plan

- [ ] `cd novadrive-mobile && npm test`
- [ ] Manual: Guest → Journey → SOS → Triage → GHP (if UI touched)
- [ ] No secrets or `.env` committed

## Medical / safety

- [ ] FSM changes include `startTriageFSM.test.ts` updates
- [ ] No auto-dial / auto-triage at crash countdown 0
