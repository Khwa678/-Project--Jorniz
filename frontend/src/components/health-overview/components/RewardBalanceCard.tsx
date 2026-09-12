import { CircleDollarSign } from "lucide-react";
import { Button } from "../../ui/Button";

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
        <Button variant="ghost" size="small" onClick={onOpenWallet} disabled={!onOpenWallet}>
          View wallet
        </Button>
      </div>
      <p>Redeem HU Coins on consultations, medicines, and more.</p>
    </section>
  );
}
