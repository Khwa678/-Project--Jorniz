import { useEffect, useState, type FormEvent } from "react";
import { ChevronDown, X } from "lucide-react";
import { Dialog, Select, ToggleGroup } from "radix-ui";
import { Button } from "../ui/Button";
import { PostMediaPicker } from "./components/PostMediaPicker";
import { createPost } from "./api/createPost";
import { updatePost } from "./api/updatePost";
import type { EditablePost, PostWriteResult } from "./types";
import "./styles.css";

const postCategories = ["General Wellness", "Preventive Care", "Mental Wellness", "Nutrition", "Fitness", "Clinical Research"];
export interface PostEditorDialogProps { open: boolean; post?: EditablePost | null; onClose: () => void; onPostSaved: (post: PostWriteResult) => void; }
function describePostSaveFailure(error: unknown) { return error instanceof Error ? error.message : "The post could not be saved."; }
function cleanHashtag(value: string) { return value.trim().replace(/^#+/, "").replace(/\s+/g, "").slice(0, 50); }
function uniqueHashtags(values: string[]) { return values.filter((value, index) => value && index === values.findIndex((candidate) => candidate.toLowerCase() === value.toLowerCase())).slice(0, 10); }

export function PostEditorDialog({ open, post, onClose, onPostSaved }: PostEditorDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [hashtagValues, setHashtagValues] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState("");
  const [category, setCategory] = useState("General Wellness");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [removeMedia, setRemoveMedia] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(post?.title ?? "");
    setContent(post?.content ?? "");
    setHashtagValues((post?.hashtags ?? "").split(",").map(cleanHashtag).filter(Boolean));
    setHashtagInput("");
    setCategory(post?.category ?? "General Wellness");
    setMediaFile(null);
    setRemoveMedia(false);
    setError("");
  }, [open, post]);

  async function savePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("Add a title before saving the post.");
      return;
    }
    if (!content.trim()) {
      setError("Add a description before saving the post.");
      return;
    }
    setSaving(true);
    try {
      const pendingHashtag = cleanHashtag(hashtagInput);
      const hashtags = uniqueHashtags(pendingHashtag ? [...hashtagValues, pendingHashtag] : hashtagValues).join(",");
      const draft = { title, content, hashtags, category, mediaFile, removeMedia };
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
              <span>Title</span>
              <input type="text" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Give your post a clear title" maxLength={180} required />
            </label>
            <label>
              <span>Content</span>
              <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Share useful knowledge, an update, or a question" rows={6} maxLength={5000} required />
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
            <div className="post-editor-field">
              <label htmlFor="post-hashtag-input">Hashtags</label>
              <div className="post-hashtag-editor">
                {hashtagValues.length ? (
                  <ToggleGroup.Root className="post-hashtag-chips" type="multiple" value={hashtagValues} onValueChange={setHashtagValues} aria-label="Selected hashtags">
                    {hashtagValues.map((hashtag) => <ToggleGroup.Item className="post-hashtag-chip" key={hashtag} value={hashtag} aria-label={`Remove #${hashtag}`}>#{hashtag}<X size={13} aria-hidden="true" /></ToggleGroup.Item>)}
                  </ToggleGroup.Root>
                ) : null}
                <input
                  id="post-hashtag-input"
                  type="text"
                  value={hashtagInput}
                  onChange={(event) => setHashtagInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "," || event.key === "Enter") {
                      event.preventDefault();
                      const hashtag = cleanHashtag(hashtagInput);
                      if (hashtag) setHashtagValues((current) => uniqueHashtags([...current, hashtag]));
                      setHashtagInput("");
                    } else if (event.key === "Backspace" && !hashtagInput && hashtagValues.length) {
                      setHashtagValues((current) => current.slice(0, -1));
                    }
                  }}
                  placeholder={hashtagValues.length ? "Add another" : "#HeartHealth, #HealthyHeart"}
                  maxLength={50}
                />
              </div>
              <small>Press comma to add a hashtag. Select a chip to remove it.</small>
            </div>
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
