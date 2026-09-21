export const POST_TRUST_OPTIONS = [
  { value: "unreviewed", label: "Unreviewed" },
  { value: "trusted", label: "Trusted" },
  { value: "flagged", label: "Flagged" },
  { value: "rejected", label: "Rejected" },
] as const;

export const POST_CATEGORY_OPTIONS = [
  "General Wellness",
  "Preventive Care",
  "Mental Wellness",
  "Nutrition",
  "Fitness",
  "Clinical Research",
] as const;

export type PostTrustStatus = typeof POST_TRUST_OPTIONS[number]["value"];
export type PostSortField = "created_at" | "title" | "trust_status" | "category" | "comments_count" | "views_count";
export type SortDirection = "asc" | "desc";

export interface AdminPost {
  id: string;
  creator_user_id: string;
  title: string;
  content: string;
  hashtags: string;
  trust_status: PostTrustStatus;
  category: string;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
  creator_name: string;
  creator_email: string;
  comments_count: number;
  views_count: number;
}

export interface GetPostsParams {
  q?: string;
  page?: number;
  page_size?: number;
  sort?: PostSortField;
  direction?: SortDirection;
}

export interface PostsPage {
  items: AdminPost[];
  page: number;
  page_size: number;
  total: number;
}

export interface AddPostInput {
  creator_user_id: string;
  title: string;
  content: string;
  hashtags?: string;
  category?: string;
  trust_status?: PostTrustStatus;
}

export type PostChanges = Partial<Pick<AdminPost, "title" | "content" | "hashtags" | "trust_status" | "category">>;
export interface PostUpdate extends PostChanges { id: string; }
export interface PostsUpdateResult { updated_count: number; posts: AdminPost[]; }
export interface PostsDeleteResult { deleted_count: number; deleted_ids: string[]; }
export interface PostMediaResult { post: AdminPost; warning?: string; }
export type AdminPostDrafts = Record<string, PostChanges>;
