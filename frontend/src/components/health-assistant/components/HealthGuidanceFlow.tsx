import {
  healthGuidanceTopics,
  type HealthGuidanceTopic,
  type HealthGuidanceTopicId,
} from "../content/healthGuidanceContent";

export interface HealthGuidanceFlowProps {
  selectedTopicId: HealthGuidanceTopicId | null;
  onSelectTopic: (topic: HealthGuidanceTopic) => void;
}

const topicIcons: Record<HealthGuidanceTopicId, string> = {
  "check-symptoms": "🩺",
  "heart-health": "❤️",
  "mental-wellness": "🧠",
  nutrition: "🥗",
  medications: "💊",
  "find-doctor": "🧑‍⚕️",
  emergency: "🚨",
};

export function HealthGuidanceFlow({ selectedTopicId, onSelectTopic }: HealthGuidanceFlowProps) {
  return (
    <div className="health-guidance-topic-list" aria-label="Health guidance topics">
      {healthGuidanceTopics.map((topic) => {
        return (
          <button
            type="button"
            className={selectedTopicId === topic.id ? "active" : ""}
            aria-pressed={selectedTopicId === topic.id}
            onClick={() => onSelectTopic(topic)}
            key={topic.id}
          >
            <span className="health-guidance-topic-icon" aria-hidden="true">{topicIcons[topic.id]}</span>
            <span>{topic.title}</span>
          </button>
        );
      })}
    </div>
  );
}
