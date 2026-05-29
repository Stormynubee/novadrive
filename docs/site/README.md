# Margi Team Brief — Site & PDF

Static site for the hackathon team brief. Deployed on Vercel.

## Build

```bash
node docs/site/build-docs.js
```

Source: [`../MARGI_MASTER_BRIEF.md`](../MARGI_MASTER_BRIEF.md) → `index.html`

## Complete UI brief (HTML)

**Live:** [roadsafetyhackathon-six.vercel.app/margi-complete.html](https://roadsafetyhackathon-six.vercel.app/margi-complete.html)

**Local file:** `docs/site/margi-complete.html`

## PDF

```bash
node docs/site/export-pdf.js              # Master brief
node docs/site/export-complete-pdf.js     # Complete project + UI brief
```

Or download PDFs from the site sidebar after deploy.
