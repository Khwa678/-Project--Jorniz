import { forwardRef, type ButtonHTMLAttributes } from "react";
import { MessageCircle } from "lucide-react";

export interface HealthAssistantButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  notificationCount: number;
}

export const HealthAssistantButton = forwardRef<HTMLButtonElement, HealthAssistantButtonProps>(
  function HealthAssistantButton({ notificationCount, className = "", type = "button", ...buttonProps }, ref) {
    return (
      <button
        {...buttonProps}
        ref={ref}
        type={type}
        className={["health-assistant-launcher", className].filter(Boolean).join(" ")}
        aria-label={`Open scripted health guidance${notificationCount > 0 ? `, ${notificationCount} unread` : ""}`}
      >
        <MessageCircle aria-hidden="true" />
        {notificationCount > 0 ? (
          <span className="health-assistant-notification-count" aria-hidden="true">
            {notificationCount > 99 ? "99+" : notificationCount}
          </span>
        ) : null}
      </button>
    );
  },
);
