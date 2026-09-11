import { useState } from "react";
import { HealthAssistantButton } from "./components/HealthAssistantButton";
import { HealthAssistantDialog } from "./components/HealthAssistantDialog";
import {
  requestHealthAssistantReply,
  type HealthGuidanceTopic,
  type HealthGuidanceTopicId,
} from "./content/healthGuidanceContent";
import "./styles.css";

const ASSISTANT_CLOSE_ANIMATION_MS = 180;

export function HealthAssistant() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [notificationCount, setNotificationCount] = useState(1);
  const [selectedTopicId, setSelectedTopicId] = useState<HealthGuidanceTopicId | null>(null);
  const [question, setQuestion] = useState("");
  const [assistantReply, setAssistantReply] = useState("");

  async function showHealthGuidance(topic: HealthGuidanceTopic) {
    setSelectedTopicId(topic.id);
    setQuestion("");
    setAssistantReply(await requestHealthAssistantReply({ topicId: topic.id }));
  }

  async function submitHealthQuestion(nextQuestion: string) {
    setSelectedTopicId(null);
    setQuestion(nextQuestion);
    setAssistantReply(await requestHealthAssistantReply({ question: nextQuestion }));
  }

  function restartHealthAssistant() {
    setSelectedTopicId(null);
    setQuestion("");
    setAssistantReply("");
  }

  function openHealthAssistant() {
    setClosing(false);
    setOpen(true);
    setNotificationCount(0);
  }

  function closeHealthAssistant() {
    setClosing(true);
    window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, ASSISTANT_CLOSE_ANIMATION_MS);
  }

  return (
    <div className="health-assistant">
      {!open && <HealthAssistantButton notificationCount={notificationCount} onOpen={openHealthAssistant} />}
      {open && (
        <HealthAssistantDialog
          closing={closing}
          selectedTopicId={selectedTopicId}
          question={question}
          assistantReply={assistantReply}
          onSelectTopic={(topic) => void showHealthGuidance(topic)}
          onSubmitQuestion={(nextQuestion) => void submitHealthQuestion(nextQuestion)}
          onRestart={restartHealthAssistant}
          onClose={closeHealthAssistant}
        />
      )}
    </div>
  );
}
