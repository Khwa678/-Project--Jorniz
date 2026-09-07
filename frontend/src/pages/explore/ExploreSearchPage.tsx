import { useRef, useState } from "react";
import { ExploreResults } from "./components/ExploreResults";
import { ExploreSearchBar } from "./components/ExploreSearchBar";
import { SearchScopeTabs } from "./components/SearchScopeTabs";
import { searchJorniz } from "./api/searchJorniz";
import type { ExploreSearchResults, ExploreSearchScope } from "./types";
import "./styles.css";

export interface ExploreSearchPageProps { onOpenMember?: (memberId: string) => void; onOpenPost?: (postId: string) => void; onOpenJob?: (jobId: string) => void; onOpenProduct?: (productId: string) => void; }
function describeExploreFailure(error: unknown) { return error instanceof Error ? error.message : "Search could not be completed."; }

export function ExploreSearchPage({ onOpenMember, onOpenPost, onOpenJob, onOpenProduct }: ExploreSearchPageProps) {
  const [scope, setScope] = useState<ExploreSearchScope>("all");
  const [lastQuery, setLastQuery] = useState("");
  const [results, setResults] = useState<ExploreSearchResults | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const activeSearch = useRef<AbortController | null>(null);

  async function runExploreSearch(query: string, selectedScope = scope) {
    const normalizedQuery = query.trim();
    setError("");
    if (normalizedQuery.length < 2) { setResults(null); setError("Enter at least 2 characters to search."); return; }
    activeSearch.current?.abort();
    const controller = new AbortController(); activeSearch.current = controller;
    setSearching(true); setLastQuery(normalizedQuery); setResults(null);
    try { const response = await searchJorniz(normalizedQuery, selectedScope, controller.signal); setResults(response.results ?? {}); }
    catch (searchError) { if (!controller.signal.aborted) setError(describeExploreFailure(searchError)); }
    finally { if (!controller.signal.aborted) setSearching(false); }
  }

  function changeSearchScope(nextScope: ExploreSearchScope) { setScope(nextScope); if (lastQuery) void runExploreSearch(lastQuery, nextScope); }

  return <main className="explore-search-page"><header><p>Explore</p><h1>Find people, knowledge and opportunities</h1></header><ExploreSearchBar searching={searching} onSearch={runExploreSearch} /><SearchScopeTabs selectedScope={scope} onScopeChange={changeSearchScope} />{searching ? <p className="explore-state" aria-live="polite">Searching Jorniz...</p> : null}{error ? <p className="explore-state explore-state-error">{error}</p> : null}{!searching && !error && !results ? <p className="explore-state">Search results will appear here. No recommendations are fabricated before a query.</p> : null}{!searching && results ? <ExploreResults results={results} scope={scope} onOpenMember={onOpenMember} onOpenPost={onOpenPost} onOpenJob={onOpenJob} onOpenProduct={onOpenProduct} /> : null}</main>;
}
