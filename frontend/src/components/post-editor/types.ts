export interface EditablePost { id: string; title?: string; content: string; hashtags?: string; category?: string; media_url?: string; media_type?: string; }
export interface PostDraft { title: string; content: string; hashtags: string; category: string; mediaFile?: File | null; removeMedia?: boolean; }
export interface PostWriteResult extends EditablePost { warning?: string; reward_earned?: number; idempotent_replay?: boolean; }
export interface DeletePostResult { message: string; media_deleted?: boolean; warning?: string; }
