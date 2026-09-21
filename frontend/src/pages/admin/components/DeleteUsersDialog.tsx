import { AlertTriangle } from "lucide-react";
import { AlertDialog } from "radix-ui";
import { Button } from "../../../components/ui/Button";
import "./add-user.css";

export interface DeleteUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onConfirm: () => Promise<void> | void;
  deleting?: boolean;
  error?: string;
}

export function DeleteUsersDialog({
  open,
  onOpenChange,
  selectedCount,
  onConfirm,
  deleting = false,
  error = "",
}: DeleteUsersDialogProps) {
  const label = selectedCount === 1 ? "user" : "users";

  return (
    <AlertDialog.Root open={open} onOpenChange={(nextOpen) => {
      if (!deleting) onOpenChange(nextOpen);
    }}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="admin-dialog-overlay" />
        <AlertDialog.Content className="admin-dialog-content admin-delete-dialog">
          <div className="admin-delete-dialog-icon" aria-hidden="true"><AlertTriangle size={22} /></div>
          <AlertDialog.Title>Delete {selectedCount} selected {label}?</AlertDialog.Title>
          <AlertDialog.Description>
            This removes the selected {label} and may affect content or activity connected to their accounts.
          </AlertDialog.Description>
          {error ? <p className="admin-form-error" role="alert">{error}</p> : null}
          <div className="admin-dialog-actions">
            <AlertDialog.Cancel asChild>
              <Button type="button" variant="secondary" disabled={deleting}>Cancel</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button type="button" variant="danger" disabled={deleting || selectedCount === 0} onClick={() => void onConfirm()}>
                {deleting ? "Deleting..." : `Delete ${label}`}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
