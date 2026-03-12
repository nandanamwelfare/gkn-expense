# Nandanam Expense Tracker — Vite Setup

## First-time setup (run once)

```bash
npm install
```

## Local development

```bash
npm run dev
```
Opens at http://localhost:5173 with hot reload.

## Deploy to Cloudflare Pages

### Option A — GitHub auto-deploy (recommended)
1. Push this folder to your GitHub repo (nandanamwelfare)
2. In Cloudflare Pages → your project → Settings → Builds
   - Build command: `npm run build`
   - Output directory: `dist`
3. Every `git push` auto-deploys ✅

### Option B — Manual upload
1. Run `npm run build` — creates a `dist/` folder
2. Go to Cloudflare Pages → Upload assets
3. Upload the contents of the `dist/` folder
4. Done ✅

## Project structure

```
nandanam-vite/
├── index.html          ← HTML entry point
├── vite.config.js      ← Vite config
├── package.json        ← Dependencies
├── src/
│   ├── main.jsx        ← React entry point
│   └── App.jsx         ← Your full app (all 2913 lines)
```
