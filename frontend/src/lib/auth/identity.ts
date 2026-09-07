import type { JornizUser, UserType } from "./types";

export const USER_TYPE_LABELS: Record<UserType, string> = {
  general_user: "General User",
  creator: "Creator",
  job_seeker: "Job Seeker",
  recruiter: "Recruiter",
  doctor: "Doctor",
  seller: "Seller",
  pharmacy_partner: "Pharmacy Partner",
  diagnostic_partner: "Diagnostic Partner",
  advertiser: "Advertiser",
};

const LEGACY_TYPES: Record<string, UserType> = {
  patient: "general_user",
  "general user": "general_user",
  doctor: "doctor",
  "ayurvedic doctor": "doctor",
  "homeopathic doctor": "doctor",
  "unani practitioner": "doctor",
  naturopath: "doctor",
  nurse: "doctor",
  dentist: "doctor",
  physiotherapist: "doctor",
  psychologist: "doctor",
  nutritionist: "doctor",
  researcher: "creator",
  pharmacist: "pharmacy_partner",
  employer: "recruiter",
};

export function canonicalUserType(value: unknown): UserType {
  const key = String(value || "general_user")
    .trim()
    .toLowerCase()
    .replace(/[-_]+/g, " ");
  const canonical = key.replace(/\s+/g, "_") as UserType;

  return canonical in USER_TYPE_LABELS
    ? canonical
    : LEGACY_TYPES[key] || "general_user";
}

export function normalizeUser(raw: Partial<JornizUser> | null): JornizUser | null {
  if (!raw || raw.id == null || !raw.email) return null;

  const legacyRole = typeof raw.role === "string" ? raw.role : undefined;
  const profile = { ...(raw.profile || {}) };
  const user: JornizUser = {
    ...raw,
    id: raw.id,
    email: raw.email,
    user_type: canonicalUserType(raw.user_type || legacyRole),
    system_role: raw.system_role || "member",
    profile,
  };

  if (user.user_type === "doctor") {
    profile.specialty ||= user.specialty;
    profile.hospital ||= user.hospital;
    profile.avatar ||= user.avatar_url;
  }

  return user;
}

export function userTypeLabel(user: Partial<JornizUser>): string {
  return USER_TYPE_LABELS[canonicalUserType(user.user_type || user.role)];
}

export function professionalLabel(user: Partial<JornizUser>): string {
  const normalized = normalizeUser(user);
  return String(
    normalized?.profile?.specialty ||
      normalized?.profile?.title ||
      normalized?.specialty ||
      userTypeLabel(user),
  );
}

export function organizationName(user: Partial<JornizUser>): string {
  const normalized = normalizeUser(user);
  return String(
    normalized?.profile?.hospital ||
      normalized?.profile?.company_name ||
      normalized?.profile?.store_name ||
      normalized?.hospital ||
      "",
  );
}

export const canonicalType = canonicalUserType;
export const typeLabel = userTypeLabel;
