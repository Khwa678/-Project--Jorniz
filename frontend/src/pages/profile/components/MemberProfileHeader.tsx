import { Button } from "../../../components/ui/Button";
import { FollowButton } from "../../../components/follow/FollowButton";
import type { SignedInAccount } from "../../../lib/auth/accountTypes";
import { AccountTypeLabel } from "./AccountTypeLabel";

export interface MemberProfileHeaderProps { account: SignedInAccount; postCount: number; isOwnProfile: boolean; onOpenSettings?: () => void; onFollowChanged?: (following: boolean, followersCount: number) => void; }

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("") || "J";
}

export function MemberProfileHeader({ account, postCount, isOwnProfile, onOpenSettings, onFollowChanged }: MemberProfileHeaderProps) {
  const profile = account.profile ?? {};
  const professionalLabel = profile.specialty ?? profile.title;
  const organization = profile.hospital ?? profile.company_name ?? profile.store_name;
  const displayName = account.name || "Jorniz member";
  const avatarUrl = account.avatar_url?.trim();
  return <header className="member-profile-header"><div className="member-profile-avatar">{avatarUrl ? <img src={avatarUrl} alt={`${displayName} profile`} /> : <span aria-hidden="true">{getInitials(displayName)}</span>}</div><div>{professionalLabel ? <p>{String(professionalLabel)}</p> : <AccountTypeLabel value={account.user_type} />}<h1>{displayName}</h1><span>{String(organization || account.email || "Jorniz member")}</span><dl><div><dt>Posts</dt><dd>{postCount}</dd></div><div><dt>Followers</dt><dd>{Number(account.followers_count ?? 0)}</dd></div><div><dt>Following</dt><dd>{Number(account.following_count ?? 0)}</dd></div>{isOwnProfile ? <div><dt>HU Coins</dt><dd>{account.hu_coins ?? 0}</dd></div> : null}</dl></div>{isOwnProfile && onOpenSettings ? <Button size="small" variant="secondary" onClick={onOpenSettings}>Account settings</Button> : !isOwnProfile ? <FollowButton memberId={String(account.id)} initiallyFollowing={Boolean(account.is_following)} onChanged={onFollowChanged} /> : null}</header>;
}
