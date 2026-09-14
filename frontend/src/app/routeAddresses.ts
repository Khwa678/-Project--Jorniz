import {
  workspaceDestinations,
  type WorkspaceDestination,
  type WorkspaceDestinationId,
} from "../components/navigation/components/NavigationDestinations";

export function destinationForPath(pathname: string): WorkspaceDestination {
  return workspaceDestinations.find((item) => item.route === pathname)
    ?? workspaceDestinations[0];
}

export function destinationById(id: WorkspaceDestinationId): WorkspaceDestination {
  return workspaceDestinations.find((item) => item.id === id)
    ?? workspaceDestinations[0];
}

export function postIdForPath(pathname: string): string | null {
  const match = /^\/posts\/([^/]+)\/?$/.exec(pathname);
  return match ? decodeURIComponent(match[1]) : null;
}

export function memberIdForPath(pathname: string): string | null {
  const match = /^\/members\/([^/]+)\/?$/.exec(pathname);
  return match ? decodeURIComponent(match[1]) : null;
}

export function accountAccessModeForPath(pathname: string) {
  return pathname === "/sign-up" ? "create-account" as const : "sign-in" as const;
}
