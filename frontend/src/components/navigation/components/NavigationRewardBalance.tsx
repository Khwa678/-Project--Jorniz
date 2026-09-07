export interface NavigationRewardBalanceProps {
  confirmedCoins: number | null;
  loading?: boolean;
  onOpenWallet: () => void;
}

export function NavigationRewardBalance({
  confirmedCoins,
  loading = false,
  onOpenWallet,
}: NavigationRewardBalanceProps) {
  return (
    <button type="button" className="navigation-reward-balance" onClick={onOpenWallet}>
      <span className="navigation-reward-mark" aria-hidden="true">HU</span>
      <span>
        <small>HU Coins</small>
        <strong>
          {loading ? "Loading" : confirmedCoins === null ? "Unavailable" : confirmedCoins.toLocaleString()}
        </strong>
      </span>
      <span aria-hidden="true">&gt;</span>
    </button>
  );
}
