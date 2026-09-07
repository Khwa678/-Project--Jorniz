import { requestJornizApi } from "../api/requestJornizApi";
import { normalizeUser } from "./accountIdentity";
import type { SignedInAccount } from "./accountTypes";
import {
  clearSignedInAccount,
  getSignedInAccessToken,
  getSignedInRefreshToken,
  hasValidTokenShape,
  saveSignedInAccount,
} from "./signedInAccount";

type CurrentAccountResponse = SignedInAccount | { user: SignedInAccount };

export async function restoreSignedInAccount(): Promise<SignedInAccount | null> {
  const accessToken = getSignedInAccessToken();
  if (!accessToken || !hasValidTokenShape(accessToken)) {
    clearSignedInAccount();
    return null;
  }

  try {
    const response = await requestJornizApi<CurrentAccountResponse>("/api/auth/me");
    const wrapped = response as { user?: SignedInAccount };
    const rawAccount = wrapped.user ?? response as SignedInAccount;
    const account = normalizeUser(rawAccount) as SignedInAccount | null;
    if (!account) throw new Error("The server did not return an account.");
    saveSignedInAccount(account, accessToken, getSignedInRefreshToken());
    return account;
  } catch {
    clearSignedInAccount();
    return null;
  }
}
