import { apiRequest } from "../../../../lib/api/apiClient";
import type {
  AddPostInput,
  AdminPost,
  GetPostsParams,
  PostMediaResult,
  PostsDeleteResult,
  PostsPage,
  PostsUpdateResult,
  PostUpdate,
} from "../types";

const POSTS_PATH = "/api/admin/posts";

function jsonRequest(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

function postsQuery(params: GetPostsParams): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
  });
  const value = query.toString();
  return value ? `?${value}` : "";
}

export function getPosts(params: GetPostsParams = {}): Promise<PostsPage> {
  return apiRequest<PostsPage>(`${POSTS_PATH}${postsQuery(params)}`);
}

export async function addPost(input: AddPostInput, media?: File): Promise<AdminPost> {
  let request: RequestInit = jsonRequest("POST", input);
  if (media) {
    const body = new FormData();
    Object.entries(input).forEach(([key, value]) => body.append(key, String(value)));
    body.append("media", media);
    request = { method: "POST", body };
  }
  const response = await apiRequest<{ post: AdminPost }>(POSTS_PATH, request);
  return response.post;
}

export function updatePosts(updates: readonly PostUpdate[]): Promise<PostsUpdateResult> {
  return apiRequest<PostsUpdateResult>(POSTS_PATH, jsonRequest("PATCH", { updates }));
}

export function deletePosts(postIds: readonly string[]): Promise<PostsDeleteResult> {
  return apiRequest<PostsDeleteResult>(POSTS_PATH, jsonRequest("DELETE", { post_ids: postIds }));
}

export async function replacePostMedia(postId: string, file: File): Promise<PostMediaResult> {
  const body = new FormData();
  body.append("media", file);
  return apiRequest<PostMediaResult>(`${POSTS_PATH}/${encodeURIComponent(postId)}/media`, { method: "POST", body });
}

export function removePostMedia(postId: string): Promise<PostMediaResult> {
  return apiRequest<PostMediaResult>(`${POSTS_PATH}/${encodeURIComponent(postId)}/media`, { method: "DELETE" });
}
