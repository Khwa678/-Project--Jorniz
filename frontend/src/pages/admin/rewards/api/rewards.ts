import { apiRequest } from "../../../../lib/api/apiClient";
import type {
  RewardAdjustmentInput,
  RewardCorrectionInput,
  RewardCorrectionResponse,
  RewardEntryResponse,
  RewardLedgerPage,
  RewardLedgerParams,
  RewardReversalInput,
  RewardSummary,
  RewardSummaryParams,
} from "../types";

const REWARDS_PATH = "/api/admin/rewards";

function queryString<T extends object>(params: T): string {
  const query = new URLSearchParams();
  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
  });
  const value = query.toString();
  return value ? `?${value}` : "";
}

function jsonRequest(body: unknown): RequestInit {
  return { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}

export function getRewardSummary(params: RewardSummaryParams = {}): Promise<RewardSummary> {
  return apiRequest<RewardSummary>(`${REWARDS_PATH}/summary${queryString(params)}`);
}

export function getRewardLedger(params: RewardLedgerParams = {}): Promise<RewardLedgerPage> {
  return apiRequest<RewardLedgerPage>(`${REWARDS_PATH}/ledger${queryString(params)}`);
}

export function adjustHuCoins(input: RewardAdjustmentInput): Promise<RewardEntryResponse> {
  return apiRequest<RewardEntryResponse>(`${REWARDS_PATH}/adjustments`, jsonRequest(input));
}

export function reverseRewardAdjustment(ledgerId: string, input: RewardReversalInput): Promise<RewardEntryResponse> {
  return apiRequest<RewardEntryResponse>(`${REWARDS_PATH}/adjustments/${encodeURIComponent(ledgerId)}/reverse`, jsonRequest(input));
}

export function correctRewardAdjustment(ledgerId: string, input: RewardCorrectionInput): Promise<RewardCorrectionResponse> {
  return apiRequest<RewardCorrectionResponse>(`${REWARDS_PATH}/adjustments/${encodeURIComponent(ledgerId)}/correct`, jsonRequest(input));
}
