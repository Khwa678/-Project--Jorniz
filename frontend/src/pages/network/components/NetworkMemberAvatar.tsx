import { Avatar } from "radix-ui";

export interface NetworkMemberAvatarProps {
  avatarUrl?: string | null;
  name: string;
}

export function NetworkMemberAvatar({ avatarUrl, name }: NetworkMemberAvatarProps) {
  return (
    <Avatar.Root className="pn-avatar">
      {avatarUrl ? <Avatar.Image src={avatarUrl} alt="" /> : null}
      <Avatar.Fallback aria-hidden="true">{name.slice(0, 1).toUpperCase()}</Avatar.Fallback>
    </Avatar.Root>
  );
}
