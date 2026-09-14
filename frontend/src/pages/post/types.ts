import type { HealthPost } from "../home/types";

export interface PostCommentAuthor {
  name?: string;
  avatar?: string;
  verified?: boolean;
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at?: string;
  author?: PostCommentAuthor;
}

export interface PostDetailsResult {
  post: HealthPost;
  comments: PostComment[];
}
