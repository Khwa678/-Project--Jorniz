import { requestJornizApi } from "../../../lib/api/requestJornizApi";
export function markNotificationRead(notificationId: string) { return requestJornizApi<{ message: string }>(`/api/notifications/${encodeURIComponent(notificationId)}/read`, { method: "POST" }); }
export function markAllNotificationsRead() { return requestJornizApi<{ message: string }>("/api/notifications/read-all", { method: "POST" }); }
