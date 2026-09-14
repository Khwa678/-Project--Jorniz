import { type FormEvent, useEffect, useRef, useState } from "react";
import { BadgeCheck, Brain, HandHeart, Heart, Lightbulb, MessageCircle, MoreHorizontal, PartyPopper, Pencil, Send, Share2, ShieldCheck, Trash2 } from "lucide-react";
import { Avatar, DropdownMenu, Separator } from "radix-ui";
import { Button } from "../../../components/ui/Button";
import type { HealthPost, PostActionRequest, PostActionType } from "../types";
import "../styles.css";

const POST_REACTIONS = [
  { type: "like", label: "Like", Icon: Heart },
  { type: "celebrate", label: "Celebrate", Icon: PartyPopper },
  { type: "support", label: "Support", Icon: HandHeart },
  { type: "insightful", label: "Insightful", Icon: Lightbulb },
  { type: "mindblowing", label: "Mind-blowing", Icon: Brain },
] as const satisfies ReadonlyArray<{ type: PostActionType; label: string; Icon: typeof Heart }>;

export interface HealthPostCardProps {
  post: HealthPost;
  currentAccountId?: string;
  onOpenMember?: (memberId: string) => void;
  onEditPost?: (post: HealthPost) => void;
  onDeletePost?: (post: HealthPost) => void;
  onPostAction?: (action: PostActionRequest) => Promise<void>;
  onOpenPost?: (postId: string) => void;
  expanded?: boolean;
  showInlineCommentComposer?: boolean;
  onCommentRequested?: () => void;
  onPostNotice?: (message: string) => void;
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

export function HealthPostCard({ post, currentAccountId, onOpenMember, onEditPost, onDeletePost, onPostAction, onOpenPost, expanded = false, showInlineCommentComposer = true, onCommentRequested, onPostNotice }: HealthPostCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const viewRecorded = useRef(false);
  const [reactionPending, setReactionPending] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentPending, setCommentPending] = useState(false);
  const [sharePending, setSharePending] = useState(false);
  const authorId = post.author?.id ?? post.creator_user_id;
  const authorName = post.author?.name ?? post.author_name ?? "Jorniz member";
  const avatar = post.author?.avatar ?? post.author?.avatar_url ?? post.author_avatar;
  const isOwner = post.can_edit === true || Boolean(currentAccountId && authorId === currentAccountId);
  const likes = post.likes ?? post.likes_count ?? 0;
  const comments = post.comments ?? post.comments_count ?? 0;
  const authorDetails = [post.author?.specialty || displayAccountType(post.author?.user_type), displayPostAge(post.created_at)].filter(Boolean).join(" · ");
  const hashtags = postHashtags(post.hashtags);
  const selectedReaction = POST_REACTIONS.find(({ type }) => type === post.my_reaction);
  const SelectedReactionIcon = selectedReaction?.Icon ?? Heart;

  useEffect(() => {
    const card = cardRef.current;
    if (!card || !onPostAction || viewRecorded.current) return;
    let viewTimer: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5 && !viewRecorded.current) {
        viewTimer = setTimeout(() => {
          viewRecorded.current = true;
          void onPostAction({ postId: post.id, actionType: "view" }).catch(() => {
            viewRecorded.current = false;
          });
        }, 5000);
      } else if (viewTimer) {
        clearTimeout(viewTimer);
        viewTimer = undefined;
      }
    }, { threshold: [0, 0.5] });
    observer.observe(card);
    return () => {
      if (viewTimer) clearTimeout(viewTimer);
      observer.disconnect();
    };
  }, [onPostAction, post.id]);

  async function handleReaction(reactionType: PostActionType) {
    if (!onPostAction || reactionPending) return;
    setReactionPending(true);
    try {
      await onPostAction({ postId: post.id, actionType: reactionType });
    } finally {
      setReactionPending(false);
    }
  }

  async function handleComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = commentText.trim();
    if (!onPostAction || !content || commentPending) return;
    setCommentPending(true);
    try {
      await onPostAction({ postId: post.id, actionType: "comment", actionValue: content });
      setCommentText("");
      setCommentOpen(false);
    } finally {
      setCommentPending(false);
    }
  }

  async function handleShare() {
    if (!onPostAction || sharePending) return;
    setSharePending(true);
    try {
      const postUrl = new URL(`/posts/${encodeURIComponent(post.id)}`, window.location.origin).toString();
      await navigator.clipboard.writeText(postUrl);
      onPostNotice?.("Copied post");
      await onPostAction({ postId: post.id, actionType: "share" });
    } finally {
      setSharePending(false);
    }
  }

  function openPostFromCard(target: EventTarget | null) {
    if (!onOpenPost || !(target instanceof Element)) return;
    if (target.closest("button, a, input, textarea, select, video, [role='menuitem']")) return;
    onOpenPost(post.id);
  }

  return (
    <article ref={cardRef} className={`health-post-card${onOpenPost ? " health-post-card-clickable" : ""}${expanded ? " health-post-card-expanded" : ""}`} onClick={(event) => openPostFromCard(event.target)}>
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
      <footer className="health-post-actions" aria-label="Post actions">
        <div className="health-post-reaction-control">
          <Button className={`health-post-action health-post-reaction-trigger${selectedReaction ? ` is-reacted reaction-${selectedReaction.type}` : ""}`} type="button" variant="ghost" aria-pressed={Boolean(selectedReaction)} aria-haspopup="menu" disabled={!onPostAction || reactionPending} onClick={() => void handleReaction("like")}>
            <SelectedReactionIcon size={18} fill="currentColor" aria-hidden="true" />
            <span>{reactionPending ? "Updating" : selectedReaction?.label ?? "Like"}</span>
            <small>{likes}</small>
          </Button>
          <div className="health-post-reaction-picker" role="menu" aria-label="Choose a reaction">
            {POST_REACTIONS.map(({ type, label, Icon }) => (
              <Button className={`health-post-reaction-option reaction-${type}`} key={type} type="button" size="small" variant="ghost" role="menuitemradio" aria-checked={post.my_reaction === type} aria-label={label} title={label} disabled={!onPostAction || reactionPending} onClick={() => void handleReaction(type)}>
                <Icon size={19} fill="currentColor" aria-hidden="true" />
              </Button>
            ))}
          </div>
        </div>
        <Button className="health-post-action" type="button" variant="ghost" aria-expanded={showInlineCommentComposer ? commentOpen : undefined} onClick={() => showInlineCommentComposer ? setCommentOpen((open) => !open) : onCommentRequested?.()}><MessageCircle size={18} aria-hidden="true" /><span>Comment</span><small>{comments}</small></Button>
        <Button className="health-post-action" type="button" variant="ghost" disabled={!onPostAction || sharePending} onClick={handleShare}><Share2 size={18} aria-hidden="true" /><span>{sharePending ? "Sharing" : "Share"}</span><small>{post.shares ?? 0}</small></Button>
      </footer>
      {showInlineCommentComposer && commentOpen ? <form className="health-post-comment-form" onSubmit={handleComment}>
        <textarea value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="Write a comment..." rows={2} autoFocus />
        <Button type="submit" size="small" disabled={!commentText.trim() || commentPending} aria-label="Send comment"><Send size={16} aria-hidden="true" />{commentPending ? "Sending" : "Send"}</Button>
      </form> : null}
      <div className="health-post-meta">
        {hashtags.length ? <div className="health-post-hashtags">{hashtags.map((tag) => <span key={tag}>#{tag}</span>)}</div> : <span />}
        <small>{post.views ?? 0} views</small>
      </div>
    </article>
  );
}
