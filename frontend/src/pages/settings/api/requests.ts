import { requestJornizApi } from "../../../lib/api/requestJornizApi";
import type { SignedInAccount } from "../../../lib/auth/accountTypes";

export interface ProfileSettingsInput {
  name: string;
  bio: string;
  avatarUrl?: string;
  specialty?: string;
  hospital?: string;
  location?: string;
}

export interface SignedInSession {
  id: string;
  deviceInfo: string;
  ipAddress: string;
  createdAt: string;
  revoked: boolean;
}

export interface AccountExport {
  user: Record<string, unknown>;
  posts: Array<Record<string, unknown>>;
  exportDate: string;
}

export async function saveProfileSettings(
  input: ProfileSettingsInput,
): Promise<SignedInAccount> {
  const response = await requestJornizApi<
    SignedInAccount | { user: SignedInAccount }
  >("/api/auth/update", {
    method: "PUT",
    body: JSON.stringify({
      name: input.name,
      bio: input.bio,
      avatar_url: input.avatarUrl ?? "",
      specialty: input.specialty ?? "",
      hospital: input.hospital ?? "",
      location: input.location ?? "",
    }),
  });
  const wrapped = response as { user?: SignedInAccount };
  return wrapped.user ?? response as SignedInAccount;
}

export async function loadSignedInSessions(): Promise<SignedInSession[]> {
  const response = await requestJornizApi<{
    sessions?: Array<Record<string, unknown>>;
  }>("/api/auth/sessions");
  return (response.sessions ?? []).map((session) => ({
    id: String(session.id ?? ""),
    deviceInfo: String(session.device_info ?? "Unknown device"),
    ipAddress: String(session.ip_address ?? "Unknown address"),
    createdAt: String(session.created_at ?? ""),
    revoked: Boolean(session.is_revoked),
  }));
}

export async function exportAccountData(): Promise<AccountExport> {
  const response = await requestJornizApi<{
    user?: Record<string, unknown>;
    posts?: Array<Record<string, unknown>>;
    export_date?: string;
  }>("/api/auth/export-data", { method: "POST" });
  return {
    user: response.user ?? {},
    posts: response.posts ?? [],
    exportDate: String(response.export_date ?? new Date().toISOString()),
  };
}

export async function deactivateAccount(): Promise<void> {
  await requestJornizApi("/api/auth/delete-account", { method: "POST" });
}
