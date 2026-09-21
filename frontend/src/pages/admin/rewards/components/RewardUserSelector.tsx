import { useEffect, useState } from "react";
import { Check, ChevronDown, LoaderCircle, Search, X } from "lucide-react";
import { Popover } from "radix-ui";
import { Button } from "../../../../components/ui/Button";
import { getUsers } from "../../api/users";
import type { RewardUser } from "../types";

export interface RewardUserSelectorProps {
  selectedUsers: readonly RewardUser[];
  onSelectedUsersChange: (users: RewardUser[]) => void;
  maxSelected?: number;
  label?: string;
  disabled?: boolean;
}

export function RewardUserSelector({ selectedUsers, onSelectedUsersChange, maxSelected, label = "Select users", disabled = false }: RewardUserSelectorProps) {
  const [open, setOpen] = useState(false);
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
    if (!open) return;
    let active = true;
    setLoading(true);
    setError("");
    getUsers({ q: debouncedQuery, page: 1, page_size: 10, sort: "name", direction: "asc" })
      .then((response) => { if (active) setResults(response.items as RewardUser[]); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Users could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [debouncedQuery, open]);

  function selectUser(user: RewardUser) {
    if (selectedUsers.some((selected) => selected.id === user.id)) {
      onSelectedUsersChange(selectedUsers.filter((selected) => selected.id !== user.id));
      return;
    }
    const next = maxSelected === 1 ? [user] : [...selectedUsers, user];
    onSelectedUsersChange(next);
    if (maxSelected === 1) setOpen(false);
  }

  return (
    <div className="admin-reward-user-selector">
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Button className="admin-reward-user-trigger" variant="secondary" size="small" disabled={disabled}>{label}<ChevronDown size={14} /></Button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content className="admin-reward-user-popover" align="start" sideOffset={6}>
            <label className="admin-reward-user-search"><Search size={15} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, email, or user ID" /></label>
            <div className="admin-reward-user-results">
              {loading ? <p><LoaderCircle className="admin-reward-spinner" size={17} /> Loading users</p> : null}
              {error ? <p className="admin-reward-user-error">{error}</p> : null}
              {!loading && !error && !results.length ? <p>No users found.</p> : null}
              {!loading && !error ? results.map((user) => {
                const selected = selectedUsers.some((item) => item.id === user.id);
                return <button type="button" key={user.id} className="admin-reward-user-option" onClick={() => selectUser(user)}><span><strong>{user.name}</strong><small>{user.email}</small></span>{selected ? <Check size={16} /> : null}</button>;
              }) : null}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {selectedUsers.length ? <div className="admin-reward-user-chips">{selectedUsers.map((user) => <span key={user.id}>{user.name}<button type="button" onClick={() => onSelectedUsersChange(selectedUsers.filter((item) => item.id !== user.id))} aria-label={`Remove ${user.name}`}><X size={12} /></button></span>)}</div> : null}
    </div>
  );
}
