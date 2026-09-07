import { requestJornizApi } from "../../../lib/api/requestJornizApi";
import type { HealthPost, HomeFeedResult } from "../types";

export async function loadFollowingPosts(signal?: AbortSignal): Promise<HomeFeedResult> {
  const posts = await requestJornizApi<HealthPost[]>("/api/posts?limit=50&offset=0", { signal });
  const followedPosts = posts.filter(
    (post) => post.is_from_followed_account === true || post.author?.is_following === true,
  );
  return {
    posts: followedPosts,
    notice: followedPosts.length === 0
      ? "The current API did not identify any posts from accounts you follow."
      : undefined,
  };
}
