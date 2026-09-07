import { useEffect, useState } from "react";
import type { SignedInAccount } from "../../lib/auth/accountTypes";
import { MobileNavigationDrawer } from "./components/MobileNavigationDrawer";
import {
  NavigationDestinations,
  type WorkspaceDestination,
  type WorkspaceDestinationId,
} from "./components/NavigationDestinations";
import { NavigationMemberSummary } from "./components/NavigationMemberSummary";
import { NavigationRewardBalance } from "./components/NavigationRewardBalance";
import "./styles.css";

export interface WorkspaceNavigationProps {
  account: SignedInAccount;
  activeDestination: WorkspaceDestinationId;
  confirmedCoins: number | null;
  rewardBalanceLoading?: boolean;
  onNavigate: (destination: WorkspaceDestination) => void;
  onCreatePost: () => void;
  onOpenAccountOptions?: () => void;
}

export function WorkspaceNavigation({
  account,
  activeDestination,
  confirmedCoins,
  rewardBalanceLoading,
  onNavigate,
  onCreatePost,
  onOpenAccountOptions,
}: WorkspaceNavigationProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    let start: { x: number; y: number } | null = null;

    function rememberEdgeTouch(event: globalThis.TouchEvent) {
      const touch = event.touches[0];
      start = touch && touch.clientX <= 28 ? { x: touch.clientX, y: touch.clientY } : null;
    }

    function openAfterRightSwipe(event: globalThis.TouchEvent) {
      const touch = event.changedTouches[0];
      if (!start || !touch || drawerOpen) {
        start = null;
        return;
      }
      const horizontalTravel = touch.clientX - start.x;
      const verticalTravel = Math.abs(touch.clientY - start.y);
      if (horizontalTravel > 65 && verticalTravel < 70) setDrawerOpen(true);
      start = null;
    }

    window.addEventListener("touchstart", rememberEdgeTouch, { passive: true });
    window.addEventListener("touchend", openAfterRightSwipe, { passive: true });
    return () => {
      window.removeEventListener("touchstart", rememberEdgeTouch);
      window.removeEventListener("touchend", openAfterRightSwipe);
    };
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [drawerOpen]);

  function openWallet() {
    const wallet = { id: "wallet", label: "Rewards Wallet", route: "/wallet", marker: "RW" } as const;
    onNavigate(wallet);
  }

  return (
    <>
      {!drawerOpen && (
        <button
          type="button"
          className="mobile-navigation-launcher"
          aria-label="Open navigation"
          aria-expanded="false"
          onClick={() => setDrawerOpen(true)}
        >
          <span /><span /><span />
        </button>
      )}

      <aside className="desktop-workspace-navigation">
        <header><strong>Jorniz</strong><small>AI-Native Social and Participation Platform</small></header>
        <NavigationDestinations
          activeDestination={activeDestination}
          onNavigate={onNavigate}
          onCreatePost={onCreatePost}
        />
        <NavigationRewardBalance
          confirmedCoins={confirmedCoins}
          loading={rewardBalanceLoading}
          onOpenWallet={openWallet}
        />
        <NavigationMemberSummary account={account} onOpenAccountOptions={onOpenAccountOptions} />
      </aside>

      <MobileNavigationDrawer
        open={drawerOpen}
        account={account}
        activeDestination={activeDestination}
        confirmedCoins={confirmedCoins}
        rewardBalanceLoading={rewardBalanceLoading}
        onClose={() => setDrawerOpen(false)}
        onNavigate={onNavigate}
        onCreatePost={onCreatePost}
        onOpenWallet={openWallet}
        onOpenAccountOptions={onOpenAccountOptions}
      />
    </>
  );
}
