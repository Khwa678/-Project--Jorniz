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
        {avatar ? <img src={avatar} alt="" /> : <span aria-hidden="true">{authorName.slice(0, 1).toUpperCase()}</span>}
        <button type="button" disabled={!authorId || !onOpenMember} onClick={() => authorId && onOpenMember?.(authorId)}>
          <strong>{authorName}</strong>
          <small>{post.author?.professional_label ?? post.author?.role ?? displayPostDate(post.created_at)}</small>
        </button>
        {isOwner ? (
          <div className="health-post-owner-actions">
            {onEditPost ? <button type="button" onClick={() => onEditPost(post)}>Edit</button> : null}
            {onDeletePost ? <button type="button" onClick={() => onDeletePost(post)}>Delete</button> : null}
          </div>
        ) : null}
      </header>
      {post.category ? <p className="health-post-category">{post.category}</p> : null}
      {post.content ? <p className="health-post-content">{post.content}</p> : null}
      {post.media_url && post.media_type === "video" ? <video className="health-post-media" src={post.media_url} controls preload="metadata" /> : null}
      {post.media_url && post.media_type !== "video" ? <img className="health-post-media" src={post.media_url} alt="Post media" loading="lazy" /> : null}
      <footer className="health-post-statistics" aria-label="Post activity">
        <span>{likes} likes</span><span>{comments} comments</span><span>{post.shares ?? 0} shares</span>
      </footer>
    </article>
  );
}
