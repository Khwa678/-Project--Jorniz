import { Dialog } from "radix-ui";
import type { AddUserInput } from "../types";
import { AddUserForm } from "./AddUserForm";
import "./add-user.css";

export interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: AddUserInput) => Promise<void> | void;
  submitting?: boolean;
  error?: string;
  canManageRoles?: boolean;
}

export function AddUserDialog({
  open,
  onOpenChange,
  onSubmit,
  submitting = false,
  error = "",
  canManageRoles = false,
}: AddUserDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => {
      if (!submitting) onOpenChange(nextOpen);
    }}>
      <Dialog.Portal>
        <Dialog.Overlay className="admin-dialog-overlay" />
        <Dialog.Content className="admin-dialog-content" aria-describedby="admin-add-user-description">
          <header className="admin-dialog-heading">
            <Dialog.Title>Add user</Dialog.Title>
            <Dialog.Description id="admin-add-user-description">
              Create a Jorniz account without changing your current administrator session.
            </Dialog.Description>
          </header>
          <AddUserForm
            key={open ? "open" : "closed"}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            submitting={submitting}
            requestError={error}
            canManageRoles={canManageRoles}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
