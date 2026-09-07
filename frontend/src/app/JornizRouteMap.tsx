import { useState } from "react";
import { AccountSettingsPage } from "../pages/settings/AccountSettingsPage";
import { NotificationsPage } from "../pages/notifications";
import { AdvertisingCampaignsPage } from "../pages/ads/AdvertisingCampaignsPage";
import { DirectMessagesPage } from "../pages/messages/DirectMessagesPage";
import { DoctorConsultationsPage } from "../pages/consultations/DoctorConsultationsPage";
import { ExploreSearchPage } from "../pages/explore";
import { HealthMarketplacePage } from "../pages/store";
import { HealthcareJobsPage } from "../pages/jobs/HealthcareJobsPage";
import { HomeFeedPage, type HealthPost } from "../pages/home";
import { MemberProfilePage } from "../pages/profile";
import { deletePost, type EditablePost } from "../components/post-editor";
import { ProfessionalNetworkPage } from "../pages/network/ProfessionalNetworkPage";
import { RewardsWalletPage } from "../pages/wallet/RewardsWalletPage";
import { getSignedInAccessToken } from "../lib/auth/signedInAccount";
import type { SignedInAccount } from "../lib/auth/accountTypes";
import type { WorkspaceDestinationId } from "../components/navigation/components/NavigationDestinations";

export interface JornizRouteMapProps {
  account: SignedInAccount;
  destination: WorkspaceDestinationId;
  onAccountUpdated: (account: SignedInAccount) => void;
  onConfirmedCoins: (coins: number) => void;
  onNavigate: (destination: WorkspaceDestinationId) => void;
  onOpenPostEditor: (post?: EditablePost) => void;
  onSignOut: () => void;
  postRevision: number;
  onPostDeleted: () => void;
}

function editablePost(post: HealthPost): EditablePost {
  return {
    id: String(post.id),
    content: post.content ?? "",
    category: post.category,
    media_url: post.media_url,
    media_type: post.media_type,
  };
}

export function JornizRouteMap({
  account,
  destination,
  onAccountUpdated,
  onConfirmedCoins,
  onNavigate,
  onOpenPostEditor,
  onSignOut,
  postRevision,
  onPostDeleted,
}: JornizRouteMapProps) {
  const [postActionError, setPostActionError] = useState("");

  async function removePost(post: HealthPost) {
    if (!window.confirm("Delete this post and its stored media?")) return;
    setPostActionError("");
    try {
      await deletePost(String(post.id));
      onPostDeleted();
    } catch (error) {
      setPostActionError(error instanceof Error ? error.message : "The post could not be deleted.");
    }
  }

  if (destination === "explore") {
    return <ExploreSearchPage onOpenPost={() => onNavigate("home")} onOpenJob={() => onNavigate("jobs")} onOpenProduct={() => onNavigate("store")} />;
  }
  if (destination === "notifications") {
    return <NotificationsPage onOpenPost={() => onNavigate("home")} />;
  }
  if (destination === "messages") {
    return <DirectMessagesPage accessToken={getSignedInAccessToken()} signedInAccount={account} />;
  }
  if (destination === "consultations") return <DoctorConsultationsPage />;
  if (destination === "jobs") return <HealthcareJobsPage signedInAccount={account} />;
  if (destination === "network") return <ProfessionalNetworkPage />;
  if (destination === "wallet") {
    return <RewardsWalletPage onOpenMarketplace={() => onNavigate("store")} onConfirmedBalance={onConfirmedCoins} />;
  }
  if (destination === "advertising") return <AdvertisingCampaignsPage />;
  if (destination === "store") {
    return <HealthMarketplacePage signedInAccount={account} onRewardBalanceChanged={onConfirmedCoins} />;
  }
  if (destination === "profile") {
    return <MemberProfilePage signedInAccount={account} onOpenPost={() => onNavigate("home")} onOpenSettings={() => onNavigate("settings")} />;
  }
  if (destination === "settings") {
    return (
      <div className="settings-route">
        <AccountSettingsPage account={account} onAccountUpdated={onAccountUpdated} onAccountDeactivated={onSignOut} />
        <button className="workspace-sign-out" type="button" onClick={onSignOut}>Sign out</button>
      </div>
    );
  }

  return (
    <>
      {postActionError ? <p className="workspace-action-error" role="alert">{postActionError}</p> : null}
      <HomeFeedPage
        key={postRevision}
        signedInAccount={account}
        onOpenCreatePost={() => onOpenPostEditor()}
        onEditPost={(post) => onOpenPostEditor(editablePost(post))}
        onDeletePost={(post) => void removePost(post)}
      />
    </>
  );
}
