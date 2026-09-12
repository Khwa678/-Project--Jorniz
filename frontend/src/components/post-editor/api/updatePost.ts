import { requestJornizApi } from "../../../lib/api/requestJornizApi";
import type { PostDraft, PostWriteResult } from "../types";

export function updatePost(postId: string, draft: PostDraft): Promise<PostWriteResult> {
  const form = new FormData(); form.append("title", draft.title.trim()); form.append("content", draft.content.trim()); form.append("hashtags", draft.hashtags); form.append("category", draft.category);
  if (draft.mediaFile) form.append("media", draft.mediaFile);
  if (draft.removeMedia) form.append("remove_media", "true");
  return requestJornizApi<PostWriteResult>(`/api/posts/${encodeURIComponent(postId)}`, { method: "PUT", body: form });
}
