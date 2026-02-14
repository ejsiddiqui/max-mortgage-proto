export const STAGES = [
  { value: "new", label: "New", color: "blue" },
  { value: "wip", label: "WIP", color: "indigo" },
  { value: "docs_completed", label: "Docs Completed", color: "purple" },
  { value: "submitted", label: "Submitted", color: "cyan" },
  { value: "fol", label: "FOL", color: "orange" },
  { value: "disbursed", label: "Disbursed", color: "emerald" },
  { value: "closed", label: "Closed", color: "slate" },
] as const;

export const STATUSES = [
  { value: "open", label: "Open", color: "blue" },
  { value: "active", label: "Active", color: "emerald" },
  { value: "on_hold", label: "On Hold", color: "amber" },
  { value: "disbursed", label: "Disbursed", color: "emerald" },
] as const;

export const BORROWER_TYPES = [
  { value: "salaried", label: "Salaried" },
  { value: "self_employed", label: "Self-Employed" },
] as const;

export const BUSINESS_TYPES = [
  { value: "buyout", label: "Buyout" },
  { value: "equity_release", label: "Equity Release" },
] as const;

export const PROPERTY_PROFILES = [
  { value: "Land", label: "Land" },
  { value: "Building", label: "Building" },
] as const;

export const STAGE_ORDER = STAGES.map(s => s.value);
