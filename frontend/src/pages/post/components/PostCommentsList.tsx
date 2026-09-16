import { useState, type FormEvent } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { Avatar } from "radix-ui";
import { Button } from "../../../components/ui/Button";
import { calculateAgeFromDate } from "../../../lib/calculateAgeFromDate";
import type { PostComment } from "../types";

export interface PostCommentsListProps {
  comments: PostComment[];
  currentUserId: string;
  onUpdateComment: (commentId: string, content: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
}

export function PostCommentsList({ comments, currentUserId, onUpdateComment, onDeleteComment }: PostCommentsListProps) {
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [busyCommentId, setBusyCommentId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  async function saveComment(event: FormEvent<HTMLFormElement>, commentId: string) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || busyCommentId) return;
    setBusyCommentId(commentId);
    setActionError("");
    try {
      await onUpdateComment(commentId, content);
      setEditingCommentId(null);
      setDraft("");
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "The comment could not be updated.");
    } finally {
      setBusyCommentId(null);
    }
  }

  async function removeComment(commentId: string) {
    if (busyCommentId || !window.confirm("Delete this comment?")) return;
    setBusyCommentId(commentId);
    setActionError("");
    try {
      await onDeleteComment(commentId);
      if (editingCommentId === commentId) setEditingCommentId(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "The comment could not be deleted.");
    } finally {
      setBusyCommentId(null);
    }
  }

  if (!comments.length) return <p className="post-comments-empty">No comments yet. Start the conversation.</p>;

  return <div className="post-comments-list">
    {actionError ? <p className="post-comment-action-error" role="alert">{actionError}</p> : null}
    {comments.map((comment) => {
      const name = comment.author?.name ?? "Jorniz member";
      const isOwner = String(comment.user_id) === String(currentUserId);
      const isEditing = editingCommentId === comment.id;
      const isBusy = busyCommentId === comment.id;
      return <article className="post-comment" key={comment.id}>
        <Avatar.Root className="post-comment-avatar">
          {comment.author?.avatar ? <Avatar.Image src={comment.author.avatar} alt="" /> : null}
          <Avatar.Fallback>{name.slice(0, 1).toUpperCase()}</Avatar.Fallback>
        </Avatar.Root>
        <div className="post-comment-body">
          <header>
            <div className="post-comment-meta"><strong>{name}</strong><time dateTime={comment.created_at}>{calculateAgeFromDate(comment.created_at)}</time></div>
            {isOwner ? <div className="post-comment-controls">
              <Button variant="ghost" size="small" aria-label="Edit comment" title="Edit comment" disabled={isBusy} onClick={() => { setEditingCommentId(comment.id); setDraft(comment.content); setActionError(""); }}><Pencil size={14} aria-hidden="true" /></Button>
              <Button variant="ghost" size="small" aria-label="Delete comment" title="Delete comment" disabled={isBusy} onClick={() => void removeComment(comment.id)}><Trash2 size={14} aria-hidden="true" /></Button>
            </div> : null}
          </header>
          {isEditing ? <form className="post-comment-edit-form" onSubmit={(event) => void saveComment(event, comment.id)}>
            <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={3} autoFocus />
            <div>
              <Button variant="ghost" size="small" aria-label="Cancel editing" title="Cancel" disabled={isBusy} onClick={() => { setEditingCommentId(null); setDraft(""); }}><X size={14} aria-hidden="true" /></Button>
              <Button size="small" type="submit" aria-label="Save comment" title="Save comment" disabled={!draft.trim() || isBusy}><Check size={14} aria-hidden="true" /></Button>
            </div>
          </form> : <p>{comment.content}</p>}
        </div>
      </article>;
    })}
  </div>;
}
