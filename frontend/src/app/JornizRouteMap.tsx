import { useState } from "react";
import { AlertDialog } from "radix-ui";
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
import { Button } from "../components/ui/Button";

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
  onPostNotice: (message: string) => void;
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
  onPostNotice,
}: JornizRouteMapProps) {
  const [postActionError, setPostActionError] = useState("");
  const [postToDelete, setPostToDelete] = useState<HealthPost | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [deletingPost, setDeletingPost] = useState(false);

  async function removePost(post: HealthPost) {
    setPostActionError("");
    setDeleteError("");
    setDeletingPost(true);
    try {
      const result = await deletePost(String(post.id));
      if (result.warning) onPostNotice(result.warning);
      setPostToDelete(null);
      onPostDeleted();
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "The post could not be deleted.");
    } finally {
      setDeletingPost(false);
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
        <Button className="workspace-sign-out" variant="danger" onClick={onSignOut}>Sign out</Button>
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
        onDeletePost={(post) => {
          setDeleteError("");
          setPostToDelete(post);
        }}
      />
      <AlertDialog.Root
        open={postToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deletingPost) setPostToDelete(null);
        }}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="workspace-alert-overlay" />
          <AlertDialog.Content className="workspace-alert-dialog">
            <AlertDialog.Title className="workspace-alert-title">Delete post?</AlertDialog.Title>
            <AlertDialog.Description className="workspace-alert-description">
              This permanently deletes the post and its stored media.
            </AlertDialog.Description>
            {deleteError ? <p className="workspace-action-error" role="alert">{deleteError}</p> : null}
            <div className="workspace-alert-actions">
              <AlertDialog.Cancel asChild>
                <Button variant="secondary" disabled={deletingPost}>Cancel</Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button
                  variant="danger"
                  disabled={deletingPost}
                  onClick={(event) => {
                    event.preventDefault();
                    if (postToDelete) void removePost(postToDelete);
                  }}
                >
                  {deletingPost ? "Deleting..." : "Delete post"}
                </Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  );
}
