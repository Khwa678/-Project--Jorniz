import { useEffect, useState, type FormEvent } from "react";
import { ChevronDown, X } from "lucide-react";
import { Dialog, Select } from "radix-ui";
import { PostMediaPicker } from "../../../../components/post-editor";
import { Button } from "../../../../components/ui/Button";
import { getUsers } from "../../api/users";
import type { AdminUser } from "../../types";
import { addPost } from "../api/posts";
import { POST_CATEGORY_OPTIONS, type AdminPost } from "../types";

export interface AdminPostCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (post: AdminPost) => void;
}

function compactId(userId: string) {
  return userId.length > 8 ? `${userId.slice(0, 8)}…` : userId;
}

export function AdminPostCreateDialog({ open, onClose, onCreated }: AdminPostCreateDialogProps) {
  const [userSearch, setUserSearch] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [category, setCategory] = useState<string>(POST_CATEGORY_OPTIONS[0]);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setUserSearch("");
    setUsers([]);
    setSelectedUser(null);
    setTitle("");
    setContent("");
    setHashtags("");
    setCategory(POST_CATEGORY_OPTIONS[0]);
    setMediaFile(null);
    setSaving(false);
    setError("");
  }, [open]);

  useEffect(() => {
    const query = userSearch.trim();
    if (!open || selectedUser || !query) {
      setUsers([]);
      setLoadingUsers(false);
      return;
    }
    let active = true;
    const timer = window.setTimeout(() => {
      setLoadingUsers(true);
      getUsers({ q: query, page: 1, page_size: 10, sort: "name", direction: "asc" })
        .then((result) => { if (active) setUsers(result.items); })
        .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Users could not be searched."); })
        .finally(() => { if (active) setLoadingUsers(false); });
    }, 200);
    return () => { active = false; window.clearTimeout(timer); };
  }, [open, selectedUser, userSearch]);

  async function createPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedUser) {
      setError("Select the user who will publish this post.");
      return;
    }
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const post = await addPost({
        creator_user_id: selectedUser.id,
        title: title.trim(),
        content: content.trim(),
        hashtags: hashtags.trim(),
        category,
      }, mediaFile ?? undefined);
      onCreated(post);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The post could not be created.");
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
            <div><Dialog.Title>Create post</Dialog.Title><Dialog.Description>Choose the Jorniz user who will appear as the author.</Dialog.Description></div>
            <Dialog.Close asChild><Button size="small" variant="ghost" disabled={saving} aria-label="Close create post form"><X size={17} /></Button></Dialog.Close>
          </header>
          <form className="admin-post-editor-form" onSubmit={createPost}>
            <div className="admin-post-creator-picker">
              <span>Post as</span>
              {selectedUser ? (
                <div className="admin-post-selected-creator" title={`Full user ID: ${selectedUser.id}`}>
                  <div><strong>{selectedUser.name}</strong><small>{selectedUser.email} · ID {compactId(selectedUser.id)}</small></div>
                  <Button type="button" size="small" variant="secondary" disabled={saving} onClick={() => setSelectedUser(null)}>Change</Button>
                </div>
              ) : (
                <>
                  <input value={userSearch} onChange={(event) => { setUserSearch(event.target.value); setError(""); }} placeholder="Search name, email, or ID" autoComplete="off" disabled={saving} />
                  {loadingUsers ? <small className="admin-post-creator-status">Searching users…</small> : null}
                  {userSearch.trim() && !loadingUsers ? (
                    <div className="admin-post-creator-results" role="listbox" aria-label="Matching users">
                      {users.length ? users.map((user) => (
                        <button key={user.id} type="button" className="admin-post-creator-option" title={`Full user ID: ${user.id}`} onClick={() => { setSelectedUser(user); setError(""); }}>
                          <strong>{user.name}</strong><span>{user.email} · ID {compactId(user.id)}</span>
                        </button>
                      )) : <p>No matching users.</p>}
                    </div>
                  ) : null}
                </>
              )}
            </div>
            <label><span>Title</span><input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={180} required disabled={saving} /></label>
            <label><span>Content</span><textarea value={content} onChange={(event) => setContent(event.target.value)} rows={6} maxLength={5000} required disabled={saving} /></label>
            <label><span>Hashtags</span><input value={hashtags} onChange={(event) => setHashtags(event.target.value)} placeholder="HeartHealth, HealthyHeart" disabled={saving} /></label>
            <label>
              <span>Category</span>
              <Select.Root value={category} onValueChange={setCategory} disabled={saving}>
                <Select.Trigger className="post-category-trigger"><Select.Value /><Select.Icon><ChevronDown size={17} /></Select.Icon></Select.Trigger>
                <Select.Portal><Select.Content className="post-category-menu" position="popper" sideOffset={5}><Select.Viewport>{POST_CATEGORY_OPTIONS.map((value) => <Select.Item className="post-category-option" key={value} value={value}><Select.ItemText>{value}</Select.ItemText></Select.Item>)}</Select.Viewport></Select.Content></Select.Portal>
              </Select.Root>
            </label>
            <PostMediaPicker selectedFile={mediaFile} removeExistingMedia={false} onFileChange={setMediaFile} onRemoveExistingMediaChange={() => undefined} />
            {error ? <p className="admin-form-error" role="alert">{error}</p> : null}
            <footer className="admin-dialog-actions"><Button type="button" variant="secondary" disabled={saving} onClick={onClose}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Creating..." : "Create post"}</Button></footer>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
