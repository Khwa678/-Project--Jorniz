import { MailOpen } from "lucide-react";
import { Avatar, Tooltip } from "radix-ui";
import { Button } from "../../../components/ui/Button";
import type { ActivityNotification } from "../types";
import { notificationIsUnread } from "../types";
export interface NotificationRowProps { notification: ActivityNotification; markingRead: boolean; onMarkRead: (notificationId: string) => void; onOpenPost?: (postId: string) => void; }
export function NotificationRow({ notification, markingRead, onMarkRead, onOpenPost }: NotificationRowProps) {
  const unread = notificationIsUnread(notification);
  const actor = notification.actor_name ?? notification.name;
  const message = notification.message ?? notification.action ?? "Notification";
  const avatar = notification.avatar ?? notification.actor_avatar;
  const canOpenPost = Boolean(notification.post_id && onOpenPost);
  const notificationContent = <>
    <Avatar.Root className="notification-avatar">{avatar ? <Avatar.Image src={avatar} alt="" /> : null}<Avatar.Fallback aria-hidden="true">{(actor ?? "J").slice(0,1).toUpperCase()}</Avatar.Fallback></Avatar.Root>
    <div><p>{actor ? <strong>{actor} </strong> : null}{message}</p>{notification.quote ? <blockquote>{notification.quote}</blockquote> : null}<small>{notification.time ?? notification.created_at ?? ""}</small></div>
  </>;

  return <article className={`notification-row${unread ? " unread" : ""}`}>
    {canOpenPost ? <button className="notification-open-target" type="button" onClick={() => onOpenPost?.(notification.post_id!)} aria-label="Open related post">{notificationContent}</button> : <div className="notification-open-target notification-open-target-static">{notificationContent}</div>}
    <div className="notification-actions">
      {unread ? <Tooltip.Provider delayDuration={250}><Tooltip.Root><Tooltip.Trigger asChild><Button className="notification-mark-read" size="small" variant="ghost" disabled={markingRead} aria-label="Mark as read" onClick={() => onMarkRead(notification.id)}><MailOpen size={17} aria-hidden="true" /></Button></Tooltip.Trigger><Tooltip.Portal><Tooltip.Content className="notification-action-tooltip" side="top" sideOffset={7}>Mark as read<Tooltip.Arrow className="notification-action-tooltip-arrow" /></Tooltip.Content></Tooltip.Portal></Tooltip.Root></Tooltip.Provider> : null}
    </div>
  </article>;
}
