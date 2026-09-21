import { Copy } from "lucide-react";
import { Select } from "radix-ui";
import { calculateAgeFromDate } from "../../../../lib/calculateAgeFromDate";
import { ResponsiveTable, type ResponsiveTableColumn, type TableSortDirection } from "../../components/ResponsiveTable";
import { TableRowActions } from "../../components/TableRowActions";
import { PostImageSelector } from "./PostImageSelector";
import { POST_CATEGORY_OPTIONS, POST_TRUST_OPTIONS, type AdminPost, type AdminPostDrafts, type PostChanges, type PostSortField, type PostTrustStatus } from "../types";

export interface PostsTableProps {
  posts: readonly AdminPost[];
  canEdit: boolean;
  drafts: AdminPostDrafts;
  selectedIds: ReadonlySet<string>;
  sortColumn: PostSortField;
  sortDirection: TableSortDirection;
  mediaBusyIds: ReadonlySet<string>;
  onDraftChange: (post: AdminPost, changes: PostChanges) => void;
  onSelectedIdsChange: (ids: Set<string>) => void;
  onSortChange: (column: PostSortField, direction: TableSortDirection) => void;
  onCopy: (value: string, label: string) => void;
  onEdit: (post: AdminPost) => void;
  onDelete: (post: AdminPost) => void;
  onReplaceMedia: (post: AdminPost, file: File) => Promise<void>;
  onMediaError: (message: string) => void;
}

function compactId(value: string) { return value.length > 8 ? `${value.slice(0, 8)}...` : value; }
function exactDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function InlineSelect({ value, label, options, disabled, onChange }: { value: string; label: string; options: readonly { value: string; label: string }[]; disabled: boolean; onChange: (value: string) => void }) {
  return (
    <Select.Root value={value} onValueChange={onChange} disabled={disabled}>
      <Select.Trigger className="admin-post-cell-select" aria-label={label}><Select.Value /></Select.Trigger>
      <Select.Portal><Select.Content className="admin-post-select-menu" position="popper" sideOffset={5}><Select.Viewport>{options.map((option) => <Select.Item className="admin-post-select-option" key={option.value} value={option.value}><Select.ItemText>{option.label}</Select.ItemText></Select.Item>)}</Select.Viewport></Select.Content></Select.Portal>
    </Select.Root>
  );
}

export function PostsTable(props: PostsTableProps) {
  const categoryOptions = POST_CATEGORY_OPTIONS.map((value) => ({ value, label: value }));
  const columns: ResponsiveTableColumn<AdminPost>[] = [
    {
      id: "title", label: "Post", sortable: true, render: (post) => (
        <div className="admin-post-summary">
          <PostImageSelector post={post} busy={props.mediaBusyIds.has(post.id)} editable={props.canEdit} onReplace={(file) => props.onReplaceMedia(post, file)} onError={props.onMediaError} />
          <div><a className="admin-post-title" href={`/posts/${encodeURIComponent(post.id)}`}>{post.title || "Untitled post"}</a><button className="admin-copy-id" type="button" onClick={() => props.onCopy(post.id, "Post ID")} title="Copy full post ID"><span>{compactId(post.id)}</span><Copy size={12} /></button></div>
        </div>
      ),
    },
    {
      id: "creator", label: "Posted by", render: (post) => (
        <div className="admin-post-creator"><strong>{post.creator_name || "Unknown user"}</strong><span>{post.creator_email}</span><button className="admin-copy-id" type="button" onClick={() => props.onCopy(post.creator_user_id, "Creator ID")} title="Copy full creator ID"><span>{compactId(post.creator_user_id)}</span><Copy size={12} /></button></div>
      ),
    },
    {
      id: "trust_status", label: "Trust", sortable: true, render: (post) => <InlineSelect value={props.drafts[post.id]?.trust_status ?? post.trust_status} label={`Trust status for ${post.title}`} options={POST_TRUST_OPTIONS} disabled={!props.canEdit} onChange={(value) => props.onDraftChange(post, { trust_status: value as PostTrustStatus })} />,
    },
    {
      id: "category", label: "Category", sortable: true, render: (post) => <InlineSelect value={props.drafts[post.id]?.category ?? post.category} label={`Category for ${post.title}`} options={categoryOptions} disabled={!props.canEdit} onChange={(value) => props.onDraftChange(post, { category: value })} />,
    },
    { id: "comments_count", label: "Comments", sortable: true, render: (post) => post.comments_count },
    { id: "views_count", label: "Views", sortable: true, render: (post) => post.views_count },
    { id: "created_at", label: "Age", sortable: true, render: (post) => <time dateTime={post.created_at}>{calculateAgeFromDate(post.created_at) || "Unknown"}</time> },
    { id: "date", label: "Date posted", render: (post) => <time dateTime={post.created_at}>{exactDate(post.created_at)}</time> },
  ];

  return <ResponsiveTable rows={props.posts} columns={columns} getRowId={(post) => post.id} emptyMessage="No posts match this search."
    selectedRowIds={props.canEdit ? props.selectedIds : undefined} onSelectedRowIdsChange={props.canEdit ? props.onSelectedIdsChange : undefined} selectRowOnClick={props.canEdit}
    sortColumn={props.sortColumn} sortDirection={props.sortDirection} onSortChange={(column, direction) => props.onSortChange(column as PostSortField, direction)}
    renderActions={(post) => <TableRowActions rowLabel={post.title} onOpen={() => { window.location.href = `/posts/${encodeURIComponent(post.id)}`; }} onEdit={props.canEdit ? () => props.onEdit(post) : undefined} onDelete={props.canEdit ? () => props.onDelete(post) : undefined} />} />;
}
