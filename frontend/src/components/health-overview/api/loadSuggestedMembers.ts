import { requestJornizApi } from "../../../lib/api/requestJornizApi";
import type { SuggestedMember } from "../components/SuggestedMembersCard";

interface SuggestedMemberResponse {
  id: string;
  name?: string;
  user_type?: string;
  specialty?: string;
  avatar_url?: string;
  is_verified?: boolean;
}

export async function loadSuggestedMembers(signal?: AbortSignal): Promise<SuggestedMember[]> {
  const response = await requestJornizApi<{ suggestions: SuggestedMemberResponse[] }>("/api/users/follow-suggestions", { signal });
  return (response.suggestions ?? []).map((member) => ({
    id: member.id,
    name: member.name ?? "Jorniz member",
    description: member.specialty ?? member.user_type?.split("_").join(" ") ?? "Member",
    avatarUrl: member.avatar_url,
    verified: member.is_verified,
  }));
}
