/**
 * The Circle Health product model — a single source of truth for the four
 * AI assistants, the intake-to-discharge lifecycle, proof points, and the
 * standards the platform is built around. The home page, the platform page,
 * and the dynamic /platform/[assistant] pages all read from here.
 *
 * Content is drawn from public information about Circle Health and is
 * illustrative for this design refresh.
 */

export type IconName =
  | "chart"
  | "authorization"
  | "review"
  | "claims"
  | "shield"
  | "clock"
  | "spark";

export type Assistant = {
  slug: string;
  name: string;
  icon: IconName;
  stage: string;
  tagline: string;
  summary: string;
  /** Longer paragraph for the detail page hero. */
  detail: string;
  metric: { value: string; label: string };
  capabilities: { title: string; body: string }[];
};

export const assistants: Assistant[] = [
  {
    slug: "charting",
    name: "Charting Assistant",
    icon: "chart",
    stage: "Document",
    tagline: "Compliant charts, written as you work",
    summary:
      "Capture the encounter by ambient listening, dictation, typing, or upload — and get a complete, medical-necessity-ready chart in minutes.",
    detail:
      "Charting is where clinician hours disappear. The Charting Assistant captures the session however your team already works — ambient listening, post-session dictation, typing, or an uploaded file — and drafts structured, compliant documentation as the clinician works. From ASAM assessments to discharge summaries, charts are built with the right language, the right codes, and the right prompts to prove medical necessity the first time.",
    metric: { value: "20+ hrs", label: "of charting saved per clinician, weekly" },
    capabilities: [
      {
        title: "Capture any way your team works",
        body: "Ambient listening, dictation, typing, or file upload — the assistant meets clinicians where they are, inside the EMR.",
      },
      {
        title: "ASAM to discharge in minutes",
        body: "Generate assessments, progress notes, treatment plans, and discharge summaries with consistent, defensible language.",
      },
      {
        title: "Built-in coding & necessity checks",
        body: "ICD-10-CM/PCS and CPT coding with medical-necessity and prior-auth prompts surfaced while the note is still being written.",
      },
    ],
  },
  {
    slug: "authorization",
    name: "Authorization Assistant",
    icon: "authorization",
    stage: "Authorize",
    tagline: "Prior auth requests, ready to send",
    summary:
      "Turn the clinical record into a complete, payer-ready authorization packet — so approvals come faster and staff stop chasing paperwork.",
    detail:
      "Prior authorization is a tax on both revenue and morale. The Authorization Assistant reads the clinical record and assembles a complete, payer-specific request — pulling the criteria that matter, framing medical necessity, and flagging anything missing before it goes out. Utilization review teams spend less time assembling packets and more time on the reviews that actually move care forward.",
    metric: { value: "Faster", label: "approvals with fewer back-and-forths" },
    capabilities: [
      {
        title: "Payer-ready in one pass",
        body: "Assembles the authorization request against payer and level-of-care criteria, with the clinical evidence attached.",
      },
      {
        title: "Catch gaps before submission",
        body: "Flags missing documentation and weak necessity language while there's still time to fix it — not after a denial.",
      },
      {
        title: "Less administrative burden",
        body: "UR staff review and send instead of building packets from scratch, freeing hours for concurrent review.",
      },
    ],
  },
  {
    slug: "review",
    name: "Review Assistant",
    icon: "review",
    stage: "Review",
    tagline: "Real-time QA on every chart",
    summary:
      "Score every chart against payer, regulatory, and accreditation standards the moment it's written — with issues flagged in real time.",
    detail:
      "Quality review usually happens too late — after the note is signed, after the claim is out, after the auditor asks. The Review Assistant moves QA to the point of documentation. It checks every chart against payer, regulatory, and accreditation standards, returns an instant compliance score, and flags exactly what's missing or misaligned so it can be fixed before it becomes a denial or a survey finding.",
    metric: { value: "Instant", label: "compliance scoring on every chart" },
    capabilities: [
      {
        title: "Standards, built in",
        body: "Charts are checked against TJC, CARF, NCQA, MCG/Milliman, BHCOE, and payer-specific requirements automatically.",
      },
      {
        title: "Real-time flagging",
        body: "Issues surface as the chart is written, with a clear compliance score and specific, actionable fixes.",
      },
      {
        title: "Audit-ready by default",
        body: "Documentation demonstrates progress, milestones, and outcomes — the record you want when the auditor arrives.",
      },
    ],
  },
  {
    slug: "claims",
    name: "Claims Assistant",
    icon: "claims",
    stage: "Bill",
    tagline: "Clean claims, scrubbed before they go",
    summary:
      "Scrub every chart pre-claim, validate ICD-to-CPT alignment, and confirm payer requirements are met before submission.",
    detail:
      "A denial is expensive twice — once in lost revenue and again in the staff time to appeal it. The Claims Assistant runs a pre-claim scrub across the chart, validates that ICD and CPT codes align, and confirms documentation meets payer and accreditation requirements before anything is submitted. Clean claims go out, denials come down, and the revenue that behavioral health teams earn is the revenue they keep.",
    metric: { value: "Fewer", label: "claim & UR denials" },
    capabilities: [
      {
        title: "Automated pre-claim scrub",
        body: "Every chart is checked for completeness and compliance before the claim is generated.",
      },
      {
        title: "ICD ↔ CPT validation",
        body: "Confirms diagnosis and procedure codes align and are supported by the documentation.",
      },
      {
        title: "Protect earned revenue",
        body: "Fewer denials and cleaner first-pass claims mean more of the care you deliver actually gets paid.",
      },
    ],
  },
];

export function getAssistant(slug: string) {
  return assistants.find((a) => a.slug === slug);
}

/** Intake-to-discharge lifecycle — the story the four assistants tell together. */
export const lifecycle = [
  { step: "Intake", body: "Assessment and level-of-care captured cleanly from the first session." },
  { step: "Authorize", body: "Prior auth assembled from the record and sent payer-ready." },
  { step: "Treat & chart", body: "Compliant documentation drafted as clinicians deliver care." },
  { step: "Review", body: "Every chart scored against standards, issues fixed in real time." },
  { step: "Bill", body: "Claims scrubbed and validated before they ever leave the building." },
  { step: "Discharge", body: "Audit-ready records, outcomes demonstrated, revenue protected." },
];

/** Headline proof points. */
export const stats = [
  { value: "20+ hrs", label: "of charting time saved per clinician each week" },
  { value: "250+", label: "facilities supported across the customer base" },
  { value: "Fewer", label: "claim and utilization-review denials" },
  { value: "In-EMR", label: "assistants that work where your team already does" },
];

/** Standards & frameworks the platform is built around. */
export const standards = [
  "The Joint Commission (TJC)",
  "CARF",
  "NCQA",
  "MCG / Milliman",
  "BHCOE",
  "ASAM Criteria",
  "ICD-10-CM/PCS",
  "CPT",
];

/** Illustrative customers (public references). */
export const customers = [
  "Pyramid Healthcare",
  "Monument Recovery",
  "CodeMax",
  "Catholic Guardian Services",
];

export const testimonial = {
  quote:
    "Our clinicians got their evenings back, and our denial rate dropped. Circle sits inside the workflow we already use — there was nothing new to learn, it just made the documentation better.",
  attribution: "Director of Quality, multi-site behavioral health provider",
};
