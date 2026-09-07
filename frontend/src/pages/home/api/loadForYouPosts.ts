import { requestJornizApi } from "../../../lib/api/requestJornizApi";
import type { HealthPost, HomeFeedResult } from "../types";

export async function loadForYouPosts(signal?: AbortSignal): Promise<HomeFeedResult> {
  const posts = await requestJornizApi<HealthPost[]>("/api/posts?limit=30&offset=0", { signal });
  return { posts };
}
