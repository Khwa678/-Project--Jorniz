import { useState } from "react";
import { Dialog } from "radix-ui";
import { HealthAssistantButton } from "./components/HealthAssistantButton";
import { HealthAssistantDialog } from "./components/HealthAssistantDialog";
import {
  requestHealthAssistantReply,
  type HealthGuidanceTopic,
  type HealthGuidanceTopicId,
} from "./content/healthGuidanceContent";
import "./styles.css";

export function HealthAssistant() {
  const [open, setOpen] = useState(false);
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
    setOpen(true);
    setNotificationCount(0);
  }

  return (
    <div className="health-assistant">
      <Dialog.Root open={open} onOpenChange={(nextOpen) => nextOpen ? openHealthAssistant() : setOpen(false)} modal={false}>
        {!open ? (
          <Dialog.Trigger asChild>
            <HealthAssistantButton notificationCount={notificationCount} />
          </Dialog.Trigger>
        ) : null}
        <HealthAssistantDialog
          selectedTopicId={selectedTopicId}
          question={question}
          assistantReply={assistantReply}
          onSelectTopic={(topic) => void showHealthGuidance(topic)}
          onSubmitQuestion={(nextQuestion) => void submitHealthQuestion(nextQuestion)}
          onRestart={restartHealthAssistant}
        />
      </Dialog.Root>
    </div>
  );
}
