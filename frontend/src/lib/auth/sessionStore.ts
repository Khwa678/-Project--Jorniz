import { normalizeUser } from "./identity";
import type { JornizUser } from "./types";

const KEYS = {
  accessToken: "hu_token",
  refreshToken: "hu_refresh_token",
  user: "hu_user",
} as const;

function getStorage(): Storage | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

export const sessionStore = {
  keys: KEYS,

  getAccessToken(): string {
    return getStorage()?.getItem(KEYS.accessToken) || "";
  },

  getRefreshToken(): string {
    return getStorage()?.getItem(KEYS.refreshToken) || "";
  },

  getUser(): JornizUser | null {
    const storage = getStorage();
    const stored = storage?.getItem(KEYS.user);
    if (!stored) return null;

    try {
      return normalizeUser(JSON.parse(stored) as Partial<JornizUser>);
    } catch {
      this.clear();
      return null;
    }
  },

  store(accessToken: string, user: JornizUser, refreshToken?: string): void {
    const storage = getStorage();
    const normalized = normalizeUser(user);
    if (!storage || !normalized) return;

    storage.setItem(KEYS.accessToken, accessToken);
    storage.setItem(KEYS.user, JSON.stringify(normalized));
    if (refreshToken) {
      storage.setItem(KEYS.refreshToken, refreshToken);
    } else {
      storage.removeItem(KEYS.refreshToken);
    }
  },

  clear(): void {
    const storage = getStorage();
    storage?.removeItem(KEYS.accessToken);
    storage?.removeItem(KEYS.refreshToken);
    storage?.removeItem(KEYS.user);
  },

  hasJwtShape(token: string): boolean {
    return Boolean(token && token.split(".").length === 3);
  },
};

export function getAccessToken(): string {
  return sessionStore.getAccessToken();
}

export function getRefreshToken(): string {
  return sessionStore.getRefreshToken();
}

export function getUser(): JornizUser | null {
  return sessionStore.getUser();
}

export function store(
  accessToken: string,
  user: JornizUser,
  refreshToken?: string,
): void {
  sessionStore.store(accessToken, user, refreshToken);
}

export function clear(): void {
  sessionStore.clear();
}

export function hasJwtShape(token: string): boolean {
  return sessionStore.hasJwtShape(token);
}
