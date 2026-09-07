import { requestJornizApi } from "../../../lib/api/requestJornizApi";
import type { PostDraft, PostWriteResult } from "../types";

export function publishPost(draft: PostDraft): Promise<PostWriteResult> {
  const form = new FormData(); form.append("content", draft.content.trim()); form.append("category", draft.category);
  if (draft.mediaFile) form.append("media", draft.mediaFile);
  return requestJornizApi<PostWriteResult>("/api/posts/create", { method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() }, body: form });
}
