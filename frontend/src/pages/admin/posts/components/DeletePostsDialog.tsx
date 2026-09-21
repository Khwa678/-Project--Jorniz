import { AlertTriangle } from "lucide-react";
import { AlertDialog } from "radix-ui";
import { Button } from "../../../../components/ui/Button";

export interface DeletePostsDialogProps {
  open: boolean;
  selectedCount: number;
  deleting: boolean;
  error: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
}

export function DeletePostsDialog({ open, selectedCount, deleting, error, onOpenChange, onConfirm }: DeletePostsDialogProps) {
  const label = selectedCount === 1 ? "post" : "posts";
  return (
    <AlertDialog.Root open={open} onOpenChange={(nextOpen) => { if (!deleting) onOpenChange(nextOpen); }}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="admin-dialog-overlay" />
        <AlertDialog.Content className="admin-dialog-content admin-delete-dialog">
          <div className="admin-delete-dialog-icon" aria-hidden="true"><AlertTriangle size={22} /></div>
          <AlertDialog.Title>Delete {selectedCount} selected {label}?</AlertDialog.Title>
          <AlertDialog.Description>This permanently removes the selected {label} and their related activity.</AlertDialog.Description>
          {error ? <p className="admin-form-error" role="alert">{error}</p> : null}
          <div className="admin-dialog-actions">
            <AlertDialog.Cancel asChild><Button variant="secondary" disabled={deleting}>Cancel</Button></AlertDialog.Cancel>
            <AlertDialog.Action asChild><Button variant="danger" disabled={deleting || !selectedCount} onClick={() => void onConfirm()}>{deleting ? "Deleting..." : `Delete ${label}`}</Button></AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
