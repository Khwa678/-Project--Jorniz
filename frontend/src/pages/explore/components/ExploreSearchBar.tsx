import { useState, type FormEvent } from "react";

export interface ExploreSearchBarProps { initialQuery?: string; searching: boolean; onSearch: (query: string) => void; }

export function ExploreSearchBar({ initialQuery = "", searching, onSearch }: ExploreSearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  function submitSearch(event: FormEvent<HTMLFormElement>) { event.preventDefault(); onSearch(query); }
  return <form className="explore-search-bar" role="search" onSubmit={submitSearch}><label htmlFor="jorniz-explore-query">Search Jorniz</label><div><input id="jorniz-explore-query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search people, posts, jobs or products" /><button type="submit" disabled={searching}>{searching ? "Searching..." : "Search"}</button></div></form>;
}
