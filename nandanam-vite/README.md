# Nandanam Expense Manager — v20.1

**Gokul's Nandanam · Cultural Association · Welfare & Expense Management**

---

## What's in this bundle

| File | Description |
|------|-------------|
| `src/App.jsx` | Main React app (single file) |
| `src/main.jsx` | React entry point + PWA SW registration |
| `index.html` | HTML shell |
| `vite.config.js` | Vite build config |
| `package.json` | Dependencies (React 18 + Vite) |
| `public/sw.js` | Service Worker — network-first PWA |
| `public/manifest.json` | PWA manifest |
| `public/icons/` | App icons (192 + 512px) |
| `NandanamAppScript_v20.1.gs` | Google Apps Script backend |

---

## Setup

### 1. Google Sheets — GKN-EXP-PROD
Create a spreadsheet named exactly `GKN-EXP-PROD` with these sheets:

| Sheet | Columns |
|-------|---------|
| **Entries** | id · txnId · date · member · categoryCode · amount · purpose · upiId · status · notes · eventId · subCategory · payType · txnRef · receiptUrl · invoiceUrl |
| **Events** | id · name · tag · date · status · budget |
| **Members** | name · addedAt · pin · role |
| **Counters** | key · value |
| **Config** | key · value |

**Config sheet rows:**
- `pin` → Your 5-digit Treasurer PIN
- `geminiKey` → (optional) Gemini API key for future AI features

**Members sheet:**
- Column C (`pin`) — member sets their own on first login, Treasurer can clear to force reset
- Column D (`role`) — set to `Treasurer` for treasurer members (shows ★ badge)

### 2. Apps Script
1. In your spreadsheet → Extensions → Apps Script
2. Paste `NandanamAppScript_v20.1.gs` contents
3. Deploy → New deployment → Web app → Execute as **Me** → Access **Anyone**
4. Copy the deployment URL

### 3. Frontend
```bash
npm install
npm run dev        # development
npm run build      # production build → dist/
```

### 4. Connect
Open the app → click **Connect DB** → paste your Apps Script URL → Save & Connect.

---

## v20.1 — What's included

### Bug fixes
- **Bug 1** — PIN no longer clears after each submission. Member stays verified for the session.
- **Bug 2** — Member field locked to verified identity. Cannot submit under another member's name.
- **Critical** — `setSubmitting(false)` now always fires via `try/finally`. Button can never get stuck.

### PIN system
- **5-attempt lockout** — both Member PIN and Treasurer PIN lock after 5 wrong attempts with visual dot indicators
- **First-login PIN setup** — members with no PIN set are prompted to choose + confirm a 5-digit PIN on first login
- **Treasurer Reset PIN** — Members panel shows PIN status (🔐 set / ⚠ no PIN) and a Reset button per member

### Bulk Import — rebuilt (no AI)
- Template-based: enter vendor, category, row count → creates pre-filled rows
- **Clone row** button (⧉) — duplicates any row for same-vendor different-date entries
- **Apply to All** — pushes vendor/category to all rows at once
- **Duplicate detection** in bulk table: 🔴 hard block / 🟡 soft warn / 🟠 suspicious

### Duplicate detection — single submit form
- Same 3-layer detection on every single submission
- Override checkbox with confirmation message
- Clears automatically after successful submit

### Transactions view
- New **Transactions** tab — accessible to all verified members (PIN required)
- Read-only full transaction table with search + filters
- **Highlight my entries** toggle — own rows highlighted in gold
- Personal summary: Community Total · My Submissions · My Pending

### Google Sheets backend (v20.1)
- `invoiceUrl` added as column P in Entries sheet
- `saveReceipt` handles `fileType=receipt|invoice` — separate filenames, separate columns
- `updateInvoiceUrl` helper for col P
- `setMemberPin(name, pin)` — set or clear a member's PIN from the app

---

## Architecture

```
Browser (React PWA)
    ↕ HTTPS POST/GET
Google Apps Script Web App
    ↕ SpreadsheetApp API    ↕ DriveApp API
GKN-EXP-PROD (Sheets)     GKN-Receipts (Drive)
```
