import { useState, type FormEvent } from "react";
import { HealthGuidanceFlow } from "./HealthGuidanceFlow";
import type { HealthGuidanceTopic, HealthGuidanceTopicId } from "../content/healthGuidanceContent";

export interface HealthAssistantDialogProps {
  selectedTopicId: HealthGuidanceTopicId | null;
  question: string;
  scriptedAnswer: string;
  onSelectTopic: (topic: HealthGuidanceTopic) => void;
  onSubmitQuestion: (question: string) => void;
  onRestart: () => void;
  onClose: () => void;
}

export function HealthAssistantDialog({
  selectedTopicId,
  question,
  scriptedAnswer,
  onSelectTopic,
  onSubmitQuestion,
  onRestart,
  onClose,
}: HealthAssistantDialogProps) {
  const [draftQuestion, setDraftQuestion] = useState("");

  function submitQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = draftQuestion.trim();
    if (!trimmed) return;
    onSubmitQuestion(trimmed);
    setDraftQuestion("");
  }

  return (
    <section className="health-assistant-dialog" role="dialog" aria-modal="false" aria-labelledby="health-assistant-title">
      <header>
        <div>
          <strong id="health-assistant-title">Jorniz Health Guide</strong>
          <small>Scripted client-side prototype</small>
        </div>
        <div>
          <button type="button" onClick={onRestart}>Restart</button>
          <button type="button" onClick={onClose} aria-label="Close health guide">X</button>
        </div>
      </header>
      <p className="health-assistant-disclaimer">
        General information only. This is not an AI clinician, diagnosis, or emergency service.
      </p>
      <div className="health-assistant-conversation">
        <p>Choose a guided topic or enter a question to receive limited scripted guidance.</p>
        <HealthGuidanceFlow selectedTopicId={selectedTopicId} onSelectTopic={onSelectTopic} />
        {question && scriptedAnswer && (
          <div className="scripted-question-answer">
            <p><strong>You:</strong> {question}</p>
            <p><strong>Scripted guide:</strong> {scriptedAnswer}</p>
          </div>
        )}
      </div>
      <form className="health-assistant-question" onSubmit={submitQuestion}>
        <label htmlFor="health-assistant-question">Ask a general question</label>
        <div>
          <input
            id="health-assistant-question"
            value={draftQuestion}
            onChange={(event) => setDraftQuestion(event.target.value)}
            placeholder="This prototype uses keyword-based guidance"
          />
          <button type="submit" disabled={!draftQuestion.trim()}>Send</button>
        </div>
      </form>
    </section>
  );
}
