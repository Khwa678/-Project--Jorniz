export type FeedAudience = "for-you" | "following" | "trending";

export interface PostAuthor {
  id?: string;
  name?: string;
  avatar?: string;
  avatar_url?: string;
  professional_label?: string;
  role?: string;
  is_verified?: boolean;
  is_following?: boolean;
}

export interface HealthPost {
  id: string;
  user_id?: string;
  content: string;
  category?: string;
  media_url?: string;
  media_type?: "image" | "video" | string;
  likes?: number;
  likes_count?: number;
  comments?: number;
  comments_count?: number;
  shares?: number;
  created_at?: string;
  author?: PostAuthor;
  author_name?: string;
  author_avatar?: string;
  can_edit?: boolean;
  is_from_followed_account?: boolean;
}

export interface HomeFeedResult {
  posts: HealthPost[];
  notice?: string;
}
