export interface RewardRedemptionProps {
  availableCoins: number;
  onOpenMarketplace?: () => void;
}

export function RewardRedemption({
  availableCoins,
  onOpenMarketplace,
}: RewardRedemptionProps) {
  return (
    <section className="reward-redemption-card">
      <div>
        <span className="reward-section-kicker">Use earned value</span>
        <h2>Redeem rewards in the Health Marketplace</h2>
        <p>
          Eligible orders calculate the permitted HU Coin discount on the server. Your current
          confirmed balance is {availableCoins.toLocaleString()} coins.
        </p>
      </div>
      <button type="button" onClick={onOpenMarketplace} disabled={!onOpenMarketplace}>
        Open marketplace
      </button>
    </section>
  );
}
