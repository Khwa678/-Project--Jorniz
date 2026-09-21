import { useCallback, useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import type { SignedInAccount } from "../../lib/auth/accountTypes";
import { RewardBalance } from "./components/RewardBalance";
import { RewardLedger } from "./components/RewardLedger";
import { RewardRedemption } from "./components/RewardRedemption";
import {
  loadRewardBalance,
  loadRewardLedger,
  type RewardBalanceSnapshot,
  type RewardLedgerEntry,
} from "./api/requests";
import "./styles.css";

const emptyBalance: RewardBalanceSnapshot = {
  availableCoins: 0,
  pendingCoins: 0,
  withdrawableAmount: 0,
};

export interface RewardsWalletPageProps {
  account: SignedInAccount;
  onOpenMarketplace?: () => void;
  onConfirmedBalance?: (coins: number) => void;
}

export function RewardsWalletPage({
  account,
  onOpenMarketplace,
  onConfirmedBalance,
}: RewardsWalletPageProps) {
  const [balance, setBalance] = useState(emptyBalance);
  const [entries, setEntries] = useState<RewardLedgerEntry[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [failure, setFailure] = useState("");

  const refreshRewardsWallet = useCallback(async () => {
    setStatus("loading");
    setFailure("");
    try {
      const [confirmedBalance, confirmedEntries] = await Promise.all([
        loadRewardBalance(),
        loadRewardLedger(),
      ]);
      setBalance(confirmedBalance);
      setEntries(confirmedEntries);
      onConfirmedBalance?.(confirmedBalance.availableCoins);
      setStatus("ready");
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "The rewards wallet could not be loaded.");
      setStatus("error");
    }
  }, [onConfirmedBalance]);

  useEffect(() => {
    void refreshRewardsWallet();
  }, [refreshRewardsWallet]);

  return (
    <main className="rewards-wallet-page">
      <header className="wallet-page-heading workspace-page-heading">
        <div>
          <h1>Rewards Wallet</h1>
          <p className="workspace-page-tagline">See your HU Coin balance, earnings, and redemptions in one place.</p>
        </div>
        <Button onClick={() => void refreshRewardsWallet()} disabled={status === "loading"}>
          Refresh
        </Button>
      </header>

      {status === "loading" && <p className="wallet-status">Loading your confirmed rewards…</p>}
      {status === "error" && (
        <section className="wallet-error-state" role="alert">
          <strong>Rewards are unavailable.</strong>
          <p>{failure}</p>
          <Button size="small" onClick={() => void refreshRewardsWallet()}>Try again</Button>
        </section>
      )}
      {status === "ready" && (
        <>
          <RewardBalance balance={balance} />
          <RewardRedemption
            availableCoins={balance.availableCoins}
            onOpenMarketplace={onOpenMarketplace}
          />
          <RewardLedger entries={entries} account={account} />
        </>
      )}
    </main>
  );
}
