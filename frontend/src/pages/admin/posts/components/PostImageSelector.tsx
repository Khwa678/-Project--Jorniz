import { useRef } from "react";
import { FileVideo2, ImagePlus, LoaderCircle, Pencil } from "lucide-react";
import type { AdminPost } from "../types";

const MAX_MEDIA_BYTES = 25 * 1024 * 1024;

export interface PostImageSelectorProps {
  post: AdminPost;
  busy: boolean;
  editable: boolean;
  onReplace: (file: File) => Promise<void> | void;
  onError: (message: string) => void;
}

export function PostImageSelector({ post, busy, editable, onReplace, onError }: PostImageSelectorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasMedia = Boolean(post.media_url);
  const isVideo = post.media_type?.startsWith("video") || post.media_type === "video";

  function selectFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      onError("Choose an image or video file.");
      return;
    }
    if (file.size > MAX_MEDIA_BYTES) {
      onError("Post media must be 25 MB or smaller.");
      return;
    }
    void onReplace(file);
  }

  return (
    <button
      type="button"
      className="admin-post-media-selector"
      disabled={busy || !editable}
      onClick={() => inputRef.current?.click()}
      aria-label={editable ? hasMedia ? `Replace media for ${post.title}` : `Add media to ${post.title}` : `Media for ${post.title}`}
      title={editable ? hasMedia ? "Replace media" : "Add media" : "Post media"}
    >
      {post.media_url && !isVideo ? <img src={post.media_url} alt="" /> : null}
      {post.media_url && isVideo ? <FileVideo2 size={22} aria-hidden="true" /> : null}
      {!post.media_url ? <ImagePlus size={21} aria-hidden="true" /> : null}
      {editable ? (
        <span className="admin-post-media-overlay" aria-hidden="true">
          {busy ? <LoaderCircle size={17} /> : hasMedia ? <Pencil size={16} /> : <ImagePlus size={17} />}
        </span>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = "";
          selectFile(file);
        }}
      />
    </button>
  );
}
