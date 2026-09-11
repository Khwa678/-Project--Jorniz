import { useRef, type TouchEvent } from "react";
import type { SignedInAccount } from "../../../lib/auth/accountTypes";
import { NavigationDestinations, type WorkspaceDestination, type WorkspaceDestinationId } from "./NavigationDestinations";
import { NavigationMemberSummary } from "./NavigationMemberSummary";
import { NavigationRewardBalance } from "./NavigationRewardBalance";

export interface MobileNavigationDrawerProps {
  open: boolean;
  account: SignedInAccount;
  activeDestination: WorkspaceDestinationId;
  confirmedCoins: number | null;
  rewardBalanceLoading?: boolean;
  onClose: () => void;
  onNavigate: (destination: WorkspaceDestination) => void;
  onCreatePost: () => void;
  onOpenWallet: () => void;
  onOpenAccountOptions?: () => void;
  onSignOut: () => void;
}

export function MobileNavigationDrawer({
  open,
  account,
  activeDestination,
  confirmedCoins,
  rewardBalanceLoading,
  onClose,
  onNavigate,
  onCreatePost,
  onOpenWallet,
  onOpenAccountOptions,
  onSignOut,
}: MobileNavigationDrawerProps) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  function rememberTouch(event: TouchEvent<HTMLElement>) {
    const touch = event.touches[0];
    touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
  }

  function closeAfterLeftSwipe(event: TouchEvent<HTMLElement>) {
    const start = touchStart.current;
    const touch = event.changedTouches[0];
    touchStart.current = null;
    if (!start || !touch) return;
    const horizontalTravel = touch.clientX - start.x;
    const verticalTravel = Math.abs(touch.clientY - start.y);
    if (horizontalTravel < -60 && verticalTravel < 70) onClose();
  }

  function navigateAndClose(destination: WorkspaceDestination) {
    onNavigate(destination);
    onClose();
  }

  function createPostAndClose() {
    onCreatePost();
    onClose();
  }

  return (
    <div className={open ? "mobile-navigation-layer open" : "mobile-navigation-layer"} aria-hidden={!open}>
      <button
        type="button"
        className="mobile-navigation-overlay"
        aria-label="Close navigation"
        onClick={onClose}
        tabIndex={open ? 0 : -1}
      />
      <aside
        className="mobile-navigation-drawer"
        aria-label="Mobile navigation"
        onTouchStart={rememberTouch}
        onTouchEnd={closeAfterLeftSwipe}
      >
        <header>
          <div><strong>Jorniz</strong><small>AI-Native Social and Participation Platform</small></div>
          <button type="button" onClick={onClose} aria-label="Close navigation">X</button>
        </header>
        <NavigationDestinations
          activeDestination={activeDestination}
          onNavigate={navigateAndClose}
          onCreatePost={createPostAndClose}
        />
        <NavigationRewardBalance
          confirmedCoins={confirmedCoins}
          loading={rewardBalanceLoading}
          onOpenWallet={() => {
            onOpenWallet();
            onClose();
          }}
        />
        <NavigationMemberSummary
          account={account}
          onOpenAccountOptions={() => {
            onOpenAccountOptions?.();
            onClose();
          }}
          onSignOut={() => {
            onClose();
            onSignOut();
          }}
        />
      </aside>
    </div>
  );
}
