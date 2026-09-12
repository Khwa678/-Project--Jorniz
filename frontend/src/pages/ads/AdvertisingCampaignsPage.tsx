import { useCallback, useEffect, useState } from "react";
import { AlertDialog, Dialog } from "radix-ui";
import { Button } from "../../components/ui/Button";
import { CampaignCreationForm } from "./components/CampaignCreationForm";
import { CampaignPerformance } from "./components/CampaignPerformance";
import {
  changeAdvertisingCampaignStatus,
  createAdvertisingCampaign,
  deleteAdvertisingCampaign,
  loadAdvertisingCampaigns,
  type AdvertisingCampaign,
  type NewAdvertisingCampaign,
} from "./api/requests";
import "./styles.css";

export function AdvertisingCampaignsPage() {
  const [campaigns, setCampaigns] = useState<AdvertisingCampaign[]>([]);
  const [showCreationForm, setShowCreationForm] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [failure, setFailure] = useState("");
  const [actionFailure, setActionFailure] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const refreshAdvertisingCampaigns = useCallback(async () => {
    setStatus("loading");
    setFailure("");
    try {
      setCampaigns(await loadAdvertisingCampaigns());
      setStatus("ready");
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "Campaigns could not be loaded.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void refreshAdvertisingCampaigns();
  }, [refreshAdvertisingCampaigns]);

  async function submitAdvertisingCampaign(campaign: NewAdvertisingCampaign) {
    setSubmitting(true);
    setActionFailure("");
    try {
      await createAdvertisingCampaign(campaign);
      setShowCreationForm(false);
      await refreshAdvertisingCampaigns();
    } catch (error) {
      setActionFailure(error instanceof Error ? error.message : "The campaign was not created.");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateCampaign(campaign: AdvertisingCampaign) {
    setActionFailure("");
    try {
      const nextStatus = campaign.status.toLowerCase() === "active" ? "paused" : "active";
      await changeAdvertisingCampaignStatus(campaign.id, nextStatus);
      await refreshAdvertisingCampaigns();
    } catch (error) {
      setActionFailure(error instanceof Error ? error.message : "Campaign status was not changed.");
    }
  }

  async function removeCampaign(campaignId: string) {
    setActionFailure("");
    try {
      await deleteAdvertisingCampaign(campaignId);
      await refreshAdvertisingCampaigns();
    } catch (error) {
      setActionFailure(error instanceof Error ? error.message : "The campaign was not deleted.");
    }
  }

  return (
    <main className="advertising-campaigns-page">
      <header className="advertising-page-heading workspace-page-heading">
        <div>
          <h1>Ads Manager</h1>
          <p className="workspace-page-tagline">Reach more people and see how your campaigns perform.</p>
        </div>
        <Dialog.Root open={showCreationForm} onOpenChange={setShowCreationForm}>
          <Dialog.Trigger asChild>
            <Button type="button">Create campaign</Button>
          </Dialog.Trigger>
          <CampaignCreationForm
            submitting={submitting}
            failure={actionFailure}
            onCancel={() => setShowCreationForm(false)}
            onCreate={submitAdvertisingCampaign}
          />
        </Dialog.Root>
      </header>

      {status === "loading" && <p>Loading advertising campaigns…</p>}
      {status === "error" && (
        <section className="campaign-error-state" role="alert">
          <strong>Campaigns are unavailable.</strong>
          <p>{failure}</p>
          <Button type="button" onClick={() => void refreshAdvertisingCampaigns()}>Try again</Button>
        </section>
      )}
      {status === "ready" && (
        <>
          <CampaignPerformance campaigns={campaigns} />
          {actionFailure && !showCreationForm && <p className="campaign-form-error">{actionFailure}</p>}
          {campaigns.length === 0 ? (
            <section className="campaign-empty-state">
              <h2>No campaigns yet</h2>
              <p>Create a campaign when an advertiser balance and creative are ready.</p>
            </section>
          ) : (
            <section className="campaign-list">
              {campaigns.map((campaign) => (
                <article className="advertising-campaign-card" key={campaign.id}>
                  {campaign.imageUrl && <img src={campaign.imageUrl} alt="" />}
                  <div className="campaign-card-copy">
                    <span>{campaign.objective}</span>
                    <h2>{campaign.name}</h2>
                    <p>{campaign.headline || "No creative headline supplied."}</p>
                    <small>{campaign.status}</small>
                  </div>
                  <div className="campaign-card-numbers">
                    <strong>{"$"}{campaign.spent.toFixed(2)}</strong>
                    <span>of {"$"}{campaign.budget.toFixed(2)}</span>
                    <progress value={campaign.spent} max={Math.max(campaign.budget, 1)} />
                  </div>
                  <div className="campaign-card-actions">
                    <Button type="button" onClick={() => void updateCampaign(campaign)}>
                      {campaign.status.toLowerCase() === "active" ? "Pause" : "Activate"}
                    </Button>
                    <AlertDialog.Root>
                      <AlertDialog.Trigger asChild>
                        <Button type="button" className="campaign-delete-button">Delete</Button>
                      </AlertDialog.Trigger>
                      <AlertDialog.Portal>
                        <AlertDialog.Overlay className="campaign-dialog-overlay" />
                        <AlertDialog.Content className="campaign-confirm-dialog">
                          <AlertDialog.Title>Delete campaign?</AlertDialog.Title>
                          <AlertDialog.Description>
                            This permanently removes the advertising campaign.
                          </AlertDialog.Description>
                          <div className="campaign-dialog-actions">
                            <AlertDialog.Cancel asChild>
                              <Button type="button" className="campaign-secondary-button">Cancel</Button>
                            </AlertDialog.Cancel>
                            <AlertDialog.Action asChild>
                              <Button
                                type="button"
                                className="campaign-delete-button"
                                onClick={() => void removeCampaign(campaign.id)}
                              >
                                Delete campaign
                              </Button>
                            </AlertDialog.Action>
                          </div>
                        </AlertDialog.Content>
                      </AlertDialog.Portal>
                    </AlertDialog.Root>
                  </div>
                </article>
              ))}
            </section>
          )}
        </>
      )}
    </main>
  );
}
