import { HealthScoreCard } from "./components/HealthScoreCard";
import { RewardBalanceCard } from "./components/RewardBalanceCard";
import { SuggestedMembersCard, type SuggestedMember } from "./components/SuggestedMembersCard";
import { TrendingTopicsCard, type TrendingHealthTopic } from "./components/TrendingTopicsCard";
import "./styles.css";

export interface HealthOverviewPanelProps {
  confirmedCoins: number | null;
  rewardBalanceLoading?: boolean;
  suggestedMembers: SuggestedMember[];
  trendingTopics: TrendingHealthTopic[];
  onOpenWallet?: () => void;
  onOpenAllSuggestions?: () => void;
  onFollowSuggestedMember?: (memberId: string) => Promise<void>;
  onOpenTrendingTopic?: (topic: TrendingHealthTopic) => void;
}

export function HealthOverviewPanel({
  confirmedCoins,
  rewardBalanceLoading,
  suggestedMembers,
  trendingTopics,
  onOpenWallet,
  onOpenAllSuggestions,
  onFollowSuggestedMember,
  onOpenTrendingTopic,
}: HealthOverviewPanelProps) {
  return (
    <aside className="health-overview-panel" aria-label="Health and participation overview">
      <HealthScoreCard />
      <RewardBalanceCard
        confirmedCoins={confirmedCoins}
        loading={rewardBalanceLoading}
        onOpenWallet={onOpenWallet}
      />
      <SuggestedMembersCard
        members={suggestedMembers}
        onOpenAll={onOpenAllSuggestions}
        onFollow={onFollowSuggestedMember}
      />
      <TrendingTopicsCard topics={trendingTopics} onOpenTopic={onOpenTrendingTopic} />
    </aside>
  );
}
