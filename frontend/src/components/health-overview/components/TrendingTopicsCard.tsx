export interface TrendingHealthTopic {
  id: string;
  label: string;
  participationCount?: number;
}

export interface TrendingTopicsCardProps {
  topics: TrendingHealthTopic[];
  onOpenTopic?: (topic: TrendingHealthTopic) => void;
}

export function TrendingTopicsCard({ topics, onOpenTopic }: TrendingTopicsCardProps) {
  return (
    <section className="health-overview-card">
      <h2>Trending today</h2>
      {topics.length === 0 ? (
        <p className="overview-empty-state">No live trending topics are available.</p>
      ) : (
        <div className="trending-health-topic-list">
          {topics.map((topic) => (
            <button
              type="button"
              onClick={() => onOpenTopic?.(topic)}
              disabled={!onOpenTopic}
              key={topic.id}
            >
              <strong>{topic.label}</strong>
              <span>
                {typeof topic.participationCount === "number"
                  ? topic.participationCount.toLocaleString()
                  : "Count unavailable"}
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
