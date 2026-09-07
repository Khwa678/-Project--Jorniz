import { requestJornizApi } from "../../../lib/api/requestJornizApi";
import type { SignedInAccount } from "../../../lib/auth/accountTypes";
import type { MemberPost, ProfessionalExperience, ProfessionalExperienceInput, SkillEndorsement } from "../types";

export async function loadSignedInMemberProfile(signal?: AbortSignal): Promise<SignedInAccount> {
  const response = await requestJornizApi<SignedInAccount | { user: SignedInAccount }>("/api/auth/me", { signal });
  const wrapped = response as { user?: SignedInAccount };
  return wrapped.user ?? response as SignedInAccount;
}

export function loadSignedInMemberPosts(signal?: AbortSignal) {
  return requestJornizApi<MemberPost[]>("/api/posts/mine", { signal });
}

export async function loadMemberExperiences(memberId: string, signal?: AbortSignal) {
  const response = await requestJornizApi<{ experiences: ProfessionalExperience[] }>(`/api/profile/experience/${encodeURIComponent(memberId)}`, { signal });
  return response.experiences ?? [];
}

export async function loadMemberSkills(memberId: string, signal?: AbortSignal) {
  const response = await requestJornizApi<{ skills: SkillEndorsement[] }>(`/api/skills/${encodeURIComponent(memberId)}`, { signal });
  return response.skills ?? [];
}

export function addProfessionalExperience(experience: ProfessionalExperienceInput) {
  return requestJornizApi<{ message: string; experience_id: string }>("/api/profile/experience", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: experience.title.trim(), company: experience.company.trim(), location: experience.location.trim(), start_date: experience.startDate, end_date: experience.endDate || "Present", description: experience.description.trim() }),
  });
}
