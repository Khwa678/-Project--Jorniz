import { useEffect, useId, useState } from "react";
import { Camera, X } from "lucide-react";
import { Avatar } from "radix-ui";
import "./styles.css";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export interface ImageUploaderProps {
  currentImageUrl?: string;
  name: string;
  selectedFile: File | null;
  disabled?: boolean;
  onFileChange: (file: File | null) => void;
  onRemove: () => Promise<void>;
}

export function ImageUploader({ currentImageUrl, name, selectedFile, disabled = false, onFileChange, onRemove }: ImageUploaderProps) {
  const inputId = useId();
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const hasImage = Boolean(previewUrl || currentImageUrl);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return;
    }
    const nextPreviewUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(nextPreviewUrl);
    return () => URL.revokeObjectURL(nextPreviewUrl);
  }, [selectedFile]);

  function selectImage(file: File | null) {
    setError("");
    if (!file) {
      onFileChange(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Choose an image smaller than 5 MB.");
      return;
    }
    onFileChange(file);
  }

  async function removeImage() {
    setError("");
    try {
      await onRemove();
      onFileChange(null);
    } catch {
      // The settings page displays the server error.
    }
  }

  return <div className="image-uploader">
    <div className="image-uploader-preview">
      <label className={`image-uploader-control${disabled ? " disabled" : ""}`} htmlFor={inputId} title="Change profile image">
        <Avatar.Root className="image-uploader-avatar">
          {hasImage ? <Avatar.Image src={previewUrl || currentImageUrl} alt={`${name || "Profile"} avatar`} /> : null}
          <Avatar.Fallback className={hasImage ? "image-uploader-fallback" : "image-uploader-empty"}>
            {hasImage ? (name || "J").slice(0, 1).toUpperCase() : <><Camera size={24} /><span>Select photo</span></>}
          </Avatar.Fallback>
        </Avatar.Root>
        <input id={inputId} type="file" accept="image/jpeg,image/png,image/gif,image/webp" disabled={disabled} onChange={(event) => selectImage(event.target.files?.[0] ?? null)} />
      </label>
      {hasImage ? (
        <button className="image-uploader-remove" type="button" disabled={disabled} aria-label="Remove profile image" title="Remove profile image" onClick={() => void removeImage()}>
          <X size={16} />
        </button>
      ) : null}
    </div>
    <small>{hasImage ? "Click the photo to replace it." : "JPG, PNG, GIF or WebP up to 5 MB."}</small>
    {selectedFile ? <span className="image-uploader-file">{selectedFile.name}</span> : null}
    {error ? <span className="image-uploader-error" role="alert">{error}</span> : null}
  </div>;
}
