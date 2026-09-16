import { requestJornizApi } from "../../../lib/api/requestJornizApi";
import type { PostComment } from "../types";

export function updatePostComment(postId: string, commentId: string, content: string): Promise<PostComment> {
  return requestJornizApi<PostComment>(
    `/api/posts/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}`,
    { method: "PATCH", body: JSON.stringify({ content }) },
  );
}

export function deletePostComment(postId: string, commentId: string): Promise<{ deleted: boolean; comments_count: number }> {
  return requestJornizApi<{ deleted: boolean; comments_count: number }>(
    `/api/posts/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}`,
    { method: "DELETE" },
  );
}
