# Circle Health — Website Refresh (Demo)

A design and front-end refresh concept for **circlehealth.co**, built as a
production-grade **Next.js 15 (App Router, React Server Components)** site.

Circle Health puts a team of AI assistants inside the EMR — **Charting,
Authorization, Review, and Claims** — so behavioral health teams reduce
denials, protect revenue, and give clinicians their time back. This refresh
reframes the site around that story with a clean, trustworthy "clinical calm"
design system and a clear, conversion-focused information architecture.

> **Status:** self-contained demo. Builds and runs with **zero configuration** —
> Insights content is bundled markdown and the demo form runs in preview mode
> (captured to logs). Connect Ghost and a delivery webhook to go fully live
> without touching a single page or component. Copy is illustrative, drawn from
> public information about Circle Health, for client review.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
npm run typecheck    # strict TS, no emit
```

---

## Pages

| Route                     | Purpose                                                            |
| ------------------------- | ----------------------------------------------------------------- |
| `/`                       | Home — hero, trust strip, the four assistants, lifecycle, proof, standards, CTA |
| `/platform`               | Platform overview — lifecycle + all four assistants in depth       |
| `/platform/[assistant]`   | Product detail: `charting`, `authorization`, `review`, `claims`    |
| `/security`               | Security & compliance — HIPAA posture, controls, standards         |
| `/company`                | Mission, story, values, proof                                      |
| `/insights`               | Thought-leadership blog (behavioral-health RCM), via the CMS layer |
| `/insights/[slug]`        | Article reading view                                               |
| `/demo`                   | Request-a-demo page with a working form (`POST /api/demo`)         |

Plus SEO/infra routes: `sitemap.xml`, `robots.txt`, `feed.xml` (Insights RSS),
generated `icon` and `opengraph-image`, and a `404`.

---

## Design system — "clinical calm"

Tokens live in `tailwind.config.ts`; component classes and reading typography
in `src/app/globals.css`.

- **Palette** — clean white/`mist` surfaces; deep teal-navy `ink #0A2A33` text;
  a confident medical `teal #0E857A` as the brand; bright `aqua #1FB8A6` for the
  "compliant / positive" moments (checks, highlights); `sky` as an occasional
  secondary accent. The register is precise and reassuring — software a
  clinician trusts with a chart.
- **Type** — **Plus Jakarta Sans** (display) + **Inter** (body), self-hosted via
  `next/font` for zero layout shift. Swap for a licensed brand family in
  `src/app/layout.tsx` at handoff if desired.
- **Motion** — Framer Motion via a single restrained `Reveal` (fade-up on
  scroll into view); `prefers-reduced-motion` respected globally.
- **The mark** — an open teal ring with a live aqua node ("the circle of care,
  closed"), in `src/components/logo.tsx` and the generated favicon/OG. A
  placeholder for the client's final logo.

---

## Architecture

```
src/
├─ app/                      # App Router (RSC by default)
│  ├─ page.tsx               # Home
│  ├─ platform/              # overview + [assistant] detail pages
│  ├─ security/ company/ demo/
│  ├─ insights/              # blog list + [slug] reading view
│  ├─ api/
│  │  ├─ demo/               # → demo-request webhook (or preview log)
│  │  └─ revalidate/         # ← Ghost webhook (on-demand ISR)
│  ├─ sitemap.ts robots.ts feed.xml/   # SEO + RSS
│  ├─ icon.tsx opengraph-image.tsx     # generated brand marks
│  └─ globals.css            # design system + reading typography
├─ components/               # header, footer, hero visual, cards, forms, icons…
└─ lib/
   ├─ site.ts                # brand config & nav (single source of truth)
   ├─ platform.ts            # the product model — assistants, lifecycle, proof
   └─ content/               # swappable CMS layer for Insights
      ├─ types.ts            # ContentSource contract
      ├─ ghost.ts            # headless Ghost adapter
      ├─ local.ts            # bundled-markdown adapter (default)
      └─ index.ts            # picks backend from env
content/insights/            # sample Insights articles (markdown)
```

**Two decisions worth calling out:**

1. **`src/lib/platform.ts` is the product's single source of truth.** The home
   page, the platform page, and every `/platform/[assistant]` detail page read
   the four assistants, the lifecycle, the proof points, and the standards from
   this one file. Adding an assistant or editing a metric is a one-place change.

2. **The content layer makes the CMS a runtime choice.** Insights read through a
   `ContentSource` interface (`listPosts`, `getPost`, `getSlugs`), so the backend
   is swappable — bundled markdown today, headless Ghost in production — with **no
   page or component change**. Set `GHOST_URL` + `GHOST_CONTENT_API_KEY` and the
   site reads from Ghost (posts tagged `insight`); add a Ghost webhook →
   `/api/revalidate` for instant updates.

---

## Performance, SEO & accessibility

- Server Components + static generation; per-article ISR (`revalidate = 60`).
- `next/font` self-hosting, minimal client JS (only the header, `Reveal`, and
  the demo form are client components).
- Per-page metadata, Open Graph, `sitemap.xml`, `robots.txt`, Insights RSS, and
  JSON-LD `Article` schema on Insights.
- Semantic landmarks, skip-link, visible focus rings, labelled form fields,
  honeypot spam protection, `prefers-reduced-motion`, and WCAG-AA-minded
  contrast on the light palette.
- Security headers set in `next.config.mjs`; markdown sanitised
  (`rehype-sanitize`).

---

## Deploy to Vercel

1. Push this repo and import into Vercel (zero-config `next build`).
2. Set `NEXT_PUBLIC_SITE_URL` (see `.env.example`).
3. Point the demo form at your CRM/inbox by setting `DEMO_WEBHOOK_URL`.
4. (Optional) Connect Ghost for self-serve Insights: set `GHOST_*`, add a
   `post.*` webhook → `/api/revalidate`.

---

## Environment variables

See [`.env.example`](./.env.example). Summary:

| Variable                              | Purpose                                      |
| ------------------------------------- | -------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                | Canonical URL for SEO/OG/sitemap/RSS         |
| `GHOST_URL`, `GHOST_CONTENT_API_KEY`  | Read Insights from headless Ghost (optional) |
| `REVALIDATE_SECRET`                   | Secures the Ghost → Next revalidate hook     |
| `DEMO_WEBHOOK_URL`                    | Delivers demo requests from `/demo`          |

---

## Notes for handoff

- **Content** — all product copy lives in `src/lib/platform.ts` and page files;
  Insights live in `content/insights/*.md`. Customer names and quotes are public
  references / illustrative and should be confirmed before launch.
- **Logo & type** — the SVG mark and font pairing are high-quality placeholders;
  drop in the client's final brand assets in `src/components/logo.tsx` and
  `src/app/layout.tsx`.
- **Screenshots** — the hero product visual (`src/components/hero-visual.tsx`) is
  a pure-CSS mock; swap for a real (de-identified) product screenshot at launch.
