import { useState, type FormEvent } from "react";
import { Bot, RotateCcw, Send, TriangleAlert, X } from "lucide-react";
import { HealthGuidanceFlow } from "./HealthGuidanceFlow";
import type { HealthGuidanceTopic, HealthGuidanceTopicId } from "../content/healthGuidanceContent";

export interface HealthAssistantDialogProps {
  closing: boolean;
  selectedTopicId: HealthGuidanceTopicId | null;
  question: string;
  assistantReply: string;
  onSelectTopic: (topic: HealthGuidanceTopic) => void;
  onSubmitQuestion: (question: string) => void;
  onRestart: () => void;
  onClose: () => void;
}

export function HealthAssistantDialog({
  closing,
  selectedTopicId,
  question,
  assistantReply,
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
    <section className={`health-assistant-dialog${closing ? " is-closing" : ""}`} role="dialog" aria-modal="false" aria-labelledby="health-assistant-title">
      <header>
        <div className="health-assistant-identity">
          <span className="health-assistant-header-avatar" aria-hidden="true"><Bot /></span>
          <div>
            <strong id="health-assistant-title">HU Health Assistant</strong>
            <small><span aria-hidden="true" />Always available</small>
          </div>
        </div>
        <div className="health-assistant-header-actions">
          <button type="button" onClick={onRestart} aria-label="Restart health assistant" title="Restart">
            <RotateCcw aria-hidden="true" />
          </button>
          <button type="button" onClick={onClose} aria-label="Close health assistant" title="Close">
            <X aria-hidden="true" />
          </button>
        </div>
      </header>

      <p className="health-assistant-disclaimer">
        <TriangleAlert aria-hidden="true" />
        <span>General health information only - not medical advice.</span>
      </p>

      <div className="health-assistant-conversation">
        <div className="health-assistant-message-row">
          <span className="health-assistant-message-avatar" aria-hidden="true"><Bot /></span>
          <div className="health-assistant-message-bubble">
            <p>Hi! I&apos;m your <strong>HU Health Assistant.</strong></p>
            <p>I can help with symptoms, health tips, medications, and more.</p>
            <p><strong>What can I help you with today?</strong></p>
          </div>
        </div>

        <HealthGuidanceFlow selectedTopicId={selectedTopicId} onSelectTopic={onSelectTopic} />

        {assistantReply && (
          <div className="health-assistant-message-row health-assistant-reply" aria-live="polite">
            <span className="health-assistant-message-avatar" aria-hidden="true"><Bot /></span>
            <div className="health-assistant-message-bubble">
              {question && <small>{question}</small>}
              <p>{assistantReply}</p>
            </div>
          </div>
        )}
      </div>

      <form className="health-assistant-question" onSubmit={submitQuestion}>
        <div>
          <input
            id="health-assistant-question"
            value={draftQuestion}
            onChange={(event) => setDraftQuestion(event.target.value)}
            placeholder="Ask about symptoms, diet, medications..."
            aria-label="Ask the health assistant a general question"
          />
          <button type="submit" disabled={!draftQuestion.trim()} aria-label="Send question" title="Send question">
            <Send aria-hidden="true" />
          </button>
        </div>
      </form>
    </section>
  );
}
