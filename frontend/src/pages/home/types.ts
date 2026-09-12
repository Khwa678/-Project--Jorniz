export type FeedAudience = "for-you" | "following" | "trending";

export interface PostAuthor {
  id?: string;
  name?: string;
  avatar?: string;
  avatar_url?: string;
  specialty?: string;
  user_type?: string;
  is_verified?: boolean;
  is_following?: boolean;
}

export interface HealthPost {
  id: string;
  creator_user_id?: string;
  title?: string;
  content: string;
  hashtags?: string;
  trust_status?: "unreviewed" | "trusted" | "flagged" | "rejected";
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
