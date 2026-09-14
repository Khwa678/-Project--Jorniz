import { requestJornizApi } from "../../../lib/api/requestJornizApi";
import type { HealthPost, HomeFeedResult } from "../types";

export async function loadFollowingPosts(signal?: AbortSignal): Promise<HomeFeedResult> {
  const posts = await requestJornizApi<HealthPost[]>("/api/posts?feed=following&limit=50&offset=0", { signal });
  return {
    posts,
    notice: posts.length === 0
      ? "Follow members to see their posts here."
      : undefined,
  };
}
