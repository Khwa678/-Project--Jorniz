import { Tabs } from "radix-ui";
import type { ExploreSearchScope } from "../types";

const scopeChoices: ReadonlyArray<{ value: ExploreSearchScope; label: string }> = [{ value: "all", label: "All" }, { value: "people", label: "People" }, { value: "posts", label: "Posts" }, { value: "jobs", label: "Jobs" }, { value: "products", label: "Products" }];
export interface SearchScopeTabsProps { selectedScope: ExploreSearchScope; onScopeChange: (scope: ExploreSearchScope) => void; }
export function SearchScopeTabs({ selectedScope, onScopeChange }: SearchScopeTabsProps) { return <Tabs.Root value={selectedScope} onValueChange={(value) => onScopeChange(value as ExploreSearchScope)}><Tabs.List className="search-scope-tabs" aria-label="Search result type">{scopeChoices.map((choice) => <Tabs.Trigger key={choice.value} value={choice.value}>{choice.label}</Tabs.Trigger>)}</Tabs.List></Tabs.Root>; }
