import { Button } from "../../../components/ui/Button";

export interface MessageAttachmentPreviewProps {
  file: File;
  onRemove: () => void;
}

export function MessageAttachmentPreview({ file, onRemove }: MessageAttachmentPreviewProps) {
  return (
    <div className="dm-attachment-preview">
      <div>
        <strong>{file.name}</strong>
        <span>{Math.max(1, Math.round(file.size / 1024))} KB</span>
      </div>
      <Button size="small" variant="ghost" onClick={onRemove}>Remove</Button>
    </div>
  );
}
