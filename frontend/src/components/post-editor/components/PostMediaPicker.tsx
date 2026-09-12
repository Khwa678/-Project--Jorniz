import { useEffect, useState } from "react";
import { ImagePlus, Trash2, Undo2 } from "lucide-react";
import { Button } from "../../ui/Button";

export interface PostMediaPickerProps { selectedFile: File | null; existingMediaUrl?: string; existingMediaType?: string; removeExistingMedia: boolean; onFileChange: (file: File | null) => void; onRemoveExistingMediaChange: (remove: boolean) => void; }
export function PostMediaPicker({ selectedFile, existingMediaUrl, existingMediaType, removeExistingMedia, onFileChange, onRemoveExistingMediaChange }: PostMediaPickerProps) {
  const [previewUrl, setPreviewUrl] = useState("");
  useEffect(() => { if (!selectedFile) { setPreviewUrl(""); return; } const nextUrl = URL.createObjectURL(selectedFile); setPreviewUrl(nextUrl); return () => URL.revokeObjectURL(nextUrl); }, [selectedFile]);
  const visibleUrl = previewUrl || (!removeExistingMedia ? existingMediaUrl : "");
  const visibleType = selectedFile?.type.startsWith("video/") ? "video" : selectedFile ? "image" : existingMediaType;
  const actionLabel = selectedFile ? "Remove selected media" : removeExistingMedia ? "Restore existing media" : "Remove existing media";

  function changeMedia(file: File | null) {
    onFileChange(file);
    if (file) onRemoveExistingMediaChange(false);
  }

  function toggleMedia() {
    if (selectedFile) changeMedia(null);
    else onRemoveExistingMediaChange(!removeExistingMedia);
  }

  return (
    <div className="post-media-picker">
      <div className="post-media-heading">
        <strong>Image or video</strong>
        <small>Optional. Add one file to support your post.</small>
      </div>
      <label className="post-media-upload-control">
        <ImagePlus size={18} aria-hidden="true" />
        <span>{selectedFile?.name || "Choose image or video"}</span>
        <input className="post-media-file-input" type="file" accept="image/*,video/*" onChange={(event) => changeMedia(event.target.files?.[0] ?? null)} />
      </label>
      {visibleUrl ? visibleType === "video" ? <video src={visibleUrl} controls /> : <img src={visibleUrl} alt="Selected post media preview" /> : <p>No media selected.</p>}
      {selectedFile || existingMediaUrl ? (
        <Button type="button" variant="secondary" size="small" onClick={toggleMedia}>
          {removeExistingMedia ? <Undo2 size={15} aria-hidden="true" /> : <Trash2 size={15} aria-hidden="true" />}
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
