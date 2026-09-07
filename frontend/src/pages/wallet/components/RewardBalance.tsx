import type { RewardBalanceSnapshot } from "../api/requests";

export interface RewardBalanceProps {
  balance: RewardBalanceSnapshot;
}

export function RewardBalance({ balance }: RewardBalanceProps) {
  return (
    <section className="reward-balance-grid" aria-label="Reward balances">
      <article className="reward-balance-card reward-balance-card-primary">
        <span>Available HU Coins</span>
        <strong>{balance.availableCoins.toLocaleString()}</strong>
        <small>Confirmed by the Jorniz reward ledger</small>
      </article>
      <article className="reward-balance-card">
        <span>Pending HU Coins</span>
        <strong>{balance.pendingCoins.toLocaleString()}</strong>
        <small>Not available to redeem yet</small>
      </article>
      <article className="reward-balance-card">
        <span>Withdrawable earnings</span>
        <strong>{"$"}{balance.withdrawableAmount.toFixed(2)}</strong>
        <small>Cash withdrawal is not enabled in this prototype</small>
      </article>
    </section>
  );
}
