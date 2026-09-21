export const ACCOUNT_TYPE_OPTIONS = [
  { value: "general_user", label: "General User" },
  { value: "creator", label: "Creator" },
  { value: "job_seeker", label: "Job Seeker" },
  { value: "recruiter", label: "Recruiter" },
  { value: "doctor", label: "Doctor or Licensed Practitioner" },
  { value: "seller", label: "Marketplace Seller" },
  { value: "pharmacy_partner", label: "Pharmacy Partner" },
  { value: "diagnostic_partner", label: "Diagnostic Partner" },
  { value: "advertiser", label: "Advertiser" },
] as const;

export const ACCOUNT_TYPE_VALUES = ACCOUNT_TYPE_OPTIONS.map((option) => option.value);

export const PROFESSIONAL_VERIFICATION_ACCOUNT_TYPES = [
  "doctor",
  "pharmacy_partner",
  "diagnostic_partner",
] as const;
