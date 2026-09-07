import { requestJornizApi } from "../../../lib/api/requestJornizApi";

export interface AdvertisingCampaign {
  id: string;
  name: string;
  objective: string;
  status: string;
  budget: number;
  spent: number;
  remaining: number;
  impressions: number;
  clicks: number;
  headline: string;
  bodyText: string;
  imageUrl: string;
  callToAction: string;
  destinationUrl: string;
}

export interface NewAdvertisingCampaign {
  name: string;
  objective: string;
  budget: number;
  bidAmount: number;
  targetSpecialty: string;
  targetLocation: string;
  headline: string;
  bodyText: string;
  callToAction: string;
  destinationUrl: string;
  image?: File;
}

export interface SponsoredPlacement extends AdvertisingCampaign {
  creativeId: string;
}

function numeric(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeCampaign(row: Record<string, unknown>): AdvertisingCampaign {
  const creative = (row.creative ?? {}) as Record<string, unknown>;
  const budget = numeric(row.budget ?? row.total_budget);
  const spent = numeric(row.spent ?? row.spent_amount);
  return {
    id: String(row.id ?? ""),
    name: String(row.name ?? row.title ?? "Untitled campaign"),
    objective: String(row.objective ?? "Awareness"),
    status: String(row.status ?? "Draft"),
    budget,
    spent,
    remaining: numeric(row.remaining ?? Math.max(0, budget - spent)),
    impressions: numeric(row.impressions),
    clicks: numeric(row.clicks),
    headline: String(creative.headline ?? row.headline ?? ""),
    bodyText: String(creative.body_text ?? row.body_text ?? ""),
    imageUrl: String(creative.image_url ?? row.image_url ?? row.creative_url ?? ""),
    callToAction: String(creative.cta_text ?? row.cta_text ?? "Learn more"),
    destinationUrl: String(creative.cta_link ?? row.cta_link ?? ""),
  };
}

export async function loadAdvertisingCampaigns(): Promise<AdvertisingCampaign[]> {
  const response = await requestJornizApi<
    Array<Record<string, unknown>> | { campaigns?: Array<Record<string, unknown>> }
  >("/api/ads/campaigns/mine");
  const campaigns = Array.isArray(response) ? response : response.campaigns ?? [];
  return campaigns.map(normalizeCampaign);
}

export async function createAdvertisingCampaign(
  campaign: NewAdvertisingCampaign,
): Promise<AdvertisingCampaign> {
  const body = new FormData();
  body.append("name", campaign.name);
  body.append("title", campaign.name);
  body.append("objective", campaign.objective);
  body.append("budget", String(campaign.budget));
  body.append("total_budget", String(campaign.budget));
  body.append("bid_amount", String(campaign.bidAmount));
  body.append("target_specialty", campaign.targetSpecialty);
  body.append("target_location", campaign.targetLocation);
  body.append("headline", campaign.headline);
  body.append("body_text", campaign.bodyText);
  body.append("cta_text", campaign.callToAction);
  body.append("cta_link", campaign.destinationUrl);
  if (campaign.image) body.append("image", campaign.image);

  const response = await requestJornizApi<Record<string, unknown>>("/api/ads/campaigns", {
    method: "POST",
    body,
  });
  return normalizeCampaign(response);
}

export async function changeAdvertisingCampaignStatus(
  campaignId: string,
  status: "active" | "paused",
): Promise<void> {
  await requestJornizApi("/api/ads/campaigns/" + encodeURIComponent(campaignId) + "/status", {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export async function deleteAdvertisingCampaign(campaignId: string): Promise<void> {
  await requestJornizApi("/api/ads/campaigns/" + encodeURIComponent(campaignId), {
    method: "DELETE",
  });
}

export async function loadSponsoredPlacement(): Promise<SponsoredPlacement | null> {
  const response = await requestJornizApi<Record<string, unknown> | null>("/api/ads/serve");
  if (!response || !response.id) return null;
  return {
    ...normalizeCampaign(response),
    creativeId: String(response.creative_id ?? ""),
  };
}

export async function recordSponsoredImpression(
  campaignId: string,
  creativeId: string,
): Promise<void> {
  await requestJornizApi("/api/ads/impression", {
    method: "POST",
    body: JSON.stringify({ campaign_id: campaignId, creative_id: creativeId }),
  });
}

export async function recordSponsoredClick(
  campaignId: string,
  creativeId: string,
): Promise<{ hu_coins?: number }> {
  return requestJornizApi("/api/ads/click", {
    method: "POST",
    body: JSON.stringify({ campaign_id: campaignId, creative_id: creativeId }),
  });
}
