import { Plus, Save, Trash2, X } from "lucide-react";
import { Select } from "radix-ui";
import { Button } from "../../../../components/ui/Button";
import { SearchBar } from "../../components/SearchBar";
import { POST_CATEGORY_OPTIONS, POST_TRUST_OPTIONS, type PostTrustStatus } from "../types";

export interface PostsToolbarProps {
  query: string;
  canEdit: boolean;
  selectedCount: number;
  draftCount: number;
  saving: boolean;
  deleting: boolean;
  onQueryChange: (value: string) => void;
  onCreatePost: () => void;
  onBulkTrust: (value: PostTrustStatus) => void;
  onBulkCategory: (value: string) => void;
  onDeleteSelected: () => void;
  onSaveChanges: () => void;
  onCancelChanges: () => void;
}

function BulkSelect({ label, options, disabled, onSelect }: { label: string; options: readonly { value: string; label: string }[]; disabled: boolean; onSelect: (value: string) => void }) {
  return (
    <Select.Root value="" onValueChange={onSelect} disabled={disabled}>
      <Select.Trigger className="admin-post-bulk-select" aria-label={label}>
        <Select.Value placeholder={label} />
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="admin-post-select-menu" position="popper" sideOffset={5}>
          <Select.Viewport>
            {options.map((option) => <Select.Item className="admin-post-select-option" key={option.value} value={option.value}><Select.ItemText>{option.label}</Select.ItemText></Select.Item>)}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

export function PostsToolbar(props: PostsToolbarProps) {
  const categoryOptions = POST_CATEGORY_OPTIONS.map((value) => ({ value, label: value }));
  return (
    <div className="admin-users-toolbar admin-posts-toolbar">
      <SearchBar value={props.query} section="post titles" onValueChange={props.onQueryChange} />
      <div className="admin-users-toolbar-actions">
        {props.canEdit && props.selectedCount > 0 ? (
          <>
            <BulkSelect label="Set trust" options={POST_TRUST_OPTIONS} disabled={props.saving} onSelect={(value) => props.onBulkTrust(value as PostTrustStatus)} />
            <BulkSelect label="Set category" options={categoryOptions} disabled={props.saving} onSelect={props.onBulkCategory} />
          </>
        ) : null}
        {props.canEdit && props.draftCount > 0 ? (
          <div className="admin-unsaved-controls" role="status">
            <span>Confirm {props.draftCount} {props.draftCount === 1 ? "change" : "changes"}</span>
            <Button size="small" variant="ghost" disabled={props.saving} onClick={props.onCancelChanges}><X size={15} /> Cancel</Button>
            <Button size="small" disabled={props.saving} onClick={props.onSaveChanges}><Save size={15} /> {props.saving ? "Saving" : "Save"}</Button>
          </div>
        ) : null}
        {props.canEdit && props.selectedCount > 0 ? <Button size="small" variant="danger" disabled={props.deleting} onClick={props.onDeleteSelected}><Trash2 size={15} /> Delete ({props.selectedCount})</Button> : null}
        {props.canEdit ? <Button size="small" onClick={props.onCreatePost}><Plus size={15} /> Add post</Button> : null}
      </div>
    </div>
  );
}
