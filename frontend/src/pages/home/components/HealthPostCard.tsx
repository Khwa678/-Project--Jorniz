import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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

function displayPostDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function HealthPostCard({ post, currentAccountId, onOpenMember, onEditPost, onDeletePost }: HealthPostCardProps) {
  const authorId = post.author?.id ?? post.user_id;
  const authorName = post.author?.name ?? post.author_name ?? "Jorniz member";
  const avatar = post.author?.avatar ?? post.author?.avatar_url ?? post.author_avatar;
  const isOwner = post.can_edit === true || Boolean(currentAccountId && authorId === currentAccountId);
  const likes = post.likes ?? post.likes_count ?? 0;
  const comments = post.comments ?? post.comments_count ?? 0;

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
          <strong>{authorName}</strong>
          <small>{post.author?.professional_label ?? post.author?.role ?? displayPostDate(post.created_at)}</small>
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
      {post.content ? <p className="health-post-content">{post.content}</p> : null}
      {post.media_url && post.media_type === "video" ? <video className="health-post-media" src={post.media_url} controls preload="metadata" /> : null}
      {post.media_url && post.media_type !== "video" ? <img className="health-post-media" src={post.media_url} alt="Post media" loading="lazy" /> : null}
      <Separator.Root className="health-post-separator" decorative />
      <footer className="health-post-statistics" aria-label="Post activity">
        <span>{likes} likes</span><span>{comments} comments</span><span>{post.shares ?? 0} shares</span>
      </footer>
    </article>
  );
}
