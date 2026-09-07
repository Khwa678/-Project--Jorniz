import { requestJornizApi } from "../../../lib/api/requestJornizApi";
import type { AccountAccessResult } from "../types";

export interface SignInInput {
  email: string;
  password: string;
}

export function signIn(credentials: SignInInput): Promise<AccountAccessResult> {
  return requestJornizApi<AccountAccessResult>("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    }),
  });
}
