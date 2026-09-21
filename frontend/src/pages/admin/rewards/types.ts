import type { AdminUser } from "../types";
import type { AdminAdjustmentSource } from "../../../lib/rewards/constants";

export type RewardDirection = "CREDIT" | "DEBIT";
export type RewardSortDirection = "asc" | "desc";

export interface RewardUser extends AdminUser {
  hu_coins: number;
}

export interface RewardSummary {
  current_user_balances: number;
  credits: number;
  debits: number;
  balance_mismatches: number;
}

export interface RewardLedgerEntry {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  credit_debit: RewardDirection;
  amount: number;
  current_balance: number;
  balance_before: number;
  balance_after: number;
  source_type: string;
  source_id: string | null;
  status: string;
  actor_user_id: string | null;
  actor_name: string | null;
  actor_email: string | null;
  reason: string | null;
  reversal_of_id: string | null;
  reversed_by_id?: string | null;
  can_reverse?: boolean;
  created_at: string;
}

export interface RewardLedgerParams {
  q?: string;
  user_ids?: string;
  direction?: string;
  source_type?: string;
  page?: number;
  page_size?: number;
}

export interface RewardSummaryParams {
  user_ids?: string;
  direction?: string;
  source_type?: string;
}

export interface RewardLedgerPage {
  items: RewardLedgerEntry[];
  page: number;
  page_size: number;
  total: number;
}

export interface RewardAdjustmentInput {
  user_id: string;
  source_type: AdminAdjustmentSource;
  amount: number;
  reason: string;
  request_id: string;
}

export interface RewardCorrectionInput {
  source_type: AdminAdjustmentSource;
  amount: number;
  reason: string;
  request_id: string;
}

export interface RewardReversalInput {
  reason: string;
  request_id: string;
}

export interface RewardEntryResponse {
  entry: RewardLedgerEntry;
}

export interface RewardCorrectionResponse extends RewardEntryResponse {
  reversal: RewardLedgerEntry;
}
