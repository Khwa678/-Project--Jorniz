export const ADMIN_SYSTEM_ROLES = ["admin", "finance_admin", "super_admin"] as const;

export function isAdministrator(systemRole?: string): boolean {
  return ADMIN_SYSTEM_ROLES.includes(systemRole as typeof ADMIN_SYSTEM_ROLES[number]);
}
