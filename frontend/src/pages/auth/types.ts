import type { SignedInAccount } from "../../lib/auth/accountTypes";
import { ACCOUNT_TYPE_OPTIONS, PROFESSIONAL_VERIFICATION_ACCOUNT_TYPES } from "../../lib/accounts/constants";
import type { AccountType } from "../../lib/accounts/types";

export type AccountAccessMode = "sign-in" | "create-account";

export type JornizAccountType = AccountType;

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

export const accountTypeChoices = ACCOUNT_TYPE_OPTIONS;

export const accountTypesRequiringVerification = new Set<JornizAccountType>(PROFESSIONAL_VERIFICATION_ACCOUNT_TYPES);
