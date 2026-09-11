import { useEffect, useState, type FormEvent } from "react";
import { PostMediaPicker } from "./components/PostMediaPicker";
import { createPost } from "./api/createPost";
import { updatePost } from "./api/updatePost";
import type { EditablePost, PostWriteResult } from "./types";
import "./styles.css";

const postCategories = ["General Wellness", "Preventive Care", "Mental Wellness", "Nutrition", "Fitness", "Clinical Research"];
export interface PostEditorDialogProps { open: boolean; post?: EditablePost | null; onClose: () => void; onPostSaved: (post: PostWriteResult) => void; }
function describePostSaveFailure(error: unknown) { return error instanceof Error ? error.message : "The post could not be saved."; }

export function PostEditorDialog({ open, post, onClose, onPostSaved }: PostEditorDialogProps) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General Wellness");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [removeMedia, setRemoveMedia] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setContent(post?.content ?? "");
    setCategory(post?.category ?? "General Wellness");
    setMediaFile(null);
    setRemoveMedia(false);
    setError("");
  }, [open, post]);

  if (!open) return null;

  async function savePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const existingMediaRemains = Boolean(post?.media_url && !removeMedia);
    if (!content.trim() && !mediaFile && !existingMediaRemains) {
      setError("Add text or media before saving the post.");
      return;
    }

    setSaving(true);
    try {
      const draft = { content, category, mediaFile, removeMedia };
      const result = post ? await updatePost(post.id, draft) : await createPost(draft);
      onPostSaved(result);
    } catch (saveError) {
      setError(describePostSaveFailure(saveError));
    } finally {
      setSaving(false);
    }
  }

  return <div className="post-editor-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="post-editor-dialog" role="dialog" aria-modal="true" aria-labelledby="post-editor-title"><header><div><p>{post ? "Edit post" : "Create post"}</p><h2 id="post-editor-title">{post ? "Update your post" : "Share with Jorniz"}</h2></div><button type="button" onClick={onClose} aria-label="Close post editor">Close</button></header><form onSubmit={savePost}><label><span>Post text</span><textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Share a healthcare insight" rows={7} /></label><label><span>Category</span><select value={category} onChange={(event) => setCategory(event.target.value)}>{postCategories.map((value) => <option key={value}>{value}</option>)}</select></label><PostMediaPicker selectedFile={mediaFile} existingMediaUrl={post?.media_url} existingMediaType={post?.media_type} removeExistingMedia={removeMedia} onFileChange={setMediaFile} onRemoveExistingMediaChange={setRemoveMedia} />{error ? <p className="post-editor-message post-editor-error">{error}</p> : null}<footer><button type="button" onClick={onClose}>Cancel</button><button type="submit" disabled={saving}>{saving ? "Saving..." : post ? "Save changes" : "Publish post"}</button></footer></form></section></div>;
}
