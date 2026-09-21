import { apiRequest } from "../../../lib/api/apiClient";
import type {
  AddUserInput,
  AdminUser,
  GetUsersParams,
  UserChanges,
  UsersDeleteResult,
  UsersPage,
  UsersUpdateResult,
  UserUpdate,
} from "../types";

const USERS_PATH = "/api/admin/users";

function jsonRequest(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

function usersQuery(params: GetUsersParams): string {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const value = query.toString();
  return value ? `?${value}` : "";
}

export function getUsers(params: GetUsersParams = {}): Promise<UsersPage> {
  return apiRequest<UsersPage>(`${USERS_PATH}${usersQuery(params)}`);
}

export async function addUser(input: AddUserInput): Promise<AdminUser> {
  const response = await apiRequest<{ user: AdminUser }>(USERS_PATH, jsonRequest("POST", input));
  return response.user;
}

export async function updateUser(userId: string, changes: UserChanges): Promise<AdminUser> {
  const response = await apiRequest<{ user: AdminUser }>(
    `${USERS_PATH}/${encodeURIComponent(userId)}`,
    jsonRequest("PATCH", changes),
  );
  return response.user;
}

export function updateUsers(updates: readonly UserUpdate[]): Promise<UsersUpdateResult> {
  return apiRequest<UsersUpdateResult>(USERS_PATH, jsonRequest("PATCH", { updates }));
}

export function deleteUser(userId: string): Promise<UsersDeleteResult> {
  return apiRequest<UsersDeleteResult>(`${USERS_PATH}/${encodeURIComponent(userId)}`, { method: "DELETE" });
}

export function deleteUsers(userIds: readonly string[]): Promise<UsersDeleteResult> {
  return apiRequest<UsersDeleteResult>(USERS_PATH, jsonRequest("DELETE", { user_ids: userIds }));
}
