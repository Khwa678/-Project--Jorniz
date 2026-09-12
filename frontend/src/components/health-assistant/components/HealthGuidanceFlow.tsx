import { ToggleGroup } from "radix-ui";
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
  function selectTopic(topicId: string) {
    const topic = healthGuidanceTopics.find((candidate) => candidate.id === topicId);
    if (topic) onSelectTopic(topic);
  }

  return (
    <ToggleGroup.Root className="health-guidance-topic-list" type="single" value={selectedTopicId ?? ""} onValueChange={selectTopic} aria-label="Health guidance topics">
      {healthGuidanceTopics.map((topic) => {
        return (
          <ToggleGroup.Item
            value={topic.id}
            key={topic.id}
          >
            <span className="health-guidance-topic-icon" aria-hidden="true">{topicIcons[topic.id]}</span>
            <span>{topic.title}</span>
          </ToggleGroup.Item>
        );
      })}
    </ToggleGroup.Root>
  );
}
