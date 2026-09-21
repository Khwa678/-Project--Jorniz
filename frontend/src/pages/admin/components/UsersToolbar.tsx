import { Plus, Save, Trash2, X } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { SearchBar } from "./SearchBar";

export interface UsersToolbarProps {
  query: string;
  selectedCount: number;
  draftCount: number;
  saving: boolean;
  deleting: boolean;
  onQueryChange: (value: string) => void;
  onAddUser: () => void;
  onDeleteSelected: () => void;
  onSaveChanges: () => void;
  onCancelChanges: () => void;
}

export function UsersToolbar({ query, selectedCount, draftCount, saving, deleting, onQueryChange, onAddUser, onDeleteSelected, onSaveChanges, onCancelChanges }: UsersToolbarProps) {
  return (
    <div className="admin-users-toolbar">
      <SearchBar value={query} section="users" onValueChange={onQueryChange} />
      <div className="admin-users-toolbar-actions">
        {draftCount > 0 ? (
          <div className="admin-unsaved-controls" role="status">
            <span>Confirm {draftCount} {draftCount === 1 ? "change" : "changes"}</span>
            <Button size="small" variant="ghost" disabled={saving} onClick={onCancelChanges}><X size={15} /> Cancel</Button>
            <Button size="small" disabled={saving} onClick={onSaveChanges}><Save size={15} /> {saving ? "Saving" : "Save"}</Button>
          </div>
        ) : null}
        {selectedCount > 0 ? (
          <Button size="small" variant="danger" disabled={deleting} onClick={onDeleteSelected}><Trash2 size={15} /> Delete ({selectedCount})</Button>
        ) : null}
        <Button size="small" onClick={onAddUser}><Plus size={15} /> Add User</Button>
      </div>
    </div>
  );
}
