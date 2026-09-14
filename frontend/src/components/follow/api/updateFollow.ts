import { requestJornizApi } from "../../../lib/api/requestJornizApi";

export interface FollowResult {
  followed: boolean;
  followers_count: number;
}

export function updateFollow(memberId: string, follow: boolean) {
  return requestJornizApi<FollowResult>(`/api/users/${encodeURIComponent(memberId)}/follow`, {
    method: follow ? "PUT" : "DELETE",
  });
}
