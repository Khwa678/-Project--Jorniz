import { useEffect, useState, type FormEvent } from "react";
import { ChevronDown, X } from "lucide-react";
import { Dialog, Select } from "radix-ui";
import { PostMediaPicker } from "../../../../components/post-editor";
import { Button } from "../../../../components/ui/Button";
import { removePostMedia, replacePostMedia, updatePosts } from "../api/posts";
import { POST_CATEGORY_OPTIONS, type AdminPost } from "../types";

export interface AdminPostEditorDialogProps {
  open: boolean;
  post: AdminPost | null;
  onClose: () => void;
  onSaved: (post: AdminPost, warning?: string) => void;
}

export function AdminPostEditorDialog({ open, post, onClose, onSaved }: AdminPostEditorDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [category, setCategory] = useState<string>(POST_CATEGORY_OPTIONS[0]);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [removeMedia, setRemoveMedia] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !post) return;
    setTitle(post.title);
    setContent(post.content);
    setHashtags(post.hashtags ?? "");
    setCategory(post.category || POST_CATEGORY_OPTIONS[0]);
    setMediaFile(null);
    setRemoveMedia(false);
    setError("");
  }, [open, post]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!post) return;
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await updatePosts([{ id: post.id, title: title.trim(), content: content.trim(), hashtags: hashtags.trim(), category }]);
      let savedPost = response.posts.find((item) => item.id === post.id) ?? { ...post, title: title.trim(), content: content.trim(), hashtags: hashtags.trim(), category };
      let warning: string | undefined;
      if (mediaFile) {
        const mediaResult = await replacePostMedia(post.id, mediaFile);
        savedPost = mediaResult.post;
        warning = mediaResult.warning;
      } else if (removeMedia && post.media_url) {
        const mediaResult = await removePostMedia(post.id);
        savedPost = mediaResult.post;
        warning = mediaResult.warning;
      }
      onSaved(savedPost, warning);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The post could not be updated.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => { if (!nextOpen && !saving) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="admin-dialog-overlay" />
        <Dialog.Content className="admin-dialog-content admin-post-editor-dialog">
          <header className="admin-post-editor-header">
            <div><Dialog.Title>Edit post</Dialog.Title><Dialog.Description>Update this post's details and media.</Dialog.Description></div>
            <Dialog.Close asChild><Button size="small" variant="ghost" disabled={saving} aria-label="Close post editor"><X size={17} /></Button></Dialog.Close>
          </header>
          <form className="admin-post-editor-form" onSubmit={save}>
            <label><span>Title</span><input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={180} required /></label>
            <label><span>Content</span><textarea value={content} onChange={(event) => setContent(event.target.value)} rows={6} maxLength={5000} required /></label>
            <label><span>Hashtags</span><input value={hashtags} onChange={(event) => setHashtags(event.target.value)} placeholder="HeartHealth, HealthyHeart" /></label>
            <label>
              <span>Category</span>
              <Select.Root value={category} onValueChange={setCategory}>
                <Select.Trigger className="post-category-trigger"><Select.Value /><Select.Icon><ChevronDown size={17} /></Select.Icon></Select.Trigger>
                <Select.Portal><Select.Content className="post-category-menu" position="popper" sideOffset={5}><Select.Viewport>{POST_CATEGORY_OPTIONS.map((value) => <Select.Item className="post-category-option" key={value} value={value}><Select.ItemText>{value}</Select.ItemText></Select.Item>)}</Select.Viewport></Select.Content></Select.Portal>
              </Select.Root>
            </label>
            <PostMediaPicker selectedFile={mediaFile} existingMediaUrl={post?.media_url ?? undefined} existingMediaType={post?.media_type ?? undefined} removeExistingMedia={removeMedia} onFileChange={setMediaFile} onRemoveExistingMediaChange={setRemoveMedia} />
            {error ? <p className="admin-form-error" role="alert">{error}</p> : null}
            <footer className="admin-dialog-actions"><Button variant="secondary" disabled={saving} onClick={onClose}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button></footer>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
