import { requestJornizApi } from "../../../lib/api/requestJornizApi";
import type { DeletePostResult } from "../types";
export function deletePost(postId: string) { return requestJornizApi<DeletePostResult>(`/api/posts/${encodeURIComponent(postId)}`, { method: "DELETE" }); }
