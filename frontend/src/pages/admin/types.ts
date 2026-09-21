import type { JornizAccountType } from "../auth/types";
import { SYSTEM_ROLE_OPTIONS, type SystemRole } from "../../lib/auth/roles";

export type AdminSystemRole = SystemRole;

export type UserSortField =
  | "id"
  | "name"
  | "email"
  | "user_type"
  | "system_role"
  | "specialty"
  | "created_at";

export type SortDirection = "asc" | "desc";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  user_type: JornizAccountType;
  system_role: AdminSystemRole;
  specialty: string | null;
  is_verified?: boolean;
  hu_coins: number;
  created_at?: string;
}

export type AdminUserRewardAction = "history" | "adjust";

export interface AdminUserRewardRequest {
  action: AdminUserRewardAction;
  user: Pick<AdminUser, "id" | "name" | "email" | "hu_coins">;
}

export interface GetUsersParams {
  q?: string;
  user_type?: JornizAccountType;
  system_role?: AdminSystemRole;
  page?: number;
  page_size?: number;
  sort?: UserSortField;
  direction?: SortDirection;
}

export interface UsersPage {
  items: AdminUser[];
  page: number;
  page_size: number;
  total: number;
}

export interface AddUserInput {
  name: string;
  email: string;
  password: string;
  user_type: JornizAccountType;
  system_role: AdminSystemRole;
  specialty?: string;
}

export type UserChanges = Partial<Pick<AdminUser, "name" | "user_type" | "system_role" | "specialty">>;

export interface UserUpdate extends UserChanges {
  id: string;
}

export interface UsersUpdateResult {
  updated_count: number;
  users: AdminUser[];
}

export interface UsersDeleteResult {
  deleted_count: number;
  deleted_ids: string[];
}

export const systemRoleChoices = SYSTEM_ROLE_OPTIONS;
