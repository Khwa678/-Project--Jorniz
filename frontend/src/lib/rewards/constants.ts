export const REWARD_DIRECTION_OPTIONS = [
  { value: "all", label: "All directions" },
  { value: "CREDIT", label: "Credit" },
  { value: "DEBIT", label: "Debit" },
] as const;

export const REWARD_SOURCE_OPTIONS = [
  { value: "all", label: "All sources" },
  { value: "ADMIN_REWARD", label: "Admin reward" },
  { value: "ADMIN_REVOCATION", label: "Admin revocation" },
  { value: "ADMIN_ADJUSTMENT_REVERSAL", label: "Admin adjustment reversal" },
  { value: "SOCIAL_POST_REWARD", label: "Post creation" },
  { value: "POST_REACTION_REWARD", label: "Post reaction" },
  { value: "POST_REACTION_REVERSAL", label: "Post reaction reversal" },
  { value: "POST_DELETE_REVERSAL", label: "Post deletion reversal" },
  { value: "AD_IMPRESSION_REWARD", label: "Ad impression" },
  { value: "AD_CLICK_REWARD", label: "Ad click" },
  { value: "ECOMMERCE_ORDER_REWARD", label: "Order reward" },
  { value: "JOB_APPLICATION_REWARD", label: "Job application" },
  { value: "CONNECTION_REWARD", label: "Connection" },
  { value: "SKILL_ENDORSEMENT_REWARD", label: "Skill endorsement" },
  { value: "CME_EVENT_REGISTRATION", label: "Event registration" },
  { value: "CANDIDATE_PROFILE_REWARD", label: "Candidate profile" },
  { value: "ORDER_CANCEL_COIN_REFUND", label: "Order cancellation refund" },
  { value: "ORDER_CANCEL_REWARD_REVERSAL", label: "Order reward reversal" },
] as const;

export const ADMIN_ADJUSTMENT_SOURCE_OPTIONS = [
  { value: "ADMIN_REWARD", label: "Admin reward", direction: "CREDIT" },
  { value: "ADMIN_REVOCATION", label: "Admin revocation", direction: "DEBIT" },
] as const;

export type AdminAdjustmentSource = (typeof ADMIN_ADJUSTMENT_SOURCE_OPTIONS)[number]["value"];

export function directionForAdminSource(source: AdminAdjustmentSource): "CREDIT" | "DEBIT" {
  return source === "ADMIN_REWARD" ? "CREDIT" : "DEBIT";
}

export function readableRewardSource(value: string): string {
  return value.toLowerCase().split("_").filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export function formatCoins(value: number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(Number(value) || 0);
}
