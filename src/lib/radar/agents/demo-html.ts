import type { Audit, Lead, OfferLevel } from "@/lib/radar/types";
import { NICHE_LABELS } from "@/lib/radar/types";
import type { DemoCopy } from "./demo";

/**
 * Deterministic, fully self-contained HTML for a demo preview page. No external
 * assets, no scripts — safe to store and render in an iframe/preview route.
 */
export function renderDemoHtml(args: {
  lead: Lead;
  audit: Audit | null;
  offer: OfferLevel;
  copy: DemoCopy;
  accentHue: number;
}): string {
  const { lead, offer, copy, accentHue: h } = args;
  const accent = `hsl(${h} 72% 46%)`;
  const accentDark = `hsl(${h} 74% 32%)`;
  const accentSoft = `hsl(${h} 60% 96%)`;
  const body =
    offer === 1
      ? level1(lead, copy, accent, accentDark, accentSoft)
      : level2(lead, args.audit, copy, accent, accentDark, accentSoft);

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${esc(copy.headline)} · ${esc(lead.business_name)}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  :root{--accent:${accent};--accent-dark:${accentDark};--accent-soft:${accentSoft}}
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#0f172a;line-height:1.55;background:#fff}
  .wrap{max-width:1040px;margin:0 auto;padding:0 22px}
  .ribbon{background:#07090c;color:#3DF5A0;font:600 12px/1 ui-monospace,monospace;text-align:center;padding:9px;letter-spacing:.04em}
  header.nav{display:flex;align-items:center;justify-content:space-between;padding:18px 0}
  .brand{font-weight:800;font-size:19px;letter-spacing:-.01em}
  .brand span{color:var(--accent)}
  .navcta{background:var(--accent);color:#fff;padding:10px 16px;border-radius:9px;font-weight:700;font-size:14px;text-decoration:none}
  .hero{padding:56px 0 40px;display:grid;grid-template-columns:1.2fr .8fr;gap:36px;align-items:center}
  @media(max-width:760px){.hero{grid-template-columns:1fr;padding:32px 0}}
  h1{font-size:clamp(30px,5vw,48px);line-height:1.05;letter-spacing:-.03em;font-weight:800}
  .sub{margin-top:16px;font-size:18px;color:#475569;max-width:36ch}
  .cta-row{margin-top:26px;display:flex;gap:12px;flex-wrap:wrap}
  .btn{background:var(--accent);color:#fff;padding:14px 22px;border-radius:11px;font-weight:700;text-decoration:none;font-size:15px;box-shadow:0 10px 24px -12px var(--accent)}
  .btn.ghost{background:var(--accent-soft);color:var(--accent-dark);box-shadow:none}
  .hero-card{background:linear-gradient(160deg,var(--accent),var(--accent-dark));border-radius:20px;padding:26px;color:#fff;box-shadow:0 30px 60px -30px var(--accent)}
  .hero-card h3{font-size:15px;opacity:.85;font-weight:600}
  .quote-form{margin-top:14px;background:rgba(255,255,255,.14);border-radius:14px;padding:16px}
  .quote-form .fld{background:rgba(255,255,255,.9);border-radius:8px;height:38px;margin-bottom:9px}
  .quote-form .submit{background:#0f172a;color:#fff;height:42px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-weight:700}
  .badges{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}
  .badge{background:var(--accent-soft);color:var(--accent-dark);font-weight:700;font-size:12.5px;padding:7px 12px;border-radius:99px}
  section{padding:38px 0}
  .eyebrow{color:var(--accent);font-weight:800;font-size:12.5px;text-transform:uppercase;letter-spacing:.12em}
  h2{font-size:27px;letter-spacing:-.02em;margin-top:8px;font-weight:800}
  .grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:22px}
  @media(max-width:760px){.grid4{grid-template-columns:1fr 1fr}}
  .svc{border:1px solid #e6eaf0;border-radius:14px;padding:18px;background:#fff}
  .svc .ic{width:34px;height:34px;border-radius:9px;background:var(--accent-soft);display:flex;align-items:center;justify-content:center;color:var(--accent-dark);font-weight:800}
  .svc h4{margin-top:12px;font-size:15px}
  .svc p{color:#64748b;font-size:13px;margin-top:5px}
  .reviews{background:var(--accent-soft);border-radius:20px;padding:26px}
  .rgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:16px}
  @media(max-width:760px){.rgrid{grid-template-columns:1fr}}
  .rev{background:#fff;border-radius:13px;padding:16px}
  .stars{color:#f59e0b;font-size:14px}
  .rev p{font-size:13.5px;color:#334155;margin-top:8px}
  .rev .who{margin-top:10px;font-weight:700;font-size:13px}
  footer{border-top:1px solid #e6eaf0;padding:26px 0;color:#94a3b8;font-size:13px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px}
  /* Level 2 */
  .plan{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:22px}
  @media(max-width:760px){.plan{grid-template-columns:1fr}}
  .card{border:1px solid #e6eaf0;border-radius:16px;padding:20px}
  .card h4{font-size:15px;display:flex;align-items:center;gap:8px}
  .card ul{margin:10px 0 0 0;padding-left:18px;color:#475569;font-size:13.5px}
  .card li{margin:5px 0}
  .kpi{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:18px}
  @media(max-width:760px){.kpi{grid-template-columns:1fr 1fr}}
  .kpi .box{border:1px solid #e6eaf0;border-radius:13px;padding:14px}
  .kpi .n{font-size:22px;font-weight:800;color:var(--accent-dark)}
  .kpi .l{font-size:12px;color:#64748b;margin-top:3px}
  .funnel{display:flex;gap:8px;margin-top:16px;flex-wrap:wrap}
  .step{background:var(--accent-soft);color:var(--accent-dark);border-radius:10px;padding:10px 14px;font-weight:700;font-size:13px}
  .arrow{align-self:center;color:#cbd5e1;font-weight:800}
</style></head><body>
<div class="ribbon">◆ AI WORK RADAR — PROSPECT DEMO · ${esc(lead.business_name)} · not affiliated, for review only</div>
<div class="wrap">
<header class="nav"><div class="brand">${esc(shortName(lead))}<span>.</span></div>
<a class="navcta" href="#quote">${esc(copy.cta)}</a></header>
${body}
<footer><div>${esc(lead.business_name)} · ${esc(lead.location_city)}, ${esc(lead.location_state)}</div>
<div>Concept preview generated by AI Work Radar</div></footer>
</div></body></html>`;
}

function level1(
  lead: Lead,
  copy: DemoCopy,
  _a: string,
  _ad: string,
  _as: string
): string {
  return `
<div class="hero">
  <div>
    <h1>${esc(copy.headline)}</h1>
    <p class="sub">${esc(copy.subhead)}</p>
    <div class="cta-row"><a class="btn" href="#quote">${esc(copy.cta)}</a>
      <a class="btn ghost" href="tel:${esc(lead.phone ?? "")}">Call ${esc(lead.location_city)}</a></div>
    <div class="badges"><span class="badge">Licensed & Insured</span><span class="badge">${esc(lead.location_city)} & nearby</span><span class="badge">Same-day estimates</span></div>
  </div>
  <div class="hero-card" id="quote"><h3>Fast quote</h3>
    <div class="quote-form"><div class="fld"></div><div class="fld"></div><div class="fld"></div><div class="submit">${esc(copy.cta)}</div></div>
  </div>
</div>
<section>
  <div class="eyebrow">Services</div><h2>What we do in ${esc(lead.location_city)}</h2>
  <div class="grid4">${copy.services
    .map(
      (s, i) =>
        `<div class="svc"><div class="ic">${i + 1}</div><h4>${esc(s)}</h4><p>Reliable ${esc(NICHE_LABELS[lead.niche].toLowerCase())} work, done right the first time.</p></div>`
    )
    .join("")}</div>
</section>
<section>
  <div class="reviews"><div class="eyebrow">Reviews</div><h2>Neighbors trust ${esc(shortName(lead))}</h2>
  <div class="rgrid">${copy.reviews
    .map(
      (r) =>
        `<div class="rev"><div class="stars">★★★★★</div><p>"${esc(r.text)}"</p><div class="who">${esc(r.name)}</div></div>`
    )
    .join("")}</div></div>
</section>`;
}

function level2(
  lead: Lead,
  audit: Audit | null,
  copy: DemoCopy,
  _a: string,
  _ad: string,
  _as: string
): string {
  const city = lead.location_city;
  return `
<div class="hero">
  <div>
    <h1>${esc(copy.headline)}</h1>
    <p class="sub">${esc(copy.subhead)}</p>
    <div class="cta-row"><a class="btn" href="#quote">Book a strategy call</a></div>
  </div>
  <div class="hero-card"><h3>Where you stand today</h3>
    <div class="kpi" style="margin-top:12px">
      <div class="box" style="background:rgba(255,255,255,.12);border:none;color:#fff"><div class="n" style="color:#fff">${audit?.website_score ?? 42}</div><div class="l" style="color:rgba(255,255,255,.8)">Site score</div></div>
      <div class="box" style="background:rgba(255,255,255,.12);border:none;color:#fff"><div class="n" style="color:#fff">${audit?.seo_score ?? 35}</div><div class="l" style="color:rgba(255,255,255,.8)">Local SEO</div></div>
    </div>
  </div>
</div>
<section>
  <div class="eyebrow">The plan</div><h2>A growth system for ${esc(city)}</h2>
  <div class="plan">
    <div class="card"><h4>① Website + conversion</h4><ul><li>Mobile-first refresh with clear services</li><li>Fast, obvious quote & call CTAs</li><li>Trust: reviews, badges, guarantees</li></ul></div>
    <div class="card"><h4>② Local SEO</h4><ul><li>Google Business Profile audit & fixes</li><li>City + service page structure</li><li>Review-request flow to earn ranking signals</li></ul></div>
    <div class="card"><h4>③ Traffic & ads</h4><ul><li>Google Ads starter structure (high-intent)</li><li>One focused landing page per service</li><li>Retargeting plan — no wasted spend</li></ul></div>
    <div class="card"><h4>④ Track & report</h4><ul><li>Call tracking + form attribution</li><li>Simple CRM pipeline for new leads</li><li>Monthly dashboard: jobs by source</li></ul></div>
  </div>
</section>
<section>
  <div class="eyebrow">Lead funnel</div><h2>Every lead, tracked end to end</h2>
  <div class="funnel"><div class="step">Search / Ad</div><div class="arrow">→</div><div class="step">Landing page</div><div class="arrow">→</div><div class="step">Quote form / call</div><div class="arrow">→</div><div class="step">CRM pipeline</div><div class="arrow">→</div><div class="step">Booked job</div></div>
  <div class="kpi">
    <div class="box"><div class="n">Wk 1-2</div><div class="l">Site + tracking live</div></div>
    <div class="box"><div class="n">Wk 2-4</div><div class="l">SEO + landing pages</div></div>
    <div class="box"><div class="n">Wk 3+</div><div class="l">Ads + retargeting</div></div>
    <div class="box"><div class="n">Monthly</div><div class="l">Report & tune</div></div>
  </div>
</section>`;
}

function shortName(lead: Lead): string {
  return lead.business_name.split(" ").slice(0, 2).join(" ");
}

function esc(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
