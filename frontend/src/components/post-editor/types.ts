export interface EditablePost { id: string; content: string; category?: string; media_url?: string; media_type?: string; }
export interface PostDraft { content: string; category: string; mediaFile?: File | null; removeMedia?: boolean; }
export interface PostWriteResult extends EditablePost { warning?: string; reward_earned?: number; idempotent_replay?: boolean; }
export interface DeletePostResult { message: string; media_deleted?: boolean; warning?: string; }
