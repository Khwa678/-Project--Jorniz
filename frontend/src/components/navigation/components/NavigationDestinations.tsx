import {
  Bell,
  Briefcase,
  House,
  Megaphone,
  MessageSquare,
  Phone,
  Search,
  Settings,
  ShoppingBag,
  SquarePlus,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { ReactElement } from "react";
import { Tooltip } from "radix-ui";
import { Button } from "../../ui/Button";

export type WorkspaceDestinationId =
  | "home"
  | "explore"
  | "notifications"
  | "messages"
  | "consultations"
  | "jobs"
  | "network"
  | "wallet"
  | "advertising"
  | "store"
  | "profile"
  | "settings";

export interface WorkspaceDestination {
  id: WorkspaceDestinationId;
  label: string;
  route: string;
}

export const workspaceDestinations: readonly WorkspaceDestination[] = [
  { id: "home", label: "Home", route: "/" },
  { id: "explore", label: "Explore", route: "/explore" },
  { id: "notifications", label: "Notifications", route: "/notifications" },
  { id: "messages", label: "Messages", route: "/messages" },
  { id: "consultations", label: "Consultations", route: "/consultations" },
  { id: "jobs", label: "Jobs", route: "/jobs" },
  { id: "network", label: "My Network", route: "/network" },
  { id: "wallet", label: "Rewards Wallet", route: "/wallet" },
  { id: "advertising", label: "Advertising", route: "/advertising" },
  { id: "store", label: "Health Marketplace", route: "/store" },
  { id: "profile", label: "Profile", route: "/profile" },
  { id: "settings", label: "Settings", route: "/settings" },
];

const destinationIcons: Record<WorkspaceDestinationId, LucideIcon> = {
  home: House,
  explore: Search,
  notifications: Bell,
  messages: MessageSquare,
  consultations: Phone,
  jobs: Briefcase,
  network: Users,
  wallet: Wallet,
  advertising: Megaphone,
  store: ShoppingBag,
  profile: UserRound,
  settings: Settings,
};

export interface NavigationDestinationsProps {
  activeDestination: WorkspaceDestinationId;
  onNavigate: (destination: WorkspaceDestination) => void;
  onCreatePost: () => void;
  compact?: boolean;
  unreadNotificationCount?: number;
}

export function NavigationDestinations({
  activeDestination,
  onNavigate,
  onCreatePost,
  compact = false,
  unreadNotificationCount = 0,
}: NavigationDestinationsProps) {
  return (
    <Tooltip.Provider delayDuration={300} skipDelayDuration={150}>
      <nav className="workspace-destination-list" aria-label="Jorniz sections">
        {workspaceDestinations.slice(0, 2).map((destination) => (
          <DestinationButton
            destination={destination}
            active={activeDestination === destination.id}
            onNavigate={onNavigate}
            compact={compact}
            badgeCount={destination.id === "notifications" ? unreadNotificationCount : 0}
            key={destination.id}
          />
        ))}
        <CompactNavigationTooltip label="Create post" enabled={compact}>
          <Button className="workspace-create-post" size="small" onClick={onCreatePost}>
            <span aria-hidden="true"><SquarePlus /></span>
            Create post
          </Button>
        </CompactNavigationTooltip>
        {workspaceDestinations.slice(2).map((destination) => (
          <DestinationButton
            destination={destination}
            active={activeDestination === destination.id}
            onNavigate={onNavigate}
            compact={compact}
            badgeCount={destination.id === "notifications" ? unreadNotificationCount : 0}
            key={destination.id}
          />
        ))}
      </nav>
    </Tooltip.Provider>
  );
}

interface CompactNavigationTooltipProps {
  label: string;
  enabled: boolean;
  children: ReactElement;
}

function CompactNavigationTooltip({ label, enabled, children }: CompactNavigationTooltipProps) {
  if (!enabled) return children;

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className="navigation-destination-tooltip" side="right" sideOffset={10}>
          {label}
          <Tooltip.Arrow className="navigation-destination-tooltip-arrow" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

interface DestinationButtonProps {
  destination: WorkspaceDestination;
  active: boolean;
  onNavigate: (destination: WorkspaceDestination) => void;
  compact: boolean;
  badgeCount: number;
}

function DestinationButton({ destination, active, onNavigate, compact, badgeCount }: DestinationButtonProps) {
  const DestinationIcon = destinationIcons[destination.id];

  return (
    <CompactNavigationTooltip label={destination.label} enabled={compact}>
      <button
        type="button"
        className={active ? "workspace-destination active" : "workspace-destination"}
        aria-current={active ? "page" : undefined}
        aria-label={compact ? destination.label : undefined}
        onClick={() => onNavigate(destination)}
      >
        <span className="destination-marker" aria-hidden="true"><DestinationIcon /></span>
        <span className="workspace-destination-label">{destination.label}</span>
        {badgeCount > 0 ? <span className="navigation-unread-count" aria-label={`${badgeCount} unread notifications`}>{badgeCount > 99 ? "99+" : badgeCount}</span> : null}
      </button>
    </CompactNavigationTooltip>
  );
}
