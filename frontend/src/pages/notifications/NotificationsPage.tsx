import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { NotificationRow } from "./components/NotificationRow";
import { UnreadNotificationCount } from "./components/UnreadNotificationCount";
import { loadNotifications } from "./api/loadNotifications";
import { markAllNotificationsRead, markNotificationRead } from "./api/markNotificationRead";
import { notificationIsUnread, type ActivityNotification } from "./types";
import "./styles.css";

export interface NotificationsPageProps { onOpenPost?: (postId: string) => void; }
function describeNotificationFailure(error: unknown) { return error instanceof Error ? error.message : "Notifications could not be loaded."; }
export function NotificationsPage({ onOpenPost }: NotificationsPageProps) { const [notifications, setNotifications] = useState<ActivityNotification[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [markingId, setMarkingId] = useState(""); const [markingAll, setMarkingAll] = useState(false); const [reloadNumber, setReloadNumber] = useState(0);
  useEffect(() => { const controller = new AbortController(); setLoading(true); setError(""); loadNotifications(controller.signal).then(setNotifications).catch((loadError: unknown) => { if (!controller.signal.aborted) setError(describeNotificationFailure(loadError)); }).finally(() => { if (!controller.signal.aborted) setLoading(false); }); return () => controller.abort(); }, [reloadNumber]);
  const unreadCount = notifications.filter(notificationIsUnread).length;
  async function saveNotificationRead(notificationId: string) { setMarkingId(notificationId); setError(""); try { await markNotificationRead(notificationId); setNotifications((current) => current.map((item) => item.id === notificationId ? { ...item, unread: false, is_read: true } : item)); } catch (readError) { setError(describeNotificationFailure(readError)); } finally { setMarkingId(""); } }
  async function saveAllNotificationsRead() { setMarkingAll(true); setError(""); try { await markAllNotificationsRead(); setNotifications((current) => current.map((item) => ({ ...item, unread: false, is_read: true }))); } catch (readError) { setError(describeNotificationFailure(readError)); } finally { setMarkingAll(false); } }
  return <main className="notifications-page"><header className="workspace-page-heading"><div><h1>Notifications <UnreadNotificationCount count={unreadCount} /></h1><p className="workspace-page-tagline">Review updates about your posts, connections, and activity.</p></div><Button variant="secondary" onClick={saveAllNotificationsRead} disabled={markingAll || unreadCount === 0}>{markingAll ? "Saving..." : "Mark all as read"}</Button></header>{loading ? <p className="notifications-state" aria-live="polite">Loading notifications...</p> : null}{error ? <div className="notifications-state notifications-error"><p>{error}</p><Button variant="secondary" onClick={() => setReloadNumber((value) => value + 1)}>Try again</Button></div> : null}{!loading && !error && notifications.length === 0 ? <p className="notifications-state">You do not have any notifications yet.</p> : null}{!loading && notifications.length > 0 ? <div className="notification-list">{notifications.map((notification) => <NotificationRow key={notification.id} notification={notification} markingRead={markingId === notification.id} onMarkRead={saveNotificationRead} onOpenPost={onOpenPost} />)}</div> : null}</main>;
}
