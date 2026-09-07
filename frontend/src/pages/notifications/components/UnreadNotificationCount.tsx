export interface UnreadNotificationCountProps { count: number; }
export function UnreadNotificationCount({ count }: UnreadNotificationCountProps) { return <span className="unread-notification-count" aria-label={`${count} unread notifications`}>{count}</span>; }
