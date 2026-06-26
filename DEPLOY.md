# Deploy — ads.calibrestudio.co

Static, single-file page (`index.html` + `vercel.json`). No build step. Lives in the **Visionaire Labs' projects** Vercel team (`team_lCuOgKj6kRx90YELyNlopkl3`), same team as `getfound-site` and `presence-site` — this is their sibling.

## Get it live (pick one)

**A — Drag & drop (fastest, ~2 min, no shell/repo needed)**
1. Vercel dashboard → Add New → Project → "Deploy a template / upload" → drag the `ads-page/` folder.
2. Name it `ads-site`. Deploy. You get a `*.vercel.app` preview instantly.

**B — Vercel CLI** (when the sandbox shell is back, or from your Mac terminal)
1. `cd ads-page`
2. `vercel deploy --prod` (first run links/creates the project — choose the Visionaire Labs team, name `ads-site`).

**C — Git → Vercel (the standard Calibre flow — recommended)**
Matches `getfound-site` / `presence-site` / `indexed-audit` (GitHub org **`Calibre-Studio`** → Vercel team Visionaire Labs). Run from your Mac terminal / GitHub Desktop — Cowork has no shell or GitHub access this session.
1. Create repo **`Calibre-Studio/ads-site`** (Public, to match siblings).
2. From `ads-page/`:
   ```sh
   git init
   git add .
   git commit -m "ads.calibrestudio.co — ChatGPT Ads landing"
   git branch -M main
   git remote add origin git@github.com:Calibre-Studio/ads-site.git
   git push -u origin main
   ```
3. Vercel (Visionaire Labs team) → Add New → Project → import `Calibre-Studio/ads-site` → Deploy. Auto-deploys on every push thereafter.
4. Project → Settings → Domains → add `ads.calibrestudio.co` (calibrestudio.co already lives in this team, so it's one click; otherwise add a `CNAME ads → cname.vercel-dns.com`).

## Attach the subdomain
1. In the new project → Settings → Domains → add `ads.calibrestudio.co`.
2. `calibrestudio.co` is already in this Vercel team (getfound./presence. run here), so Vercel will offer to add the `ads` subdomain automatically. If it asks for DNS: add a `CNAME ads → cname.vercel-dns.com` at your registrar.
3. Wait for the SSL cert (auto). Done.

## Before it goes live — wire these (placeholders are in index.html)
- [ ] **OpenAI pixel:** paste the `oaiq` snippet in `<head>` (marked with a TRACKING comment). Verify in the Ads Manager event stream (private window).
- [ ] **Server-side CAPI:** stand up the Conversions API (the kit's `chatgpt-ads-setup` will do this; or wire manually).
- [ ] **Lead form:** point the `<form action>` at your CRM / scheduler, and fire `oaiq("measure","lead_created",…)` on submit.
- [ ] **Cross-links:** the "Get Found →" link in the dark section → your getfound page URL.
- [ ] **Verify copy:** chat_card char limits (page assumes ~50/100 — confirm against ads.openai.com), and that the open-GEO + category lists are still current (beta moves weekly).
- [ ] **Booking CTA:** confirm "Book a sprint" routes where you want (form vs scheduler).

## Then
This page is the **destination for the CAL-2 self-campaign**. Launch tracking first, then the ChatGPT ad → this page. "You're reading this because a ChatGPT ad worked" only goes live once the campaign is running.
