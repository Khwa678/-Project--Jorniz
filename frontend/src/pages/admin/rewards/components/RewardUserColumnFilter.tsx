import { useEffect, useMemo, useState } from "react";
import { TableColumnFilter } from "../../components/TableColumnFilter";
import { getUsers } from "../../api/users";
import type { RewardUser } from "../types";

export interface RewardUserColumnFilterProps {
  selectedUsers: readonly RewardUser[];
  onSelectedUsersChange: (users: RewardUser[]) => void;
}

export function RewardUserColumnFilter({ selectedUsers, onSelectedUsersChange }: RewardUserColumnFilterProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<RewardUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getUsers({ q: debouncedQuery, page: 1, page_size: 25, sort: "name", direction: "asc" })
      .then((response) => { if (active) setResults(response.items as RewardUser[]); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Users could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [debouncedQuery]);

  const users = useMemo(() => {
    const byId = new Map<string, RewardUser>();
    [...selectedUsers, ...results].forEach((user) => byId.set(user.id, user));
    return byId;
  }, [results, selectedUsers]);

  return (
    <TableColumnFilter
      label="User"
      options={[...users.values()].map((user) => ({ value: user.id, label: user.name, description: user.email }))}
      selectedValues={selectedUsers.map((user) => user.id)}
      onSelectedValuesChange={(ids) => onSelectedUsersChange(ids.map((id) => users.get(id)).filter((user): user is RewardUser => Boolean(user)))}
      onSearchValueChange={setQuery}
      searchPlaceholder="Search name, email, or ID"
      loading={loading}
      error={error}
      emptyMessage="No users found."
    />
  );
}
