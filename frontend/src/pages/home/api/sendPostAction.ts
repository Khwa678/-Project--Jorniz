import { requestJornizApi } from "../../../lib/api/requestJornizApi";
import type { PostActionRequest, PostActionResult } from "../types";

interface ReactionPostResponse {
  total_reactions: number;
  reactions_breakdown: Record<string, number>;
  my_reaction: PostActionRequest["actionType"] | null;
}

interface CommentPostResponse {
  comments_count: number;
}

interface SharePostResponse {
  shared: boolean;
  shares: number;
}

interface ViewPostResponse {
  counted: boolean;
  views: number;
}

function requestId(actionType: string, postId: string) {
  const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${actionType}:${postId}:${id}`;
}

export async function sendPostAction({ postId, actionType, actionValue }: PostActionRequest): Promise<PostActionResult> {
  if (["like", "celebrate", "support", "insightful", "mindblowing"].includes(actionType)) {
    const result = await requestJornizApi<ReactionPostResponse>(`/api/posts/${postId}/react`, {
      method: "POST",
      body: JSON.stringify({ reaction_type: actionType }),
    });
    return {
      postId,
      actionType,
      active: result.my_reaction === actionType,
      count: result.total_reactions,
      reaction: result.my_reaction,
    };
  }

  if (actionType === "comment") {
    const content = actionValue?.trim();
    if (!content) throw new Error("Comment cannot be empty.");
    const result = await requestJornizApi<CommentPostResponse>(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Idempotency-Key": requestId(actionType, postId) },
      body: JSON.stringify({ content }),
    });
    return { postId, actionType, active: true, count: result.comments_count };
  }

  if (actionType === "share") {
    const result = await requestJornizApi<SharePostResponse>(`/api/posts/${postId}/share`, {
      method: "POST",
      headers: { "Idempotency-Key": requestId(actionType, postId) },
    });
    return { postId, actionType, active: result.shared, count: result.shares };
  }

  if (actionType === "view") {
    const result = await requestJornizApi<ViewPostResponse>(`/api/posts/${postId}/view`, {
      method: "POST",
    });
    return { postId, actionType, active: result.counted, count: result.views };
  }

  throw new Error(`Post action "${actionType}" is not implemented yet.`);
}
