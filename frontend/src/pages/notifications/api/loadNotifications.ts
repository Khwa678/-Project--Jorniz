import { requestJornizApi } from "../../../lib/api/requestJornizApi";
import type { ActivityNotification } from "../types";
export function loadNotifications(signal?: AbortSignal) { return requestJornizApi<ActivityNotification[]>("/api/notifications?limit=50", { signal }); }
