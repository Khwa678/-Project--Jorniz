import type { ReactNode } from "react";
import { Tabs } from "radix-ui";
import type { FeedAudience } from "../types";

const feedChoices: ReadonlyArray<{ value: FeedAudience; label: string }> = [
  { value: "for-you", label: "For You" },
  { value: "following", label: "Following" },
  { value: "trending", label: "Trending" },
];

export interface FeedAudienceTabsProps {
  action?: ReactNode;
  children: ReactNode;
  selectedAudience: FeedAudience;
  onAudienceChange: (audience: FeedAudience) => void;
}

export function FeedAudienceTabs({ action, children, selectedAudience, onAudienceChange }: FeedAudienceTabsProps) {
  return (
    <Tabs.Root value={selectedAudience} onValueChange={(value) => onAudienceChange(value as FeedAudience)}>
      <div className="home-feed-controls">
        <Tabs.List className="feed-audience-tabs" aria-label="Home feed">
          {feedChoices.map((choice) => (
            <Tabs.Trigger className="feed-audience-tab" key={choice.value} value={choice.value}>
              {choice.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {action}
      </div>
      {feedChoices.map((choice) => (
        <Tabs.Content className="feed-audience-content" key={choice.value} value={choice.value}>
          {selectedAudience === choice.value ? children : null}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
