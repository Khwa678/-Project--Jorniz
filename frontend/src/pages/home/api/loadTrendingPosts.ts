import { requestJornizApi } from "../../../lib/api/requestJornizApi";
import type { HealthPost, HomeFeedResult } from "../types";

function postEngagementScore(post: HealthPost) {
  const likes = post.likes ?? post.likes_count ?? 0;
  const comments = post.comments ?? post.comments_count ?? 0;
  return likes + comments * 2 + (post.shares ?? 0) * 3;
}

export async function loadTrendingPosts(signal?: AbortSignal): Promise<HomeFeedResult> {
  const posts = await requestJornizApi<HealthPost[]>("/api/posts?limit=50&offset=0", { signal });
  return {
    posts: [...posts].sort((left, right) => postEngagementScore(right) - postEngagementScore(left)),
    notice: posts.length > 0 ? "Ranked from the engagement counts returned by the current API." : undefined,
  };
}
