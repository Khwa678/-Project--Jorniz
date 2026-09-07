import { requestJornizApi } from "../../../lib/api/requestJornizApi";
import type { ExploreSearchResponse, ExploreSearchScope } from "../types";

export function searchJorniz(query: string, scope: ExploreSearchScope, signal?: AbortSignal) {
  const parameters = new URLSearchParams({ q: query.trim(), type: scope });
  return requestJornizApi<ExploreSearchResponse>(`/api/search/advanced?${parameters}`, { signal });
}
