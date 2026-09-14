import { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { updateFollow } from "./api/updateFollow";

export interface FollowButtonProps {
  memberId: string;
  initiallyFollowing?: boolean;
  onChanged?: (following: boolean, followersCount: number) => void;
}

export function FollowButton({ memberId, initiallyFollowing = false, onChanged }: FollowButtonProps) {
  const [following, setFollowing] = useState(initiallyFollowing);
  const [saving, setSaving] = useState(false);

  useEffect(() => setFollowing(initiallyFollowing), [initiallyFollowing, memberId]);

  async function changeFollow() {
    if (saving) return;
    setSaving(true);
    try {
      const result = await updateFollow(memberId, !following);
      setFollowing(result.followed);
      onChanged?.(result.followed, result.followers_count);
    } finally {
      setSaving(false);
    }
  }

  return <Button size="small" variant={following ? "secondary" : "primary"} disabled={saving} aria-pressed={following} onClick={changeFollow}>
    {saving ? "Saving..." : following ? "Following" : "Follow"}
  </Button>;
}
