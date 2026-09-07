export type UserType =
  | "general_user"
  | "creator"
  | "job_seeker"
  | "recruiter"
  | "doctor"
  | "seller"
  | "pharmacy_partner"
  | "diagnostic_partner"
  | "advertiser";

export interface JornizProfile {
  specialty?: string;
  title?: string;
  hospital?: string;
  company_name?: string;
  store_name?: string;
  avatar?: string;
  [key: string]: unknown;
}

export interface JornizUser {
  id: number | string;
  email: string;
  name?: string;
  user_type: UserType;
  system_role?: string;
  profile?: JornizProfile;
  is_verified?: boolean;
  approval_status?: string;
  specialty?: string;
  hospital?: string;
  avatar_url?: string;
  [key: string]: unknown;
}

export type User = JornizUser;

export interface AuthResponse {
  access_token?: string;
  token?: string;
  refresh_token?: string;
  user: JornizUser;
  message?: string;
  requires_verification?: boolean;
  approval_status?: string;
}
