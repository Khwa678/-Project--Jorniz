import { useState, type FormEvent } from "react";
import { Bot, RotateCcw, Send, TriangleAlert, X } from "lucide-react";
import { Dialog } from "radix-ui";
import { Button } from "../../ui/Button";
import { HealthGuidanceFlow } from "./HealthGuidanceFlow";
import type { HealthGuidanceTopic, HealthGuidanceTopicId } from "../content/healthGuidanceContent";

export interface HealthAssistantDialogProps {
  selectedTopicId: HealthGuidanceTopicId | null;
  question: string;
  assistantReply: string;
  onSelectTopic: (topic: HealthGuidanceTopic) => void;
  onSubmitQuestion: (question: string) => void;
  onRestart: () => void;
}

export function HealthAssistantDialog({
  selectedTopicId,
  question,
  assistantReply,
  onSelectTopic,
  onSubmitQuestion,
  onRestart,
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
    <Dialog.Portal>
      <Dialog.Content className="health-assistant-dialog" onOpenAutoFocus={(event) => event.preventDefault()}>
        <header>
          <div className="health-assistant-identity">
            <span className="health-assistant-header-avatar" aria-hidden="true"><Bot /></span>
            <div>
              <Dialog.Title asChild><strong id="health-assistant-title">HU Health Assistant</strong></Dialog.Title>
              <small><span aria-hidden="true" />Always available</small>
            </div>
          </div>
          <div className="health-assistant-header-actions">
            <Button variant="ghost" size="small" onClick={onRestart} aria-label="Restart health assistant" title="Restart">
              <RotateCcw aria-hidden="true" />
            </Button>
            <Dialog.Close asChild>
              <Button variant="ghost" size="small" aria-label="Close health assistant" title="Close">
                <X aria-hidden="true" />
              </Button>
            </Dialog.Close>
          </div>
        </header>

        <Dialog.Description asChild>
          <p className="health-assistant-disclaimer">
            <TriangleAlert aria-hidden="true" />
            <span>General health information only - not medical advice.</span>
          </p>
        </Dialog.Description>

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
            <Button type="submit" disabled={!draftQuestion.trim()} aria-label="Send question" title="Send question">
              <Send aria-hidden="true" />
            </Button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Portal>
  );
}
