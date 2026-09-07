export interface RewardBalanceCardProps {
  confirmedCoins: number | null;
  loading?: boolean;
  onOpenWallet?: () => void;
}

export function RewardBalanceCard({
  confirmedCoins,
  loading = false,
  onOpenWallet,
}: RewardBalanceCardProps) {
  return (
    <section className="health-overview-card overview-reward-card">
      <span className="overview-card-status">Server-confirmed balance</span>
      <h2>HU Coins</h2>
      <div>
        <strong>
          {loading ? "Loading" : confirmedCoins === null ? "Unavailable" : confirmedCoins.toLocaleString()}
        </strong>
        <button type="button" onClick={onOpenWallet} disabled={!onOpenWallet}>View wallet</button>
      </div>
      <p>Redeem eligible rewards through consultations and the Health Marketplace.</p>
    </section>
  );
}
