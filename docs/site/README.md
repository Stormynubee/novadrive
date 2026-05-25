# NovaDrive Team Brief — Site & PDF

Static site for the hackathon team brief. Deployed on Vercel.

## Build

```bash
node docs/site/build-docs.js
```

Source: [`../NOVADRIVE_MASTER_BRIEF.md`](../NOVADRIVE_MASTER_BRIEF.md) → `index.html`

## Complete UI brief (HTML)

**Live:** [roadsafetyhackathon-six.vercel.app/novadrive-complete.html](https://roadsafetyhackathon-six.vercel.app/novadrive-complete.html)

**Local file:** `docs/site/novadrive-complete.html`

## PDF

```bash
node docs/site/export-pdf.js              # Master brief
node docs/site/export-complete-pdf.js     # Complete project + UI brief
```

Or download PDFs from the site sidebar after deploy.
