import { MessageCircle } from "lucide-react";

export interface HealthAssistantButtonProps {
  notificationCount: number;
  onOpen: () => void;
}

export function HealthAssistantButton({ notificationCount, onOpen }: HealthAssistantButtonProps) {
  return (
    <button
      type="button"
      className="health-assistant-launcher"
      aria-label={`Open scripted health guidance${notificationCount > 0 ? `, ${notificationCount} unread` : ""}`}
      onClick={onOpen}
    >
      <MessageCircle aria-hidden="true" />
      {notificationCount > 0 ? (
        <span className="health-assistant-notification-count" aria-hidden="true">
          {notificationCount > 99 ? "99+" : notificationCount}
        </span>
      ) : null}
    </button>
  );
}
