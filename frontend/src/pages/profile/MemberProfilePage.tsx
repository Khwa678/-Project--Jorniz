import { useEffect, useState } from "react";
import type { SignedInAccount } from "../../lib/auth/accountTypes";
import { MemberPostHistory } from "./components/MemberPostHistory";
import { MemberProfileHeader } from "./components/MemberProfileHeader";
import { ProfessionalDetails } from "./components/ProfessionalDetails";
import { loadMemberExperiences, loadMemberPosts, loadMemberProfile, loadMemberSkills, loadSignedInMemberPosts, loadSignedInMemberProfile } from "./api/requests";
import type { MemberPost, ProfessionalExperience, SkillEndorsement } from "./types";
import "./styles.css";

export interface MemberProfilePageProps { signedInAccount: SignedInAccount; memberId?: string; onOpenPost?: (postId: string) => void; onOpenSettings?: () => void; }
function profileFailureMessage(error: unknown) { return error instanceof Error ? error.message : "The profile request failed."; }

export function MemberProfilePage({ signedInAccount, memberId, onOpenPost, onOpenSettings }: MemberProfilePageProps) {
  const profileId = memberId ?? String(signedInAccount.id);
  const isOwnProfile = profileId === String(signedInAccount.id);
  const [account, setAccount] = useState<SignedInAccount>(signedInAccount);
  const [profileError, setProfileError] = useState("");
  const [posts, setPosts] = useState<MemberPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState("");
  const [postReloadNumber, setPostReloadNumber] = useState(0);
  const [experiences, setExperiences] = useState<ProfessionalExperience[]>([]);
  const [skills, setSkills] = useState<SkillEndorsement[]>([]);
  const [professionalLoading, setProfessionalLoading] = useState(true);
  const [professionalError, setProfessionalError] = useState("");
  const [professionalReloadNumber, setProfessionalReloadNumber] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setProfileError("");
    const loader = isOwnProfile ? loadSignedInMemberProfile(controller.signal) : loadMemberProfile(profileId, controller.signal);
    loader.then(setAccount).catch((error: unknown) => { if (!controller.signal.aborted) setProfileError(profileFailureMessage(error)); });
    return () => controller.abort();
  }, [isOwnProfile, profileId, signedInAccount]);

  useEffect(() => {
    const controller = new AbortController();
    setPostsLoading(true); setPostsError("");
    const loader = isOwnProfile ? loadSignedInMemberPosts(controller.signal) : loadMemberPosts(profileId, controller.signal);
    loader.then(setPosts).catch((error: unknown) => { if (!controller.signal.aborted) setPostsError(profileFailureMessage(error)); }).finally(() => { if (!controller.signal.aborted) setPostsLoading(false); });
    return () => controller.abort();
  }, [isOwnProfile, postReloadNumber, profileId]);

  useEffect(() => {
    const controller = new AbortController();
    setProfessionalLoading(true); setProfessionalError("");
    Promise.all([loadMemberExperiences(profileId, controller.signal), loadMemberSkills(profileId, controller.signal)]).then(([loadedExperiences, loadedSkills]) => { setExperiences(loadedExperiences); setSkills(loadedSkills); }).catch((error: unknown) => { if (!controller.signal.aborted) setProfessionalError(profileFailureMessage(error)); }).finally(() => { if (!controller.signal.aborted) setProfessionalLoading(false); });
    return () => controller.abort();
  }, [professionalReloadNumber, profileId]);

  return <main className="member-profile-page">{profileError ? <p className="profile-state profile-warning">{profileError}</p> : null}<MemberProfileHeader account={account} postCount={posts.length} isOwnProfile={isOwnProfile} onOpenSettings={onOpenSettings} onFollowChanged={(following, count) => setAccount((current) => ({ ...current, is_following: following, followers_count: count }))} /><ProfessionalDetails account={account} experiences={experiences} skills={skills} isOwnProfile={isOwnProfile} loading={professionalLoading} error={professionalError} onExperienceAdded={() => setProfessionalReloadNumber((value) => value + 1)} /><MemberPostHistory posts={posts} loading={postsLoading} error={postsError} onRetry={() => setPostReloadNumber((value) => value + 1)} onOpenPost={onOpenPost} /></main>;
}
