export const SYSTEM_ROLE_OPTIONS = [
  { value: "member", label: "User" },
  { value: "moderator", label: "Moderator" },
  { value: "admin", label: "Admin" },
  { value: "finance_admin", label: "Finance Admin" },
  { value: "super_admin", label: "Super Admin" },
] as const;

export type SystemRole = typeof SYSTEM_ROLE_OPTIONS[number]["value"];

export const SYSTEM_ROLE_VALUES = SYSTEM_ROLE_OPTIONS.map((option) => option.value);

export const USER_MANAGEMENT_ROLE_OPTIONS = SYSTEM_ROLE_OPTIONS.filter(
  (option) => option.value === "member" || option.value === "admin",
);

export const ADMIN_SYSTEM_ROLES = ["admin", "finance_admin", "super_admin"] as const;

export function isAdministrator(systemRole?: string): boolean {
  return ADMIN_SYSTEM_ROLES.includes(systemRole as typeof ADMIN_SYSTEM_ROLES[number]);
}
