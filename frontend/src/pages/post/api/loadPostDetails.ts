import { requestJornizApi } from "../../../lib/api/requestJornizApi";
import type { HealthPost } from "../../home/types";
import type { PostComment, PostDetailsResult } from "../types";

export async function loadPostDetails(postId: string, signal?: AbortSignal): Promise<PostDetailsResult> {
  const encodedPostId = encodeURIComponent(postId);
  const [post, comments] = await Promise.all([
    requestJornizApi<HealthPost>(`/api/posts/${encodedPostId}`, { signal }),
    requestJornizApi<PostComment[]>(`/api/posts/${encodedPostId}/comments`, { signal }),
  ]);
  return { post, comments };
}
