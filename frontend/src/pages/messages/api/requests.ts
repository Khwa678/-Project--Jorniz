import { requestJornizApi } from "../../../lib/api/requestJornizApi";

export type MessageMediaType = "image" | "video" | "audio" | "";

export interface ConversationMember {
  id: string;
  name: string;
  specialty?: string;
  avatar?: string;
  online?: boolean;
  blocked_by_me?: boolean;
}

export interface ConversationSummary {
  id: string;
  is_pinned: boolean;
  other_user: ConversationMember;
  last_message?: string;
  last_media_type?: MessageMediaType;
  last_time?: string;
  unread_count: number;
}

export interface DirectMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  media_url?: string;
  media_type?: MessageMediaType;
  reply_to_id?: string | null;
  reply_to?: Pick<DirectMessage, "id" | "content" | "sender_id">;
  created_at: string;
  edited_at?: string | null;
  read_at?: string | null;
  is_deleted?: boolean;
}

export interface MessageableMember {
  id: string;
  name: string;
  specialty?: string;
  avatar_url?: string;
}

export interface UploadedMessageAttachment {
  media_url: string;
  media_type: Exclude<MessageMediaType, "">;
}

export function loadConversations(): Promise<ConversationSummary[]> {
  return requestJornizApi<ConversationSummary[]>("/api/messages/conversations");
}

export function loadConversationMessages(
  conversationId: string,
): Promise<DirectMessage[]> {
  return requestJornizApi<DirectMessage[]>(
    `/api/messages/conversations/${encodeURIComponent(conversationId)}/messages`,
  );
}

export function findMembersToMessage(query: string): Promise<MessageableMember[]> {
  return requestJornizApi<MessageableMember[]>(
    `/api/users?q=${encodeURIComponent(query.trim())}`,
  );
}

export function startConversation(otherUserId: string): Promise<{ conversation_id: string }> {
  return requestJornizApi<{ conversation_id: string }>(
    "/api/messages/conversations/start",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ other_user_id: otherUserId }),
    },
  );
}

export function pinOrUnpinConversation(
  conversationId: string,
): Promise<{ pinned: boolean }> {
  return requestJornizApi<{ pinned: boolean }>(
    `/api/messages/conversations/${encodeURIComponent(conversationId)}/pin`,
    { method: "POST" },
  );
}

export function blockOrUnblockMember(memberId: string): Promise<{ blocked: boolean }> {
  return requestJornizApi<{ blocked: boolean }>(
    `/api/users/${encodeURIComponent(memberId)}/block`,
    { method: "POST" },
  );
}

export function searchConversationMessages(
  conversationId: string,
  query: string,
): Promise<DirectMessage[]> {
  return requestJornizApi<DirectMessage[]>(
    `/api/messages/conversations/${encodeURIComponent(conversationId)}/search?q=${encodeURIComponent(query.trim())}`,
  );
}

export function editOwnMessage(
  messageId: string,
  content: string,
): Promise<{ message: string }> {
  return requestJornizApi<{ message: string }>(
    `/api/messages/${encodeURIComponent(messageId)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: content.trim() }),
    },
  );
}

export function deleteOwnMessage(messageId: string): Promise<{ message: string }> {
  return requestJornizApi<{ message: string }>(
    `/api/messages/${encodeURIComponent(messageId)}`,
    { method: "DELETE" },
  );
}

export function uploadMessageAttachment(file: File): Promise<UploadedMessageAttachment> {
  const body = new FormData();
  body.append("media", file);
  return requestJornizApi<UploadedMessageAttachment>("/api/messages/upload-media", {
    method: "POST",
    body,
  });
}
