import { useRef, type TouchEvent } from "react";
import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import type { SignedInAccount } from "../../../lib/auth/accountTypes";
import { Button } from "../../ui/Button";
import { NavigationDestinations, type WorkspaceDestination, type WorkspaceDestinationId } from "./NavigationDestinations";
import { NavigationMemberSummary } from "./NavigationMemberSummary";
import { NavigationRewardBalance } from "./NavigationRewardBalance";

export interface MobileNavigationDrawerProps {
  open: boolean;
  account: SignedInAccount;
  activeDestination: WorkspaceDestinationId;
  confirmedCoins: number | null;
  rewardBalanceLoading?: boolean;
  unreadNotificationCount: number;
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
  unreadNotificationCount,
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
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="mobile-navigation-overlay" />
        <Dialog.Content
          className="mobile-navigation-drawer"
          aria-label="Mobile navigation"
          onTouchStart={rememberTouch}
          onTouchEnd={closeAfterLeftSwipe}
        >
          <header>
            <div>
              <Dialog.Title asChild><strong>Jorniz</strong></Dialog.Title>
              <Dialog.Description asChild><small>AI-Native Social and Participation Platform</small></Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button className="mobile-navigation-close" size="small" variant="ghost" aria-label="Close navigation">
                <X aria-hidden="true" />
              </Button>
            </Dialog.Close>
          </header>
          <NavigationDestinations
            activeDestination={activeDestination}
            onNavigate={navigateAndClose}
            onCreatePost={createPostAndClose}
            unreadNotificationCount={unreadNotificationCount}
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
