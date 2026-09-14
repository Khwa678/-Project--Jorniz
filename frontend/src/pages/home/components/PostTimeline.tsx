import { Button } from "../../../components/ui/Button";
import { HealthPostCard } from "./HealthPostCard";
import type { HealthPost, PostActionRequest } from "../types";

export interface PostTimelineProps {
  posts: HealthPost[];
  loading: boolean;
  error: string;
  emptyMessage: string;
  currentAccountId?: string;
  onRetry: () => void;
  onOpenMember?: (memberId: string) => void;
  onEditPost?: (post: HealthPost) => void;
  onDeletePost?: (post: HealthPost) => void;
  onPostAction?: (action: PostActionRequest) => Promise<void>;
  onOpenPost?: (postId: string) => void;
  onPostNotice?: (message: string) => void;
}

export function PostTimeline({ posts, loading, error, emptyMessage, currentAccountId, onRetry, onOpenMember, onEditPost, onDeletePost, onPostAction, onOpenPost, onPostNotice }: PostTimelineProps) {
  if (loading) return <p className="feed-state" aria-live="polite">Loading posts...</p>;
  if (error) return <div className="feed-state feed-state-error"><p>{error}</p><Button size="small" onClick={onRetry}>Try again</Button></div>;
  if (posts.length === 0) return <p className="feed-state">{emptyMessage}</p>;
  return <div className="post-timeline">{posts.map((post) => <HealthPostCard key={post.id} post={post} currentAccountId={currentAccountId} onOpenMember={onOpenMember} onEditPost={onEditPost} onDeletePost={onDeletePost} onPostAction={onPostAction} onOpenPost={onOpenPost} onPostNotice={onPostNotice} />)}</div>;
}
