# Pradera Menu — Apps Script Setup

This script syncs a Google Sheet (the "menu database") to `data/menu.json`
in the `pradera-menu` GitHub repo, uploading any new images to Cloudinary
along the way. Vercel is connected to the repo, so a commit to `main`
triggers an automatic redeploy of the site.

## Sheet structure

Create one tab per menu category (e.g. "Drinks", "Starters", "Desserts").
Each tab needs these columns, in this order, with headers in row 1:

| Name | Description | Price | Image URL | Cloudinary URL | Featured | Order | Available |
|------|-------------|-------|-----------|-----------------|----------|-------|-----------|

- **Name / Description / Price** — display text. Price is a plain string
  (e.g. `$12`), not a number — it's never used in arithmetic.
- **Image URL** — a Google Drive share link for the product photo. Leave
  blank if there's no photo.
- **Cloudinary URL** — leave this blank initially. The script fills it in
  automatically after the first successful upload, and reuses it on every
  future sync instead of re-uploading. To force a re-upload (e.g. after
  replacing the Drive image), manually clear this cell.
- **Featured** — `TRUE` to show a "Featured" badge on the site.
- **Order** — a number controlling display order within the category
  (ascending). Rows without a number sort last.
- **Available** — must be `TRUE` for the row to be included in the sync.
  Anything else (blank, `FALSE`, etc.) excludes it.

## One-time setup

1. Open your Google Sheet, then **Extensions > Apps Script**.
2. Delete the default boilerplate in `Code.gs` and paste in the contents of
   this folder's `Code.gs`.
3. In `Code.gs`, update the constants near the top:
   - `GITHUB_OWNER` — your GitHub username or org
   - `GITHUB_REPO` — the repo name (e.g. `pradera-menu`)
   - `GITHUB_BRANCH` — usually `main`
4. Go to **Project Settings** (the gear icon) > **Script Properties**, and
   add these three properties:
   - `GITHUB_TOKEN` — a GitHub personal access token with `contents:write`
     permission on the target repo
   - `CLOUDINARY_CLOUD_NAME` — your Cloudinary cloud name
   - `CLOUDINARY_UPLOAD_PRESET` — an unsigned upload preset on that cloud
5. Reload the Google Sheet. A **Pradera Menu** menu should appear in the
   menu bar with a **Sync changes** item.
6. Run **Sync changes** once. Google will prompt you to authorize the
   script — it needs permission to read your Drive files (for images) and
   to make external HTTP requests (Cloudinary + GitHub). Approve both.

## Ongoing use

Whenever the menu changes, edit the sheet and run **Pradera Menu > Sync
changes**. The script will:

1. Read every tab, filter to `Available = TRUE` rows, sort by `Order`.
2. Upload any image whose `Cloudinary URL` cell is still empty, then cache
   the result back into that cell.
3. Skip (with a warning, not a failure) any row whose image fails to
   upload, keeping its previous image if it had one.
4. Commit the resulting JSON to `data/menu.json` on GitHub.
5. Show a summary alert — including any per-row warnings — when done.

Never edit `data/menu.json` by hand in the deployed repo; it's overwritten
on every sync.
