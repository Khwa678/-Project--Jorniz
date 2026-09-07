import { requestJornizApi } from "../../../lib/api/requestJornizApi";

export interface ProfessionalConnection {
  id: string;
  status: string;
  created_at?: string;
  user_id: string;
  name: string;
  user_type?: string;
  avatar_url?: string;
}

export interface SuggestedConnection {
  id: string;
  name: string;
  user_type?: string;
  avatar_url?: string;
}

export interface ProfessionalNetworkSnapshot {
  connections: ProfessionalConnection[];
  pending_requests: ProfessionalConnection[];
}

export interface MutualConnection {
  id: string;
  name: string;
  specialty?: string;
  hospital?: string;
  avatar_url?: string;
  role?: string;
}

export function loadProfessionalNetwork(): Promise<ProfessionalNetworkSnapshot> {
  return requestJornizApi<ProfessionalNetworkSnapshot>("/api/connections/mine");
}

export async function loadConnectionSuggestions(): Promise<SuggestedConnection[]> {
  const response = await requestJornizApi<{ suggestions: SuggestedConnection[] }>("/api/connections/suggestions");
  return response.suggestions || [];
}

export function sendConnectionRequest(receiverId: string): Promise<{ message: string; connection_id?: string; status: string }> {
  return requestJornizApi("/api/connections/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ receiver_id: receiverId }),
  });
}

export function acceptConnectionInvitation(connectionId: string): Promise<{ message: string; status: string; new_hu_coins?: number }> {
  return requestJornizApi(
    `/api/connections/${encodeURIComponent(connectionId)}/accept`,
    { method: "POST" },
  );
}

export async function loadMutualConnections(targetUserId: string): Promise<{ mutualConnections: MutualConnection[]; count: number }> {
  const response = await requestJornizApi<{ mutual_connections: MutualConnection[]; count: number }>(
    `/api/connections/mutual/${encodeURIComponent(targetUserId)}`,
  );
  return { mutualConnections: response.mutual_connections || [], count: response.count || 0 };
}
