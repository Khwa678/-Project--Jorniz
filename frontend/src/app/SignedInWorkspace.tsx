import { useEffect, useState } from "react";
import { HealthAssistant } from "../components/health-assistant/HealthAssistant";
import { HealthOverviewPanel } from "../components/health-overview/HealthOverviewPanel";
import { PostEditorDialog, type EditablePost, type PostWriteResult } from "../components/post-editor";
import { loadRewardBalance } from "../pages/wallet/api/requests";
import type { SignedInAccount } from "../lib/auth/accountTypes";
import {
  WorkspaceNavigation,
} from "../components/navigation/WorkspaceNavigation";
import type {
  WorkspaceDestination,
  WorkspaceDestinationId,
} from "../components/navigation/components/NavigationDestinations";
import { JornizRouteMap } from "./JornizRouteMap";
import { destinationById, destinationForPath } from "./routeAddresses";

export interface SignedInWorkspaceProps {
  account: SignedInAccount;
  onAccountUpdated: (account: SignedInAccount) => void;
  onSignOut: () => void;
}

function accountCoins(account: SignedInAccount): number | null {
  const value = account.hu_coins ?? account.coins;
  return typeof value === "number" ? value : null;
}

export function SignedInWorkspace({ account, onAccountUpdated, onSignOut }: SignedInWorkspaceProps) {
  const [destination, setDestination] = useState(() => destinationForPath(window.location.pathname));
  const [confirmedCoins, setConfirmedCoins] = useState<number | null>(() => accountCoins(account));
  const [rewardBalanceLoading, setRewardBalanceLoading] = useState(true);
  const [postEditorOpen, setPostEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<EditablePost | null>(null);
  const [postRevision, setPostRevision] = useState(0);
  const [postNotice, setPostNotice] = useState("");
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);

  useEffect(() => {
    const showBrowserDestination = () => setDestination(destinationForPath(window.location.pathname));
    window.addEventListener("popstate", showBrowserDestination);
    return () => window.removeEventListener("popstate", showBrowserDestination);
  }, []);

  useEffect(() => {
    let active = true;
    setRewardBalanceLoading(true);
    loadRewardBalance()
      .then((balance) => { if (active) setConfirmedCoins(balance.availableCoins); })
      .catch(() => { if (active) setConfirmedCoins(accountCoins(account)); })
      .finally(() => { if (active) setRewardBalanceLoading(false); });
    return () => { active = false; };
  }, [account]);

  function navigate(destinationToOpen: WorkspaceDestination) {
    window.history.pushState({}, "", destinationToOpen.route);
    setDestination(destinationToOpen);
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function navigateById(id: WorkspaceDestinationId) {
    navigate(destinationById(id));
  }

  function openPostEditor(post?: EditablePost) {
    setEditingPost(post ?? null);
    setPostEditorOpen(true);
  }

  useEffect(() => {
    if (!postNotice) return;
    const timeout = window.setTimeout(() => setPostNotice(""), 6000);
    return () => window.clearTimeout(timeout);
  }, [postNotice]);

  function acceptPostChange(result: PostWriteResult) {
    setPostEditorOpen(false);
    setEditingPost(null);
    setPostNotice(result.warning ?? "");
    setPostRevision((value) => value + 1);
    if (destination.id !== "home") navigateById("home");
  }

  return (
    <div className={`signed-in-workspace${leftSidebarCollapsed ? " left-sidebar-collapsed" : ""}${rightSidebarCollapsed ? " right-sidebar-collapsed" : ""}`}>
      <WorkspaceNavigation
        account={account}
        activeDestination={destination.id}
        confirmedCoins={confirmedCoins}
        rewardBalanceLoading={rewardBalanceLoading}
        onNavigate={navigate}
        onCreatePost={() => openPostEditor()}
        onOpenAccountOptions={() => navigateById("settings")}
        onSignOut={onSignOut}
        collapsed={leftSidebarCollapsed}
        onToggleCollapsed={() => setLeftSidebarCollapsed((collapsed) => !collapsed)}
      />
      <div className="workspace-content-grid">
        <section className="workspace-route-content">
          <JornizRouteMap
            account={account}
            destination={destination.id}
            onAccountUpdated={onAccountUpdated}
            onConfirmedCoins={setConfirmedCoins}
            onNavigate={navigateById}
            onOpenPostEditor={openPostEditor}
            onSignOut={onSignOut}
            postRevision={postRevision}
            onPostDeleted={() => setPostRevision((value) => value + 1)}
          />
        </section>
        <HealthOverviewPanel
          confirmedCoins={confirmedCoins}
          rewardBalanceLoading={rewardBalanceLoading}
          suggestedMembers={[]}
          trendingTopics={[]}
          onOpenWallet={() => navigateById("wallet")}
          onOpenAllSuggestions={() => navigateById("network")}
          onOpenTrendingTopic={() => navigateById("explore")}
          collapsed={rightSidebarCollapsed}
          onToggleCollapsed={() => setRightSidebarCollapsed((collapsed) => !collapsed)}
        />
      </div>
      {postNotice ? <button type="button" className="workspace-notice" aria-live="polite" onClick={() => setPostNotice("")}>{postNotice}</button> : null}
      <HealthAssistant />
      <PostEditorDialog
        open={postEditorOpen}
        post={editingPost}
        onClose={() => setPostEditorOpen(false)}
        onPostSaved={acceptPostChange}
      />
    </div>
  );
}
