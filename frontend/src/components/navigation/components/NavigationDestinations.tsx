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
}

export function NavigationDestinations({
  activeDestination,
  onNavigate,
  onCreatePost,
}: NavigationDestinationsProps) {
  return (
    <nav className="workspace-destination-list" aria-label="Jorniz sections">
      {workspaceDestinations.slice(0, 2).map((destination) => (
        <DestinationButton
          destination={destination}
          active={activeDestination === destination.id}
          onNavigate={onNavigate}
          key={destination.id}
        />
      ))}
      <button type="button" className="workspace-create-post" onClick={onCreatePost}>
        <span aria-hidden="true"><SquarePlus /></span>
        Create post
      </button>
      {workspaceDestinations.slice(2).map((destination) => (
        <DestinationButton
          destination={destination}
          active={activeDestination === destination.id}
          onNavigate={onNavigate}
          key={destination.id}
        />
      ))}
    </nav>
  );
}

interface DestinationButtonProps {
  destination: WorkspaceDestination;
  active: boolean;
  onNavigate: (destination: WorkspaceDestination) => void;
}

function DestinationButton({ destination, active, onNavigate }: DestinationButtonProps) {
  const DestinationIcon = destinationIcons[destination.id];

  return (
    <button
      type="button"
      className={active ? "workspace-destination active" : "workspace-destination"}
      aria-current={active ? "page" : undefined}
      onClick={() => onNavigate(destination)}
    >
      <span className="destination-marker" aria-hidden="true"><DestinationIcon /></span>
      {destination.label}
    </button>
  );
}
