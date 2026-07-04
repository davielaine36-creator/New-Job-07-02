/** Agent barrel — the eight loops of the factory. */
export { runDiscovery } from "./discovery";
export { auditLead } from "./audit";
export { scoreLead, planForScore } from "./scoring";
export { generateDemo } from "./demo";
export { runOutreachStep } from "./outreach";
export { suppressLead, applyComplianceFromReply, detectOptOut } from "./compliance";
export { recordReply } from "./reply-classifier";
export { runOptimizer } from "./optimizer";
