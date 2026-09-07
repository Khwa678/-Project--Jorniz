import { useState } from "react";
import { HealthAssistantButton } from "./components/HealthAssistantButton";
import { HealthAssistantDialog } from "./components/HealthAssistantDialog";
import {
  answerScriptedHealthQuestion,
  type HealthGuidanceTopic,
  type HealthGuidanceTopicId,
} from "./content/healthGuidanceContent";
import "./styles.css";

export function HealthAssistant() {
  const [open, setOpen] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<HealthGuidanceTopicId | null>(null);
  const [question, setQuestion] = useState("");
  const [scriptedAnswer, setScriptedAnswer] = useState("");

  function showHealthGuidance(topic: HealthGuidanceTopic) {
    setSelectedTopicId(topic.id);
    setQuestion("");
    setScriptedAnswer("");
  }

  function submitScriptedHealthQuestion(nextQuestion: string) {
    setQuestion(nextQuestion);
    setScriptedAnswer(answerScriptedHealthQuestion(nextQuestion));
  }

  function restartHealthAssistant() {
    setSelectedTopicId(null);
    setQuestion("");
    setScriptedAnswer("");
  }

  return (
    <div className="health-assistant">
      {!open && <HealthAssistantButton onOpen={() => setOpen(true)} />}
      {open && (
        <HealthAssistantDialog
          selectedTopicId={selectedTopicId}
          question={question}
          scriptedAnswer={scriptedAnswer}
          onSelectTopic={showHealthGuidance}
          onSubmitQuestion={submitScriptedHealthQuestion}
          onRestart={restartHealthAssistant}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
