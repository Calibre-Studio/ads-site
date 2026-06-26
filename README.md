# ads-site

**ChatGPT Ads by Calibre Studio** — done-for-you ChatGPT (OpenAI) ad campaigns. Live at **ads.calibrestudio.co**.

Sibling to `getfound-site` / `presence-site` / `indexed-audit` (GitHub org `Calibre-Studio` → Vercel team "Visionaire Labs' projects"). The paid arm of Calibre's AI-visibility line: AEO makes you the brand AI *recommends*; this makes you the brand AI *shows*.

## Contents
- `index.html` — the landing page (self-contained, monochrome house style, no build step)
- `vercel.json` — static config + security headers
- `DEPLOY.md` — push + subdomain + pre-launch wiring runbook

## Deploy
Static site, zero build. Git → Vercel (auto-deploy on push), then add the `ads.calibrestudio.co` domain. Full steps in `DEPLOY.md`.

## Before go-live
Wire the `oaiq` pixel, the lead form → CRM/scheduler (+ `lead_created` event), server-side CAPI, and the "Get Found →" cross-link. This page is the destination for the Calibre self-campaign (Multica CAL-2).
