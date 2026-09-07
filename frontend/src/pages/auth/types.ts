import type { SignedInAccount } from "../../lib/auth/accountTypes";

export type AccountAccessMode = "sign-in" | "create-account";

export type JornizAccountType =
  | "general_user"
  | "creator"
  | "job_seeker"
  | "recruiter"
  | "doctor"
  | "seller"
  | "pharmacy_partner"
  | "diagnostic_partner"
  | "advertiser";

export interface AccountAccessResult {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  user: SignedInAccount;
  message?: string;
}

export interface CreateAccountInput {
  name: string;
  email: string;
  password: string;
  userType: JornizAccountType;
  specialty: string;
  organization: string;
  verificationDocument: File | null;
}

export const accountTypeChoices: ReadonlyArray<{
  value: JornizAccountType;
  label: string;
}> = [
  { value: "general_user", label: "General User" },
  { value: "creator", label: "Creator" },
  { value: "job_seeker", label: "Job Seeker" },
  { value: "recruiter", label: "Recruiter" },
  { value: "doctor", label: "Doctor or Licensed Practitioner" },
  { value: "seller", label: "Marketplace Seller" },
  { value: "pharmacy_partner", label: "Pharmacy Partner" },
  { value: "diagnostic_partner", label: "Diagnostic Partner" },
  { value: "advertiser", label: "Advertiser" },
];

export const accountTypesRequiringVerification = new Set<JornizAccountType>([
  "doctor",
  "pharmacy_partner",
  "diagnostic_partner",
]);
