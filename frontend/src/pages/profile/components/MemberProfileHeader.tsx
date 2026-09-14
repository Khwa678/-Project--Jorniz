import { Avatar } from "radix-ui";
import { Button } from "../../../components/ui/Button";
import { FollowButton } from "../../../components/follow/FollowButton";
import type { SignedInAccount } from "../../../lib/auth/accountTypes";
import { AccountTypeLabel } from "./AccountTypeLabel";

export interface MemberProfileHeaderProps { account: SignedInAccount; postCount: number; isOwnProfile: boolean; onOpenSettings?: () => void; onFollowChanged?: (following: boolean, followersCount: number) => void; }
export function MemberProfileHeader({ account, postCount, isOwnProfile, onOpenSettings, onFollowChanged }: MemberProfileHeaderProps) {
  const profile = account.profile ?? {};
  const avatar = profile.avatar ?? account.avatar_url;
  const professionalLabel = profile.specialty ?? profile.title;
  const organization = profile.hospital ?? profile.company_name ?? profile.store_name;
  const displayName = account.name || "Jorniz member";
  return <header className="member-profile-header"><Avatar.Root className="member-profile-avatar">{avatar ? <Avatar.Image src={String(avatar)} alt="" /> : null}<Avatar.Fallback aria-hidden="true">{displayName.slice(0,1).toUpperCase()}</Avatar.Fallback></Avatar.Root><div>{professionalLabel ? <p>{String(professionalLabel)}</p> : <AccountTypeLabel value={account.user_type} />}<h1>{displayName}</h1><span>{String(organization || account.email || "Jorniz member")}</span><dl><div><dt>Posts</dt><dd>{postCount}</dd></div><div><dt>Followers</dt><dd>{Number(account.followers_count ?? 0)}</dd></div><div><dt>Following</dt><dd>{Number(account.following_count ?? 0)}</dd></div>{isOwnProfile ? <div><dt>HU Coins</dt><dd>{account.hu_coins ?? 0}</dd></div> : null}</dl></div>{isOwnProfile && onOpenSettings ? <Button size="small" variant="secondary" onClick={onOpenSettings}>Account settings</Button> : !isOwnProfile ? <FollowButton memberId={String(account.id)} initiallyFollowing={Boolean(account.is_following)} onChanged={onFollowChanged} /> : null}</header>;
}
