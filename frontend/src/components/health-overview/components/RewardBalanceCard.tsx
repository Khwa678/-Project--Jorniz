import { CircleDollarSign } from "lucide-react";

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
      <h2><CircleDollarSign size={16} aria-hidden="true" />HU Coins</h2>
      <div>
        <strong>
          {loading ? "Loading" : confirmedCoins === null ? "Unavailable" : confirmedCoins.toLocaleString()}
        </strong>
        <button type="button" onClick={onOpenWallet} disabled={!onOpenWallet}>View wallet</button>
      </div>
      <p>Redeem HU Coins on consultations, medicines, and more.</p>
    </section>
  );
}
