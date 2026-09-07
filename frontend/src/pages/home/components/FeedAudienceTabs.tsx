import type { FeedAudience } from "../types";

const feedChoices: ReadonlyArray<{ value: FeedAudience; label: string }> = [
  { value: "for-you", label: "For You" },
  { value: "following", label: "Following" },
  { value: "trending", label: "Trending" },
];

export interface FeedAudienceTabsProps {
  selectedAudience: FeedAudience;
  onAudienceChange: (audience: FeedAudience) => void;
}

export function FeedAudienceTabs({ selectedAudience, onAudienceChange }: FeedAudienceTabsProps) {
  return (
    <div className="feed-audience-tabs" role="tablist" aria-label="Home feed">
      {feedChoices.map((choice) => (
        <button
          key={choice.value}
          type="button"
          role="tab"
          aria-selected={selectedAudience === choice.value}
          className={selectedAudience === choice.value ? "active" : ""}
          onClick={() => onAudienceChange(choice.value)}
        >
          {choice.label}
        </button>
      ))}
    </div>
  );
}
