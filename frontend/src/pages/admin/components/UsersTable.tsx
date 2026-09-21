import { useState } from "react";
import { Coins, History } from "lucide-react";
import { EditableTextDropdown } from "../../../components/ui/EditableTextDropdown";
import { DOCTOR_SPECIALTY_SUGGESTIONS } from "../../../lib/doctors/constants";
import { USER_MANAGEMENT_ROLE_OPTIONS } from "../../../lib/auth/roles";
import { AccountSelect } from "../../auth/components/AccountSelect";
import { accountTypeChoices, type JornizAccountType } from "../../auth/types";
import type { AdminSystemRole, AdminUser, AdminUserRewardRequest, UserChanges, UserSortField } from "../types";
import { ResponsiveTable, type ResponsiveTableColumn, type TableSortDirection } from "./ResponsiveTable";
import { TableRowActions } from "./TableRowActions";

export type AdminUserDraft = Pick<UserChanges, "name" | "user_type" | "system_role" | "specialty">;
export type AdminUserDrafts = Record<string, AdminUserDraft>;

export interface UsersTableProps {
  users: readonly AdminUser[];
  drafts: AdminUserDrafts;
  selectedIds: ReadonlySet<string>;
  sortColumn: UserSortField;
  sortDirection: TableSortDirection;
  canManageRoles: boolean;
  onDraftChange: (user: AdminUser, changes: AdminUserDraft) => void;
  onSelectedIdsChange: (ids: Set<string>) => void;
  onSortChange: (column: UserSortField, direction: TableSortDirection) => void;
  onDeleteUser: (user: AdminUser) => void;
  onRewardAction: (request: AdminUserRewardRequest) => void;
}

function readable(value: string): string {
  return value.split("_").filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export function UsersTable({ users, drafts, selectedIds, sortColumn, sortDirection, canManageRoles, onDraftChange, onSelectedIdsChange, onSortChange, onDeleteUser, onRewardAction }: UsersTableProps) {
  const [editingNameId, setEditingNameId] = useState<string | null>(null);

  const columns: ResponsiveTableColumn<AdminUser>[] = [
    { id: "id", label: "User ID", sortable: true, render: (user) => <span className="admin-user-id" title={user.id}>{user.id.length > 8 ? `${user.id.slice(0, 8)}...` : user.id}</span> },
    {
      id: "name", label: "Name", sortable: true,
      render: (user) => {
        const value = drafts[user.id]?.name ?? user.name;
        return editingNameId === user.id ? (
          <input className="admin-inline-input" value={value} autoFocus aria-label={`Name for ${user.name}`}
            onChange={(event) => onDraftChange(user, { name: event.target.value })}
            onBlur={() => setEditingNameId(null)}
            onKeyDown={(event) => { if (event.key === "Enter" || event.key === "Escape") setEditingNameId(null); }} />
        ) : (
          <button className="admin-editable-value" type="button" onClick={() => setEditingNameId(user.id)}>{value || "Unnamed user"}</button>
        );
      },
    },
    {
      id: "user_type", label: "Type", sortable: true,
      render: (user) => {
        const value = drafts[user.id]?.user_type ?? user.user_type;
        const labelId = `admin-user-type-${user.id}`;
        return <div className="admin-cell-select"><span id={labelId} className="admin-visually-hidden">Account type for {user.name}</span><AccountSelect ariaLabelledBy={labelId} options={accountTypeChoices} value={value} onValueChange={(next) => onDraftChange(user, { user_type: next as JornizAccountType })} /></div>;
      },
    },
    {
      id: "specialty", label: "Speciality", sortable: true,
      render: (user) => {
        const effectiveType = drafts[user.id]?.user_type ?? user.user_type;
        const isDoctor = effectiveType === "doctor";
        const value = drafts[user.id]?.specialty ?? user.specialty ?? "";
        const labelId = `admin-user-specialty-${user.id}`;
        return <div className="admin-specialty-editor"><span id={labelId} className="admin-visually-hidden">Speciality for {user.name}</span><EditableTextDropdown ariaLabelledBy={labelId} value={isDoctor ? value : ""} options={DOCTOR_SPECIALTY_SUGGESTIONS} placeholder={isDoctor ? "Select or enter speciality" : "Not applicable"} disabled={!isDoctor} required={isDoctor} onValueChange={(specialty) => onDraftChange(user, { specialty })} /></div>;
      },
    },
    {
      id: "system_role", label: "Permissions", sortable: true,
      render: (user) => {
        const value = drafts[user.id]?.system_role ?? user.system_role;
        const isUserManagementRole = USER_MANAGEMENT_ROLE_OPTIONS.some((option) => option.value === value);
        if (!canManageRoles || !isUserManagementRole) return <span className={`admin-permission admin-permission-${value}`}>{value === "member" ? "User" : readable(value)}</span>;
        const labelId = `admin-user-role-${user.id}`;
        return <div className="admin-cell-select"><span id={labelId} className="admin-visually-hidden">Permissions for {user.name}</span><AccountSelect ariaLabelledBy={labelId} options={USER_MANAGEMENT_ROLE_OPTIONS} value={value} onValueChange={(next) => onDraftChange(user, { system_role: next as AdminSystemRole })} /></div>;
      },
    },
    {
      id: "hu_coins",
      label: "HU Coins",
      render: (user) => (
        <span className="admin-table-pill" title={`${user.hu_coins ?? 0} HU Coins`}>
          <Coins size={13} aria-hidden="true" />
          {(user.hu_coins ?? 0).toLocaleString()}
        </span>
      ),
    },
  ];

  return <ResponsiveTable rows={users} columns={columns} getRowId={(user) => user.id} emptyMessage="No users match your search."
    selectedRowIds={selectedIds} onSelectedRowIdsChange={onSelectedIdsChange} selectRowOnClick
    sortColumn={sortColumn} sortDirection={sortDirection} onSortChange={(column, direction) => onSortChange(column as UserSortField, direction)}
    renderActions={(user) => (
      <TableRowActions
        rowLabel={user.name}
        items={[
          {
            label: "View reward history",
            icon: <History size={15} />,
            onSelect: () => onRewardAction({ action: "history", user }),
          },
          {
            label: "Adjust HU Coins",
            icon: <Coins size={15} />,
            onSelect: () => onRewardAction({ action: "adjust", user }),
          },
        ]}
        onDelete={() => onDeleteUser(user)}
      />
    )} />;
}
