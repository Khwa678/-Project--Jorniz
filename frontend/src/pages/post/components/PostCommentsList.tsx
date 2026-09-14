import { Avatar } from "radix-ui";
import { calculateAgeFromDate } from "../../../lib/calculateAgeFromDate";
import type { PostComment } from "../types";

export interface PostCommentsListProps {
  comments: PostComment[];
}

export function PostCommentsList({ comments }: PostCommentsListProps) {
  if (!comments.length) return <p className="post-comments-empty">No comments yet. Start the conversation.</p>;

  return <div className="post-comments-list">
    {comments.map((comment) => {
      const name = comment.author?.name ?? "Jorniz member";
      return <article className="post-comment" key={comment.id}>
        <Avatar.Root className="post-comment-avatar">
          {comment.author?.avatar ? <Avatar.Image src={comment.author.avatar} alt="" /> : null}
          <Avatar.Fallback>{name.slice(0, 1).toUpperCase()}</Avatar.Fallback>
        </Avatar.Root>
        <div className="post-comment-body">
          <header><strong>{name}</strong><time dateTime={comment.created_at}>{calculateAgeFromDate(comment.created_at)}</time></header>
          <p>{comment.content}</p>
        </div>
      </article>;
    })}
  </div>;
}
