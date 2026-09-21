import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import { Toast } from "radix-ui";
import { Button } from "../../../../components/ui/Button";
import { deletePosts, getPosts, replacePostMedia, updatePosts } from "../api/posts";
import type { AdminPost, AdminPostDrafts, PostChanges, PostSortField, PostTrustStatus } from "../types";
import { type TableSortDirection } from "../../components/ResponsiveTable";
import { AdminPostEditorDialog } from "./AdminPostEditorDialog";
import { AdminPostCreateDialog } from "./AdminPostCreateDialog";
import { DeletePostsDialog } from "./DeletePostsDialog";
import { PostsTable } from "./PostsTable";
import { PostsToolbar } from "./PostsToolbar";

const PAGE_SIZE = 25;

export function PostsPanel({ canEdit }: { canEdit: boolean }) {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortColumn, setSortColumn] = useState<PostSortField>("created_at");
  const [sortDirection, setSortDirection] = useState<TableSortDirection>("descending");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [drafts, setDrafts] = useState<AdminPostDrafts>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [editingPost, setEditingPost] = useState<AdminPost | null>(null);
  const [creatingPost, setCreatingPost] = useState(false);
  const [mediaBusyIds, setMediaBusyIds] = useState<Set<string>>(new Set());
  const [toastOpen, setToastOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const showNotice = useCallback((message: string) => { setNotice(message); setToastOpen(false); window.setTimeout(() => setToastOpen(true), 0); }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { setDebouncedQuery(query.trim()); setPage(1); }, 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getPosts({ q: debouncedQuery, page, page_size: PAGE_SIZE, sort: sortColumn, direction: sortDirection === "ascending" ? "asc" : "desc" })
      .then((result) => {
        if (!active) return;
        setPosts(result.items);
        setTotal(result.total);
        setSelectedIds((current) => new Set([...current].filter((id) => result.items.some((post) => post.id === id))));
      })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Posts could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [debouncedQuery, page, refreshKey, sortColumn, sortDirection]);

  const updateDraft = useCallback((post: AdminPost, changes: PostChanges) => {
    setDrafts((current) => {
      const next = { ...current[post.id], ...changes };
      (Object.keys(next) as (keyof PostChanges)[]).forEach((key) => { if (next[key] === post[key]) delete next[key]; });
      if (!Object.keys(next).length) { const remaining = { ...current }; delete remaining[post.id]; return remaining; }
      return { ...current, [post.id]: next };
    });
  }, []);

  function applyBulk(changes: PostChanges) {
    posts.filter((post) => selectedIds.has(post.id)).forEach((post) => updateDraft(post, changes));
  }

  async function saveChanges() {
    const updates = Object.entries(drafts).map(([id, changes]) => ({ id, ...changes }));
    if (!updates.length) return;
    setSaving(true); setError("");
    try {
      const result = await updatePosts(updates);
      setPosts((current) => current.map((post) => result.posts.find((updated) => updated.id === post.id) ?? post));
      setDrafts({});
      showNotice(`${result.updated_count} ${result.updated_count === 1 ? "post" : "posts"} updated.`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Changes could not be saved."); }
    finally { setSaving(false); }
  }

  async function confirmDelete() {
    if (!pendingDeleteIds.length) return;
    setDeleting(true); setDeleteError("");
    try {
      const result = await deletePosts(pendingDeleteIds);
      setDeleteOpen(false); setPendingDeleteIds([]); setSelectedIds(new Set()); setDrafts({});
      showNotice(`${result.deleted_count} ${result.deleted_count === 1 ? "post" : "posts"} deleted.`);
      setRefreshKey((value) => value + 1);
    } catch (reason) { setDeleteError(reason instanceof Error ? reason.message : "Posts could not be deleted."); }
    finally { setDeleting(false); }
  }

  async function replaceMedia(post: AdminPost, file: File) {
    setMediaBusyIds((current) => new Set(current).add(post.id));
    setError("");
    try {
      const result = await replacePostMedia(post.id, file);
      setPosts((current) => current.map((item) => item.id === post.id ? result.post : item));
      showNotice(result.warning || "Post media updated.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Post media could not be updated."); }
    finally { setMediaBusyIds((current) => { const next = new Set(current); next.delete(post.id); return next; }); }
  }

  function copyId(value: string, label: string) {
    navigator.clipboard.writeText(value).then(() => showNotice(`${label} copied.`)).catch(() => setError(`${label} could not be copied.`));
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return (
    <Toast.Provider duration={3000} swipeDirection="right">
      <section className="admin-table-card">
        <PostsToolbar query={query} canEdit={canEdit} selectedCount={selectedIds.size} draftCount={Object.keys(drafts).length} saving={saving} deleting={deleting}
          onQueryChange={setQuery} onBulkTrust={(value: PostTrustStatus) => applyBulk({ trust_status: value })} onBulkCategory={(value) => applyBulk({ category: value })}
          onDeleteSelected={() => { setPendingDeleteIds([...selectedIds]); setDeleteError(""); setDeleteOpen(true); }} onCreatePost={() => setCreatingPost(true)} onSaveChanges={saveChanges} onCancelChanges={() => setDrafts({})} />
        {error ? <div className="admin-table-message admin-table-error" role="alert">{error}</div> : null}
        {loading ? <div className="admin-table-loading" role="status"><LoaderCircle size={22} /> Loading posts</div> : (
          <PostsTable posts={posts} canEdit={canEdit} drafts={drafts} selectedIds={selectedIds} sortColumn={sortColumn} sortDirection={sortDirection} mediaBusyIds={mediaBusyIds}
            onDraftChange={updateDraft} onSelectedIdsChange={setSelectedIds} onSortChange={(column, direction) => { setSortColumn(column); setSortDirection(direction); setPage(1); }}
            onCopy={copyId} onEdit={setEditingPost} onDelete={(post) => { setPendingDeleteIds([post.id]); setDeleteError(""); setDeleteOpen(true); }} onReplaceMedia={replaceMedia} onMediaError={setError} />
        )}
        <footer className="admin-pagination">
          <span>{total ? `${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, total)} of ${total}` : "0 posts"}</span>
          <div><Button size="small" variant="secondary" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)} aria-label="Previous posts page"><ChevronLeft size={16} /></Button><span>Page {page} of {totalPages}</span><Button size="small" variant="secondary" disabled={page >= totalPages || loading} onClick={() => setPage((value) => value + 1)} aria-label="Next posts page"><ChevronRight size={16} /></Button></div>
        </footer>
        <DeletePostsDialog open={deleteOpen} selectedCount={pendingDeleteIds.length} deleting={deleting} error={deleteError} onOpenChange={(open) => { setDeleteOpen(open); if (!open) { setPendingDeleteIds([]); setDeleteError(""); } }} onConfirm={confirmDelete} />
        <AdminPostCreateDialog open={creatingPost} onClose={() => setCreatingPost(false)} onCreated={(post) => { setCreatingPost(false); setRefreshKey((value) => value + 1); showNotice(`Post created for ${post.creator_name}.`); }} />
        <AdminPostEditorDialog open={Boolean(editingPost)} post={editingPost} onClose={() => setEditingPost(null)} onSaved={(post, warning) => { setPosts((current) => current.map((item) => item.id === post.id ? post : item)); setEditingPost(null); showNotice(warning || "Post updated."); }} />
      </section>
      <Toast.Root className="admin-post-toast" open={toastOpen} onOpenChange={setToastOpen}><Toast.Description>{notice}</Toast.Description></Toast.Root>
      <Toast.Viewport className="admin-post-toast-viewport" />
    </Toast.Provider>
  );
}
