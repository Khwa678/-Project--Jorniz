import { sessionStore } from "../auth/sessionStore";

const configuredApiBase = import.meta.env.VITE_API_URL?.trim() || "";

export const API_BASE_URL = configuredApiBase.replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function errorMessage(payload: unknown): string {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const message = record.detail || record.error || record.message;
    if (typeof message === "string") return message;
  }
  return "The request could not be completed.";
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  const token = sessionStore.getAccessToken();

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  const text = await response.text();
  let payload: unknown = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      throw new ApiError("The server returned an invalid response.", response.status, text);
    }
  }

  if (!response.ok) {
    throw new ApiError(errorMessage(payload), response.status, payload);
  }

  return payload as T;
}
