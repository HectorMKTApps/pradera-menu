# Pradera Menu

A digital menu website for Pradera, built with Next.js. There is no
database and no admin panel — the menu is edited in a Google Sheet, and a
sync script pushes the data into this repo as static JSON.

## Architecture

```
Google Sheet  --(Apps Script "Sync changes")-->  GitHub (data/menu.json)  --(push to main)-->  Vercel auto-deploy
```

- **Google Sheet** — the source of truth for menu content. One tab per
  category (Drinks, Starters, Desserts, ...). See
  [`google-apps-script/README.md`](google-apps-script/README.md) for the
  expected column layout.
- **Apps Script** (`google-apps-script/Code.gs`) — reads the sheet,
  uploads any new product images to Cloudinary, and commits the resulting
  `data/menu.json` to this repo via the GitHub Contents API. This script
  lives in the Google Sheet itself; the copy in this repo is a reference/
  documentation copy only.
- **GitHub** — hosts this repo. A commit to `data/menu.json` on `main` is
  the only thing that changes between deploys.
- **Vercel** — connected to this repo, auto-deploys on every push to
  `main`. No server, no database, no build-time secrets beyond what
  Next.js itself needs (none, currently).

The Next.js app itself is a static-ish read of `data/menu.json` at
build/request time (see [`lib/menu.ts`](lib/menu.ts)) — it has no write
path of its own.

## Local development

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

```bash
npm run build   # production build + type check
npm run lint    # eslint
```

## Updating menu content

**Never edit `data/menu.json` by hand in this repo.** It is overwritten
every time someone runs the "Sync changes" menu item in the Google Sheet.
To change the menu:

1. Edit the Google Sheet (add/remove rows, change prices, toggle
   `Available`, reorder via the `Order` column, etc).
2. Run **Pradera Menu > Sync changes** from the Sheet's menu bar.
3. Vercel picks up the resulting commit and redeploys automatically —
   usually live within a minute or two.

If `data/menu.json` is ever missing or malformed, the app falls back to a
small hardcoded sample menu (see `FALLBACK_MENU` in `lib/menu.ts`) rather
than crashing.

## Deploying to a new restaurant

This codebase is meant to be reused across clients. To stand up a new
instance:

- [ ] Create a new Google Sheet with one tab per menu category, matching
      the column layout in
      [`google-apps-script/README.md`](google-apps-script/README.md).
- [ ] Create a new Cloudinary account (or sub-account) and an unsigned
      upload preset for product images.
- [ ] Create a new GitHub repo for the client and push this codebase to
      it.
- [ ] Paste `Code.gs` into the new Sheet's Apps Script editor, update the
      `GITHUB_OWNER` / `GITHUB_REPO` / `GITHUB_BRANCH` constants, and set
      the `GITHUB_TOKEN`, `CLOUDINARY_CLOUD_NAME`, and
      `CLOUDINARY_UPLOAD_PRESET` Script Properties.
- [ ] Generate a new GitHub personal access token scoped to that repo's
      contents and store it in the Script Property above (never commit it
      anywhere).
- [ ] Create a new Vercel project importing the new GitHub repo, and
      confirm `images.remotePatterns` in `next.config.ts` still covers
      `res.cloudinary.com` (it does by default — Cloudinary always serves
      from that hostname regardless of cloud name).
- [ ] Update branding in `app/layout.tsx` (metadata), `app/page.tsx`
      (restaurant name/tagline), and `app/icon.tsx` (favicon letter).

## Tech stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- No database, no auth, no CMS — the Google Sheet is the database.
