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
  marker: string;
}

export const workspaceDestinations: readonly WorkspaceDestination[] = [
  { id: "home", label: "Home", route: "/", marker: "H" },
  { id: "explore", label: "Explore", route: "/explore", marker: "E" },
  { id: "notifications", label: "Notifications", route: "/notifications", marker: "N" },
  { id: "messages", label: "Messages", route: "/messages", marker: "M" },
  { id: "consultations", label: "Consultations", route: "/consultations", marker: "C" },
  { id: "jobs", label: "Jobs", route: "/jobs", marker: "J" },
  { id: "network", label: "My Network", route: "/network", marker: "MN" },
  { id: "wallet", label: "Rewards Wallet", route: "/wallet", marker: "RW" },
  { id: "advertising", label: "Advertising", route: "/advertising", marker: "AD" },
  { id: "store", label: "Health Marketplace", route: "/store", marker: "HM" },
  { id: "profile", label: "Profile", route: "/profile", marker: "P" },
  { id: "settings", label: "Settings", route: "/settings", marker: "S" },
];

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
        <span aria-hidden="true">+</span>
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
  return (
    <button
      type="button"
      className={active ? "workspace-destination active" : "workspace-destination"}
      aria-current={active ? "page" : undefined}
      onClick={() => onNavigate(destination)}
    >
      <span className="destination-marker" aria-hidden="true">{destination.marker}</span>
      {destination.label}
    </button>
  );
}
