import { useEffect, useState, type FormEvent } from "react";
import { ChevronDown, X } from "lucide-react";
import { Dialog, Select } from "radix-ui";
import { Button } from "../ui/Button";
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

  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="post-editor-backdrop" />
        <Dialog.Content className="post-editor-dialog">
          <header>
            <div>
              <p>{post ? "Edit post" : "Create post"}</p>
              <Dialog.Title asChild><h2 id="post-editor-title">{post ? "Update your post" : "Share with Jorniz"}</h2></Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <Button variant="secondary" size="small" aria-label="Close post editor"><X size={17} aria-hidden="true" /></Button>
            </Dialog.Close>
          </header>
          <Dialog.Description className="post-editor-description">Share text, an image, or a video with your Jorniz network.</Dialog.Description>
          <form onSubmit={savePost}>
            <label>
              <span>Post text</span>
              <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Share a healthcare insight" rows={7} />
            </label>
            <label>
              <span>Category</span>
              <Select.Root value={category} onValueChange={setCategory}>
                <Select.Trigger className="post-category-trigger" aria-label="Post category">
                  <Select.Value />
                  <Select.Icon><ChevronDown size={17} aria-hidden="true" /></Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className="post-category-menu" position="popper" sideOffset={5}>
                    <Select.Viewport>
                      {postCategories.map((value) => (
                        <Select.Item className="post-category-option" key={value} value={value}>
                          <Select.ItemText>{value}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </label>
            <PostMediaPicker selectedFile={mediaFile} existingMediaUrl={post?.media_url} existingMediaType={post?.media_type} removeExistingMedia={removeMedia} onFileChange={setMediaFile} onRemoveExistingMediaChange={setRemoveMedia} />
            {error ? <p className="post-editor-message post-editor-error">{error}</p> : null}
            <footer>
              <Dialog.Close asChild><Button variant="secondary">Cancel</Button></Dialog.Close>
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : post ? "Save changes" : "Publish post"}</Button>
            </footer>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
