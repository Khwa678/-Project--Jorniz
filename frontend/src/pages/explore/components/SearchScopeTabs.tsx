import type { ExploreSearchScope } from "../types";

const scopeChoices: ReadonlyArray<{ value: ExploreSearchScope; label: string }> = [{ value: "all", label: "All" }, { value: "people", label: "People" }, { value: "posts", label: "Posts" }, { value: "jobs", label: "Jobs" }, { value: "products", label: "Products" }];
export interface SearchScopeTabsProps { selectedScope: ExploreSearchScope; onScopeChange: (scope: ExploreSearchScope) => void; }
export function SearchScopeTabs({ selectedScope, onScopeChange }: SearchScopeTabsProps) { return <div className="search-scope-tabs" aria-label="Search result type">{scopeChoices.map((choice) => <button key={choice.value} type="button" className={selectedScope === choice.value ? "active" : ""} aria-pressed={selectedScope === choice.value} onClick={() => onScopeChange(choice.value)}>{choice.label}</button>)}</div>; }
