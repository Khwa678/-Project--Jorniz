import { useEffect, useState } from "react";
import { Button } from "../../ui/Button";

export interface PostMediaPickerProps { selectedFile: File | null; existingMediaUrl?: string; existingMediaType?: string; removeExistingMedia: boolean; onFileChange: (file: File | null) => void; onRemoveExistingMediaChange: (remove: boolean) => void; }
export function PostMediaPicker({ selectedFile, existingMediaUrl, existingMediaType, removeExistingMedia, onFileChange, onRemoveExistingMediaChange }: PostMediaPickerProps) {
  const [previewUrl, setPreviewUrl] = useState("");
  useEffect(() => { if (!selectedFile) { setPreviewUrl(""); return; } const nextUrl = URL.createObjectURL(selectedFile); setPreviewUrl(nextUrl); return () => URL.revokeObjectURL(nextUrl); }, [selectedFile]);
  const visibleUrl = previewUrl || (!removeExistingMedia ? existingMediaUrl : "");
  const visibleType = selectedFile?.type.startsWith("video/") ? "video" : selectedFile ? "image" : existingMediaType;
  return <div className="post-media-picker"><label><span>Image or video</span><input type="file" accept="image/*,video/*" onChange={(event) => { onFileChange(event.target.files?.[0] ?? null); onRemoveExistingMediaChange(false); }} /></label>{visibleUrl ? visibleType === "video" ? <video src={visibleUrl} controls /> : <img src={visibleUrl} alt="Selected post media" /> : <p>No media selected.</p>}{existingMediaUrl && !selectedFile ? <Button variant="secondary" size="small" onClick={() => onRemoveExistingMediaChange(!removeExistingMedia)}>{removeExistingMedia ? "Keep existing media" : "Remove existing media"}</Button> : null}</div>;
}
