import { ChevronLeft, ChevronRight, LayoutDashboard } from "lucide-react";

export interface SidebarCollapseButtonProps {
  panel: "left" | "right";
  collapsed: boolean;
  onToggle: () => void;
}

export function SidebarCollapseButton({ panel, collapsed, onToggle }: SidebarCollapseButtonProps) {
  const pointsLeft = panel === "left" ? !collapsed : collapsed;
  const Icon = panel === "right" && collapsed
    ? LayoutDashboard
    : pointsLeft
      ? ChevronLeft
      : ChevronRight;
  const action = collapsed ? "Expand" : "Collapse";
  const panelName = panel === "left" ? "navigation" : "health overview";

  return (
    <button
      type="button"
      className={`sidebar-collapse-button sidebar-collapse-button-${panel}${collapsed ? " sidebar-collapse-button-collapsed" : ""}`}
      aria-label={`${action} ${panelName}`}
      title={`${action} ${panelName}`}
      onClick={onToggle}
    >
      <svg className="sidebar-collapse-button-shape" viewBox="0 0 20 40" preserveAspectRatio="none" aria-hidden="true">
        <path className="sidebar-collapse-button-fill" d="M20 0A4 4 0 0 1 16 4A16 16 0 0 0 16 36A4 4 0 0 1 20 40L20 0Z" />
        <path className="sidebar-collapse-button-outline" d="M20 0A4 4 0 0 1 16 4A16 16 0 0 0 16 36A4 4 0 0 1 20 40" />
      </svg>
      <Icon className="sidebar-collapse-button-icon" aria-hidden="true" />
    </button>
  );
}
