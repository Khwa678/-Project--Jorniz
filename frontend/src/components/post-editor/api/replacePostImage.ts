import { updatePost } from "./updatePost";
import type { PostWriteResult } from "../types";

export function replacePostImage(postId: string, content: string, category: string, image: File): Promise<PostWriteResult> {
  return updatePost(postId, { content, category, mediaFile: image });
}
