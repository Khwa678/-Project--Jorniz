import { requestJornizApi } from "../../../lib/api/requestJornizApi";

export interface RewardBalanceSnapshot {
  availableCoins: number;
  pendingCoins: number;
  withdrawableAmount: number;
}

export interface RewardLedgerEntry {
  id: string;
  userId: string;
  direction: "credit" | "debit";
  amount: number;
  balanceAfter: number;
  source: string;
  sourceId: string;
  reason: string;
  status: string;
  createdAt: string;
}

interface RewardSummaryResponse {
  available_balance?: number;
  hu_coins_balance?: number;
  balance?: number;
  pending_balance?: number;
  wallet_balance?: number;
}

interface RewardLedgerResponse {
  ledger?: Array<Record<string, unknown>>;
  entries?: Array<Record<string, unknown>>;
  transactions?: Array<Record<string, unknown>>;
}

function confirmedNumber(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

export async function loadRewardBalance(): Promise<RewardBalanceSnapshot> {
  const response = await requestJornizApi<RewardSummaryResponse>("/api/rewards/summary");
  return {
    availableCoins: confirmedNumber(
      response.available_balance ?? response.hu_coins_balance ?? response.balance,
    ),
    pendingCoins: confirmedNumber(response.pending_balance),
    withdrawableAmount: confirmedNumber(response.wallet_balance),
  };
}

export async function loadRewardLedger(): Promise<RewardLedgerEntry[]> {
  const response = await requestJornizApi<RewardLedgerResponse>("/api/wallet/ledger");
  const rows = response.ledger ?? response.entries ?? response.transactions ?? [];

  return rows.map((row, index) => {
    const rawDirection = String(row.credit_debit ?? row.direction ?? "").toLowerCase();
    return {
      id: String(row.id ?? "reward-entry-" + index),
      userId: String(row.user_id ?? ""),
      direction: rawDirection === "debit" ? "debit" : "credit",
      amount: confirmedNumber(row.amount),
      balanceAfter: confirmedNumber(row.balance_after),
      source: String(row.source_type ?? row.source ?? "Reward activity"),
      sourceId: String(row.source_id ?? ""),
      reason: String(row.reason ?? ""),
      status: String(row.status ?? "available"),
      createdAt: String(row.created_at ?? ""),
    };
  });
}
