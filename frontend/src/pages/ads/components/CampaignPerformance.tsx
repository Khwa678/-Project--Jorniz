import type { AdvertisingCampaign } from "../api/requests";

export interface CampaignPerformanceProps {
  campaigns: AdvertisingCampaign[];
}

export function CampaignPerformance({ campaigns }: CampaignPerformanceProps) {
  const impressions = campaigns.reduce((total, campaign) => total + campaign.impressions, 0);
  const clicks = campaigns.reduce((total, campaign) => total + campaign.clicks, 0);
  const spent = campaigns.reduce((total, campaign) => total + campaign.spent, 0);

  return (
    <section className="campaign-performance" aria-label="Campaign performance">
      <div><strong>{campaigns.length}</strong><span>Campaigns</span></div>
      <div><strong>{impressions.toLocaleString()}</strong><span>Impressions</span></div>
      <div><strong>{clicks.toLocaleString()}</strong><span>Clicks</span></div>
      <div><strong>{"$"}{spent.toFixed(2)}</strong><span>Recorded spend</span></div>
    </section>
  );
}
