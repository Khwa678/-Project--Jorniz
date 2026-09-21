import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { addUser, deleteUsers, getUsers, updateUsers } from "../api/users";
import type { AddUserInput, AdminUser, AdminUserRewardRequest, UserSortField } from "../types";
import { AddUserDialog } from "./AddUserDialog";
import { DeleteUsersDialog } from "./DeleteUsersDialog";
import { type TableSortDirection } from "./ResponsiveTable";
import { type AdminUserDraft, type AdminUserDrafts, UsersTable } from "./UsersTable";
import { UsersToolbar } from "./UsersToolbar";

const PAGE_SIZE = 25;

export interface UsersPanelProps {
  canManageRoles: boolean;
  onRewardAction: (request: AdminUserRewardRequest) => void;
}

export function UsersPanel({ canManageRoles, onRewardAction }: UsersPanelProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortColumn, setSortColumn] = useState<UserSortField>("name");
  const [sortDirection, setSortDirection] = useState<TableSortDirection>("ascending");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [drafts, setDrafts] = useState<AdminUserDrafts>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [deleteUsersOpen, setDeleteUsersOpen] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);
  const [deleteError, setDeleteError] = useState("");
  const [addingUser, setAddingUser] = useState(false);
  const [addUserError, setAddUserError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => { setDebouncedQuery(query.trim()); setPage(1); }, 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getUsers({ q: debouncedQuery, page, page_size: PAGE_SIZE, sort: sortColumn, direction: sortDirection === "ascending" ? "asc" : "desc" })
      .then((result) => {
        if (!active) return;
        const nextUsers = result.items;
        setUsers(nextUsers);
        setTotal(result.total);
        setSelectedIds((current) => new Set([...current].filter((id) => nextUsers.some((user) => user.id === id))));
      })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Users could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [debouncedQuery, page, sortColumn, sortDirection]);

  const draftCount = Object.keys(drafts).length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const updateDraft = useCallback((user: AdminUser, changes: AdminUserDraft) => {
    setDrafts((current) => {
      const nextDraft = { ...current[user.id], ...changes };
      if (nextDraft.name === user.name) delete nextDraft.name;
      if (nextDraft.specialty === (user.specialty ?? "")) delete nextDraft.specialty;
      if (nextDraft.user_type === user.user_type) delete nextDraft.user_type;
      if (nextDraft.system_role === user.system_role) delete nextDraft.system_role;
      if (changes.user_type && changes.user_type !== "doctor") delete nextDraft.specialty;
      if (!Object.keys(nextDraft).length) {
        const remaining = { ...current };
        delete remaining[user.id];
        return remaining;
      }
      return { ...current, [user.id]: nextDraft };
    });
  }, []);

  async function saveChanges() {
    const updates = Object.entries(drafts).map(([id, changes]) => ({ id, ...changes }));
    if (!updates.length) return;
    setSaving(true); setError("");
    try { await updateUsers(updates); window.location.reload(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Changes could not be saved."); }
    finally { setSaving(false); }
  }

  async function deleteSelectedUsers() {
    const userIds = pendingDeleteIds;
    if (!userIds.length) return;
    setDeleting(true); setError("");
    try {
      await deleteUsers(userIds);
      setDeleteUsersOpen(false);
      setPendingDeleteIds([]);
      setSelectedIds(new Set());
      setDrafts((current) => Object.fromEntries(Object.entries(current).filter(([id]) => !userIds.includes(id))));
      window.location.reload();
    } catch (reason) { setDeleteError(reason instanceof Error ? reason.message : "Selected users could not be deleted."); }
    finally { setDeleting(false); }
  }

  async function createNewUser(input: AddUserInput) {
    setAddingUser(true);
    setAddUserError("");
    try {
      await addUser(input);
      window.location.reload();
    } catch (reason) {
      setAddUserError(reason instanceof Error ? reason.message : "The user could not be added.");
    } finally {
      setAddingUser(false);
    }
  }

  const table = useMemo(() => <UsersTable users={users} drafts={drafts} selectedIds={selectedIds} sortColumn={sortColumn} sortDirection={sortDirection}
    canManageRoles={canManageRoles} onDraftChange={updateDraft} onSelectedIdsChange={setSelectedIds}
    onRewardAction={onRewardAction}
    onDeleteUser={(user) => { setPendingDeleteIds([user.id]); setDeleteError(""); setDeleteUsersOpen(true); }}
    onSortChange={(column, direction) => { setSortColumn(column); setSortDirection(direction); setPage(1); }} />,
    [canManageRoles, drafts, onRewardAction, selectedIds, sortColumn, sortDirection, updateDraft, users]);

  return (
    <section className="admin-table-card">
      <UsersToolbar query={query} selectedCount={selectedIds.size} draftCount={draftCount} saving={saving} deleting={deleting}
        onQueryChange={setQuery} onAddUser={() => setAddUserOpen(true)} onDeleteSelected={() => { setPendingDeleteIds([...selectedIds]); setDeleteError(""); setDeleteUsersOpen(true); }}
        onSaveChanges={saveChanges} onCancelChanges={() => setDrafts({})} />
      {error ? <div className="admin-table-message admin-table-error" role="alert">{error}</div> : null}
      {loading ? <div className="admin-table-loading" role="status"><LoaderCircle size={22} /> Loading users</div> : table}
      <footer className="admin-pagination">
        <span>{total ? `${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, total)} of ${total}` : "0 users"}</span>
        <div>
          <Button size="small" variant="secondary" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)} aria-label="Previous users page"><ChevronLeft size={16} /></Button>
          <span>Page {page} of {totalPages}</span>
          <Button size="small" variant="secondary" disabled={page >= totalPages || loading} onClick={() => setPage((value) => value + 1)} aria-label="Next users page"><ChevronRight size={16} /></Button>
        </div>
      </footer>
      <AddUserDialog
        open={addUserOpen}
        onOpenChange={(open) => { setAddUserOpen(open); if (!open) setAddUserError(""); }}
        onSubmit={createNewUser}
        submitting={addingUser}
        error={addUserError}
        canManageRoles={canManageRoles}
      />
      <DeleteUsersDialog
        open={deleteUsersOpen}
        selectedCount={pendingDeleteIds.length}
        deleting={deleting}
        error={deleteError}
        onOpenChange={(open) => { setDeleteUsersOpen(open); if (!open) { setPendingDeleteIds([]); setDeleteError(""); } }}
        onConfirm={deleteSelectedUsers}
      />
    </section>
  );
}
