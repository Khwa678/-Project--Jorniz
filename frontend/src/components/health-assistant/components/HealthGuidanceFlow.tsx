import {
  healthGuidanceTopics,
  type HealthGuidanceTopic,
  type HealthGuidanceTopicId,
} from "../content/healthGuidanceContent";

export interface HealthGuidanceFlowProps {
  selectedTopicId: HealthGuidanceTopicId | null;
  onSelectTopic: (topic: HealthGuidanceTopic) => void;
}

export function HealthGuidanceFlow({
  selectedTopicId,
  onSelectTopic,
}: HealthGuidanceFlowProps) {
  const selectedTopic = healthGuidanceTopics.find((topic) => topic.id === selectedTopicId);

  return (
    <section className="health-guidance-flow">
      <div className="health-guidance-topic-list">
        {healthGuidanceTopics.map((topic) => (
          <button
            type="button"
            className={selectedTopicId === topic.id ? "active" : ""}
            onClick={() => onSelectTopic(topic)}
            key={topic.id}
          >
            <strong>{topic.title}</strong>
            <span>{topic.summary}</span>
          </button>
        ))}
      </div>
      {selectedTopic && (
        <article className="selected-health-guidance">
          <h3>{selectedTopic.title}</h3>
          {selectedTopic.guidance.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </article>
      )}
    </section>
  );
}
