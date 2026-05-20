# RelaySaathi Team Brief — Site & PDF

## Files

| File | Purpose |
|------|---------|
| `index.html` | Dark theme website (browse in browser) |
| `../RELAYSATHI_MASTER_BRIEF.pdf` | High-contrast PDF for sharing |
| `../RELAYSATHI_MASTER_BRIEF.md` | Source markdown (edit this) |

## Regenerate after editing markdown

```powershell
cd C:\Users\storm\roadsafetyhackathon\docs\site
node build-docs.js
node export-pdf.js
```

## PDF preview in browser (light/print theme)

Open: `index.html?pdf=1` — white background, dark text, cover page.

## Manual PDF from browser

1. Open `index.html?pdf=1`
2. Press **Ctrl+P**
3. Choose **Save as PDF**
4. Enable **Background graphics**

## Website only (dark theme)

Open: `index.html` (without `?pdf=1`)
