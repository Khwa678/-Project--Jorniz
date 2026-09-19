import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { Button } from "../../../components/ui/Button";

export interface TableRowActionsProps {
  rowLabel: string;
  onEdit?: () => void;
  onDelete?: () => void;
  editDisabled?: boolean;
  deleteDisabled?: boolean;
}

export function TableRowActions({ rowLabel, onEdit, onDelete, editDisabled = false, deleteDisabled = false }: TableRowActionsProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button className="admin-row-menu-trigger" size="small" variant="ghost" aria-label={`More options for ${rowLabel}`}>
          <MoreHorizontal size={18} />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="admin-row-menu" align="end" sideOffset={5}>
          <DropdownMenu.Item className="admin-row-menu-item" disabled={!onEdit || editDisabled} onSelect={onEdit}>
            <Pencil size={15} />Edit row
          </DropdownMenu.Item>
          <DropdownMenu.Item className="admin-row-menu-item danger" disabled={!onDelete || deleteDisabled} onSelect={onDelete}>
            <Trash2 size={15} />Delete row
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
