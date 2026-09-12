import { BadgeCheck, MoreHorizontal, Pencil, ShieldCheck, Trash2 } from "lucide-react";
import { Avatar, DropdownMenu, Separator } from "radix-ui";
import { Button } from "../../../components/ui/Button";
import type { HealthPost } from "../types";

export interface HealthPostCardProps {
  post: HealthPost;
  currentAccountId?: string;
  onOpenMember?: (memberId: string) => void;
  onEditPost?: (post: HealthPost) => void;
  onDeletePost?: (post: HealthPost) => void;
}

function displayPostAge(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (elapsedSeconds < 60) return "Just now";
  if (elapsedSeconds < 3600) return `${Math.floor(elapsedSeconds / 60)}m ago`;
  if (elapsedSeconds < 86400) return `${Math.floor(elapsedSeconds / 3600)}h ago`;
  if (elapsedSeconds < 604800) return `${Math.floor(elapsedSeconds / 86400)}d ago`;
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function displayAccountType(value?: string) {
  return value?.split("_").filter(Boolean).map((part) => part[0].toUpperCase() + part.slice(1)).join(" ") ?? "";
}

function postHashtags(value?: string) {
  return (value ?? "").split(",").map((tag) => tag.trim().replace(/^#+/, "")).filter(Boolean);
}

export function HealthPostCard({ post, currentAccountId, onOpenMember, onEditPost, onDeletePost }: HealthPostCardProps) {
  const authorId = post.author?.id ?? post.creator_user_id;
  const authorName = post.author?.name ?? post.author_name ?? "Jorniz member";
  const avatar = post.author?.avatar ?? post.author?.avatar_url ?? post.author_avatar;
  const isOwner = post.can_edit === true || Boolean(currentAccountId && authorId === currentAccountId);
  const likes = post.likes ?? post.likes_count ?? 0;
  const comments = post.comments ?? post.comments_count ?? 0;
  const authorDetails = [post.author?.specialty || displayAccountType(post.author?.user_type), displayPostAge(post.created_at)].filter(Boolean).join(" · ");
  const hashtags = postHashtags(post.hashtags);

  return (
    <article className="health-post-card">
      <header className="health-post-author">
        <Avatar.Root className="health-post-avatar">
          {avatar ? <Avatar.Image className="health-post-avatar-image" src={avatar} alt="" /> : null}
          <Avatar.Fallback className="health-post-avatar-fallback" delayMs={avatar ? 300 : 0}>
            {authorName.slice(0, 1).toUpperCase()}
          </Avatar.Fallback>
        </Avatar.Root>
        <Button className="health-post-author-button" variant="ghost" disabled={!authorId || !onOpenMember} onClick={() => authorId && onOpenMember?.(authorId)}>
          <span className="health-post-author-name"><strong>{authorName}</strong>{post.author?.is_verified ? <BadgeCheck size={16} aria-label="Verified account" /> : null}</span>
          <small>{authorDetails}</small>
        </Button>
        {isOwner ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button className="health-post-owner-menu-trigger" size="small" variant="ghost" aria-label="Post options">
                <MoreHorizontal size={19} aria-hidden="true" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="health-post-owner-menu" align="end" sideOffset={6}>
                {onEditPost ? (
                  <DropdownMenu.Item className="health-post-owner-menu-item" onSelect={() => onEditPost(post)}>
                    <Pencil size={15} aria-hidden="true" />
                    Edit post
                  </DropdownMenu.Item>
                ) : null}
                {onDeletePost ? (
                  <DropdownMenu.Item className="health-post-owner-menu-item danger" onSelect={() => onDeletePost(post)}>
                    <Trash2 size={15} aria-hidden="true" />
                    Delete post
                  </DropdownMenu.Item>
                ) : null}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        ) : null}
      </header>
      {post.category ? <p className="health-post-category">{post.category}</p> : null}
      {post.title ? <h2 className="health-post-title">{post.title}</h2> : null}
      {post.content ? <p className="health-post-content">{post.content}</p> : null}
      {post.media_url ? <div className="health-post-media-frame">
        {post.trust_status === "trusted" ? <span className="health-post-trust"><ShieldCheck size={15} aria-hidden="true" />Trusted content</span> : null}
        {post.media_type === "video" ? <video className="health-post-media" src={post.media_url} controls preload="metadata" /> : <img className="health-post-media" src={post.media_url} alt="Post media" loading="lazy" />}
      </div> : null}
      <Separator.Root className="health-post-separator" decorative />
      <footer className="health-post-statistics" aria-label="Post activity">
        <span>{likes} likes</span><span>{comments} comments</span><span>{post.shares ?? 0} shares</span>
      </footer>
      {hashtags.length ? <div className="health-post-hashtags">{hashtags.map((tag) => <span key={tag}>#{tag}</span>)}</div> : null}
    </article>
  );
}
