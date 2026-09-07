import {
  clear,
  getAccessToken,
  getRefreshToken,
  getUser,
  hasJwtShape,
  store,
} from "./sessionStore";
import type { SignedInAccount } from "./accountTypes";

export function getSignedInAccount(): SignedInAccount | null {
  return getUser();
}

export function getSignedInAccessToken(): string {
  return getAccessToken();
}

export function getSignedInRefreshToken(): string {
  return getRefreshToken();
}

export function saveSignedInAccount(
  account: SignedInAccount,
  accessToken: string,
  refreshToken?: string,
): void {
  store(accessToken, account, refreshToken);
}

export function clearSignedInAccount(): void {
  clear();
}

export function updateStoredSignedInAccount(account: SignedInAccount): void {
  const accessToken = getAccessToken();
  if (!accessToken) return;
  store(accessToken, account, getRefreshToken());
}

export function hasValidTokenShape(token: string): boolean {
  return hasJwtShape(token);
}
