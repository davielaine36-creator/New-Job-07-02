# Ultra-Premium Personal Media Website

A custom **Next.js 15 (App Router, Server Components)** front-end for a
cultural-media brand — long-form essays, shorter notes, and a native
newsletter. The aesthetic is **futuristic dark-luxury minimalism**: a deep
cosmic void, warm ivory reading surfaces, and champagne-gold used like fine
jewellery — thin lines, hairline rules, refined highlights, never flashy.

> **Status:** production-ready front-end running on bundled sample content.
> Connect Ghost (two env vars) to go fully self-serve. Nothing about the
> pages, components, or styling changes when you switch backends.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
npm run typecheck    # strict TS, no emit
```

With **no** environment variables set, the site serves the bundled markdown in
`/content` and the forms run in "preview" mode (captured to server logs). This
is intentional: the repo builds and demos with zero configuration.

---

## Pages (launch scope)

| Route            | Purpose                                                        |
| ---------------- | -------------------------------------------------------------- |
| `/`              | Hero, latest essays, notes strip, prominent newsletter signup  |
| `/essays`        | Long-form archive — **doubles as the newsletter archive**      |
| `/essays/[slug]` | Essay reading view + subscribe CTA under every piece           |
| `/notes`         | Shorter observations, fragments, rabbit holes                  |
| `/notes/[slug]`  | Note view — supports text, image, **embedded video**           |
| `/about`         | About (final copy supplied by client)                          |
| `/work-with-me`  | Premium, simple enquiry form                                   |
| `/subscribe`     | Persistent subscribe destination                               |

**Subscribe** is a persistent CTA — in the nav, under every essay, in the
footer, and on its own page.

A **"Listen" (podcast)** section is *architected for but intentionally not
built* — see [Future-proofing](#future-proofing-the-listen-section).

---

## Recommended stack & why: **headless Ghost**

The brief's preferred stack is the right call. **Ghost** is one owned backend
for **content + email delivery + (later) paid membership**, which keeps the
newsletter *part of the brand* rather than rented from a third party.

- **Publishing (self-serve, no code):** the author writes and edits essays and
  notes in **Ghost admin** — a clean, non-technical editor with drafts,
  scheduling, images, and embeds. This Next.js front-end reads from Ghost's
  **Content API**.
- **Content mapping:** essays = Ghost posts tagged `essay`; notes = posts
  tagged `note`. That's the only convention the author needs to know.
- **Delivery:** publishing an essay in Ghost sends it to subscribers by email
  from your own domain, and it appears here instantly via the revalidation
  webhook. The archive on this site is canonical.
- **Membership later:** Ghost Members powers free → paid tiers with no
  re-platforming.

**Alternative considered — CMS + dedicated ESP** (e.g. Sanity + Beehiiv/Kit):
best-of-breed editing and email, but it splits content and audience across two
systems, adds a sync surface, and complicates "the newsletter lives on the
site." Recommended **only** if bespoke editorial layouts outweigh the
simplicity of one backend. This codebase supports it too — set `ESP_*` instead
of `GHOST_MEMBERS_*` (see below); the content layer would read from Sanity via
a sibling adapter to `src/lib/content/ghost.ts`.

### Connecting Ghost

```bash
# .env.local (and Vercel project settings)
GHOST_URL=https://your-site.ghost.io
GHOST_CONTENT_API_KEY=xxxxxxxxxxxxxxxxxxxxxx   # Ghost → Integrations → Content API
```

When both are present the site reads from Ghost automatically. Add a Ghost
**webhook** (`post.published`, `post.edited`, `post.unpublished`) pointing at
`POST /api/revalidate?secret=$REVALIDATE_SECRET` for instant updates; otherwise
content refreshes on a 60-second ISR window.

---

## Email deliverability (SPF / DKIM / DMARC)

Reliable inboxing is a DNS + provider task, done once at the domain:

1. **Sending domain** — configure Ghost (via its Mailgun integration) or your
   ESP with a subdomain such as `mail.yourdomain.com`.
2. **SPF** — TXT record authorising the provider's sending servers, e.g.
   `v=spf1 include:mailgun.org ~all`.
3. **DKIM** — add the provider's CNAME/TXT signing keys so mail is
   cryptographically signed.
4. **DMARC** — `_dmarc` TXT starting at `p=none` (monitor), tightening to
   `p=quarantine` then `p=reject` once aligned:
   `v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com`.
5. Verify with the provider dashboard + a tool like mail-tester before launch.

The site never sends mail itself; it hands the address to the owned system.
`/api/subscribe` supports both Ghost Members and a generic ESP endpoint.

---

## Architecture

```
src/
├─ app/                      # App Router (RSC by default)
│  ├─ page.tsx               # Home
│  ├─ essays/ notes/         # archives + [slug] reading views
│  ├─ about/ work-with-me/ subscribe/
│  ├─ api/
│  │  ├─ subscribe/          # → Ghost Members or ESP
│  │  ├─ enquiry/            # → private webhook
│  │  └─ revalidate/         # ← Ghost webhook (on-demand ISR)
│  ├─ sitemap.ts robots.ts feed.xml/   # SEO + RSS
│  ├─ icon.tsx opengraph-image.tsx     # generated brand marks
│  └─ globals.css            # design system + reading typography
├─ components/               # header, footer, cards, forms, Reveal…
└─ lib/
   ├─ site.ts                # brand config & nav (single source of truth)
   └─ content/               # ← the swappable content layer
      ├─ types.ts            # ContentSource contract
      ├─ ghost.ts            # headless Ghost adapter
      ├─ local.ts            # bundled-markdown adapter (default)
      └─ index.ts            # picks backend from env
content/                     # sample essays & notes (markdown)
```

**The content layer is the key design decision.** Every page reads through the
`ContentSource` interface (`listPosts`, `getPost`, `getSlugs`), so the CMS is a
runtime choice — local markdown today, Ghost in production, Sanity if ever
needed — with **no page or component change**.

### Future-proofing: the "Listen" section

Adding a podcast later is additive, not a rebuild:

- New `Episode` type + `episodes` adapter methods alongside the existing ones.
- `/listen` and `/listen/[slug]` routes reusing the same layout primitives.
- An audio player component + a `/podcast.xml` route (RSS with `<enclosure>`
  audio and iTunes tags) mirroring the existing `feed.xml`.
- A nav entry in `src/lib/site.ts` — one line.

Nothing in the current information architecture blocks it.

---

## Design system

Tokens live in `tailwind.config.ts`; reading typography in
`src/app/globals.css`.

- **Palette** — `void #050506` · `obsidian` · `onyx` surfaces; `ivory #f4efe6`
  / `cream` text; `champagne #d8bd8a` / `gold #c9a86a` accents. Colour & finish
  follow this brief; the supplied brand deck governs structure, voice, and
  typographic feel.
- **Type** — display serif **Fraunces** (opsz) + grotesque **Inter**, loaded
  via `next/font` (self-hosted, zero layout shift). These are high-quality
  stand-ins; swap for the licensed families you purchase (see below).
- **Motion** — Framer Motion: a single restrained fade-up (`Reveal`),
  reduced-motion respected globally.
- **The gold rule** (`.rule-gold`) and hairline borders are the recurring
  "jewellery" motif — thin, warm, and sparing.

### Recommended premium typefaces (client licenses)

Any of these deliver the intended finish; drop the licensed webfonts into
`next/font/local` and update the two families in `src/app/layout.tsx`:

- **Display serif:** GT Sectra · Canela · Reckless · Ogg
- **Grotesque UI:** Söhne · Neue Haas Grotesk · GT America

---

## Performance, SEO & accessibility

- Server Components + static generation; per-post ISR (`revalidate = 60`).
- `next/font` self-hosting, `next/image` (AVIF/WebP), minimal client JS.
- Per-page metadata, Open Graph, `sitemap.xml`, `robots.txt`, RSS, and
  JSON-LD `Article` schema on essays.
- Semantic landmarks, skip-link, visible focus rings, labelled forms,
  `prefers-reduced-motion`, WCAG-AA contrast on the dark palette.
- Security headers set in `next.config.mjs`; markdown/embeds sanitised
  (`rehype-sanitize`) with an allowlist for video iframes.

**Target:** Lighthouse 90+ (Performance, SEO, Best Practices, Accessibility)
on Home and a representative essay. Run against a production build:
`npm run build && npm start`, then Lighthouse `http://localhost:3000`.

---

## Deploy to Vercel

1. Push this repo (client owns it) and import into Vercel.
2. Set env vars from `.env.example` (at minimum `NEXT_PUBLIC_SITE_URL`; add the
   `GHOST_*` vars to go live on content + email).
3. Add the custom domain; configure the email DNS records above.
4. Add the Ghost `post.*` webhook → `/api/revalidate`.

Zero-config build: `next build`. No serverless surprises — content APIs are
cached at the edge.

---

## Environment variables

See [`.env.example`](./.env.example). Summary:

| Variable                         | Purpose                                   |
| -------------------------------- | ----------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`           | Canonical URL for SEO/OG/sitemap/RSS      |
| `GHOST_URL`, `GHOST_CONTENT_API_KEY` | Read content from headless Ghost      |
| `GHOST_MEMBERS_INTEGRATION_URL`  | Newsletter signups → Ghost Members        |
| `ESP_SUBSCRIBE_URL`, `ESP_API_KEY` | Newsletter signups → dedicated ESP      |
| `REVALIDATE_SECRET`              | Secures the Ghost → Next revalidate hook  |
| `ENQUIRY_WEBHOOK_URL`            | Delivers "Work With Me" enquiries         |

---

## Proposal summary (per the brief)

- **Stack:** headless **Ghost** — one owned backend for content, email, and
  future paid membership; custom Next.js front-end over the Content API.
- **Self-serve publishing:** author works entirely in Ghost admin; the site
  reads via the content layer and revalidates on a webhook.
- **Deliverability:** SPF, DKIM, and DMARC configured on the sending domain
  (see above), verified before launch.
- **Aesthetic in one line:** a deep cosmic void and warm ivory prose, with a
  single champagne hairline doing the work a gilded surface never could —
  luxury as restraint, not decoration.
- **Biggest timeline risk:** email deliverability & DNS/domain access sit
  outside the codebase and gate launch. Managed by requesting registrar/DNS
  access at kickoff, standing up SPF/DKIM/DMARC in week one against a staging
  send, and starting DMARC at `p=none` so warm-up runs in parallel with build
  rather than blocking launch.
- **Realistic timeline:** ~6–8 weeks — Week 1 setup + Ghost/DNS, Weeks 2–3
  design sign-off, Weeks 4–6 build, Weeks 7–8 content load, QA, Lighthouse,
  cross-browser, handoff + walkthrough video.
