import { requestJornizApi } from "../../../lib/api/requestJornizApi";
import type { PostDraft, PostWriteResult } from "../types";

export function createPost(draft: PostDraft): Promise<PostWriteResult> {
  const form = new FormData();
  form.append("title", draft.title.trim());
  form.append("content", draft.content.trim());
  form.append("hashtags", draft.hashtags);
  form.append("category", draft.category);
  if (draft.mediaFile) form.append("media", draft.mediaFile);

  return requestJornizApi<PostWriteResult>("/api/posts/create", {
    method: "POST",
    headers: { "Idempotency-Key": crypto.randomUUID() },
    body: form,
  });
}
