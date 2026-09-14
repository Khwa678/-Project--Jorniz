import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "../../components/ui/Button";
import type { SignedInAccount } from "../../lib/auth/accountTypes";
import { HealthPostCard } from "../home/components/HealthPostCard";
import { sendPostAction } from "../home/api/sendPostAction";
import type { HealthPost, PostActionRequest } from "../home/types";
import { loadPostDetails } from "./api/loadPostDetails";
import { PostCommentsList } from "./components/PostCommentsList";
import type { PostComment } from "./types";
import "./styles.css";

export interface PostDetailsPageProps {
  postId: string;
  signedInAccount: SignedInAccount;
  onBack: () => void;
  onPostNotice: (message: string) => void;
  onOpenMember?: (memberId: string) => void;
}

export function PostDetailsPage({ postId, signedInAccount, onBack, onPostNotice, onOpenMember }: PostDetailsPageProps) {
  const commentInput = useRef<HTMLTextAreaElement>(null);
  const [post, setPost] = useState<HealthPost | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [commentsRevision, setCommentsRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    loadPostDetails(postId, controller.signal)
      .then((result) => { setPost(result.post); setComments(result.comments); })
      .catch((loadError: unknown) => { if (!controller.signal.aborted) setError(loadError instanceof Error ? loadError.message : "The post could not be loaded."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [commentsRevision, postId]);

  const handlePostAction = useCallback(async (action: PostActionRequest) => {
    const result = await sendPostAction(action);
    setPost((currentPost) => {
      if (!currentPost) return currentPost;
      if (result.reaction !== undefined) return { ...currentPost, likes: result.count, likes_count: result.count, liked_by_me: result.reaction === "like", my_reaction: result.reaction };
      if (result.actionType === "share") return { ...currentPost, shares: result.count };
      if (result.actionType === "view") return { ...currentPost, views: result.count };
      return currentPost;
    });
  }, []);

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = comment.trim();
    if (!content || sending) return;
    setSending(true);
    setError("");
    try {
      await sendPostAction({ postId, actionType: "comment", actionValue: content });
      setComment("");
      setCommentsRevision((revision) => revision + 1);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The comment could not be posted.");
    } finally {
      setSending(false);
    }
  }

  return <main className="post-details-page">
    <header className="post-details-heading workspace-page-heading">
      <Button variant="ghost" size="small" onClick={onBack}><ArrowLeft size={17} aria-hidden="true" />Back to feed</Button>
      <div><h1>Post</h1><p className="workspace-page-tagline">Read the full post and join the conversation.</p></div>
    </header>
    {loading ? <p className="post-details-state">Loading post...</p> : null}
    {error ? <p className="post-details-state post-details-error" role="alert">{error}</p> : null}
    {post ? <>
      <HealthPostCard post={post} currentAccountId={String(signedInAccount.id)} onPostAction={handlePostAction} onOpenMember={onOpenMember} expanded showInlineCommentComposer={false} onCommentRequested={() => commentInput.current?.focus()} onPostNotice={onPostNotice} />
      <section className="post-conversation" aria-labelledby="post-comments-title">
        <form className="post-details-comment-form" onSubmit={submitComment}>
          <textarea ref={commentInput} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Write a comment..." rows={3} />
          <Button type="submit" size="small" disabled={!comment.trim() || sending}><Send size={16} aria-hidden="true" />{sending ? "Sending" : "Send"}</Button>
        </form>
        <header><h2 id="post-comments-title">Comments</h2><span>{comments.length}</span></header>
        <PostCommentsList comments={comments} />
      </section>
    </> : null}
  </main>;
}
