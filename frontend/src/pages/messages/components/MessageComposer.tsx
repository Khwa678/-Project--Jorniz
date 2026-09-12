import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { MessageAttachmentPreview } from "./MessageAttachmentPreview";

export interface MessageComposerInput {
  content: string;
  file: File | null;
}

export interface MessageComposerProps {
  disabledReason?: string;
  isSending: boolean;
  onSend: (input: MessageComposerInput) => Promise<boolean>;
  onTyping?: () => void;
}

export function MessageComposer({ disabledReason, isSending, onSend, onTyping }: MessageComposerProps) {
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const submitMessage = async () => {
    if ((!content.trim() && !file) || disabledReason || isSending) return;
    const sent = await onSend({ content, file });
    if (sent) {
      setContent("");
      setFile(null);
    }
  };

  return (
    <div className="dm-composer">
      {file ? <MessageAttachmentPreview file={file} onRemove={() => setFile(null)} /> : null}
      {disabledReason ? <p className="dm-inline-notice">{disabledReason}</p> : null}
      <div className="dm-composer-row">
        <label className="dm-attach-button">
          Attach
          <input
            type="file"
            accept="image/*,video/*,audio/*"
            disabled={Boolean(disabledReason) || isSending}
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
        </label>
        <textarea
          aria-label="Message"
          disabled={Boolean(disabledReason) || isSending}
          onChange={(event) => {
            setContent(event.target.value);
            onTyping?.();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void submitMessage();
            }
          }}
          placeholder="Write a message"
          rows={2}
          value={content}
        />
        <Button
          disabled={Boolean(disabledReason) || isSending || (!content.trim() && !file)}
          onClick={() => void submitMessage()}
        >
          {isSending ? "Sending..." : "Send"}
        </Button>
      </div>
    </div>
  );
}
