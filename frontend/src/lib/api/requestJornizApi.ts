import { apiRequest } from "./apiClient";

export function requestJornizApi<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (typeof options.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return apiRequest<T>(path, { ...options, headers });
}
