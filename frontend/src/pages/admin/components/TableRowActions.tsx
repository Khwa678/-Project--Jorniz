import type { ReactNode } from "react";
import { ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { Button } from "../../../components/ui/Button";

export interface TableRowActionItem {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  disabled?: boolean;
  danger?: boolean;
}

export interface TableRowActionsProps {
  rowLabel: string;
  onOpen?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  items?: readonly TableRowActionItem[];
  editDisabled?: boolean;
  deleteDisabled?: boolean;
}

export function TableRowActions({ rowLabel, onOpen, onEdit, onDelete, items = [], editDisabled = false, deleteDisabled = false }: TableRowActionsProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button className="admin-row-menu-trigger" size="small" variant="ghost" aria-label={`More options for ${rowLabel}`}>
          <MoreHorizontal size={18} />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="admin-row-menu" align="end" sideOffset={5}>
          {onOpen ? (
            <DropdownMenu.Item className="admin-row-menu-item" onSelect={onOpen}>
              <ExternalLink size={15} />Open
            </DropdownMenu.Item>
          ) : null}
          {onEdit ? (
            <DropdownMenu.Item className="admin-row-menu-item" disabled={editDisabled} onSelect={onEdit}>
              <Pencil size={15} />Edit row
            </DropdownMenu.Item>
          ) : null}
          {items.map((item) => (
            <DropdownMenu.Item
              className={`admin-row-menu-item${item.danger ? " danger" : ""}`}
              disabled={item.disabled}
              key={item.label}
              onSelect={item.onSelect}
            >
              {item.icon}
              {item.label}
            </DropdownMenu.Item>
          ))}
          {onDelete ? (
            <DropdownMenu.Item className="admin-row-menu-item danger" disabled={deleteDisabled} onSelect={onDelete}>
              <Trash2 size={15} />Delete
            </DropdownMenu.Item>
          ) : null}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
