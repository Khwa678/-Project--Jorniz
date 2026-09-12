import { Avatar, DropdownMenu, ScrollArea } from "radix-ui";
import type { ConversationSummary } from "../api/requests";

export interface ConversationListProps {
  conversations: ConversationSummary[];
  currentConversationId: string | null;
  onOpenConversation: (conversation: ConversationSummary) => void;
  onTogglePin: (conversation: ConversationSummary) => void;
  pinningConversationId: string | null;
  searchText: string;
}

function conversationPreview(conversation: ConversationSummary) {
  if (conversation.last_message) return conversation.last_message;
  if (conversation.last_media_type === "image") return "Photo";
  if (conversation.last_media_type === "video") return "Video";
  if (conversation.last_media_type === "audio") return "Voice message";
  return "Start the conversation";
}

export function ConversationList({
  conversations,
  currentConversationId,
  onOpenConversation,
  onTogglePin,
  pinningConversationId,
  searchText,
}: ConversationListProps) {
  const visible = conversations.filter((conversation) =>
    conversation.other_user.name.toLowerCase().includes(searchText.trim().toLowerCase()),
  );

  if (visible.length === 0) {
    return (
      <div className="dm-empty-list">
        <strong>{searchText ? "No matching conversations" : "No conversations yet"}</strong>
        <span>{searchText ? "Try a different name." : "Start a conversation with another member."}</span>
      </div>
    );
  }

  return (
    <ScrollArea.Root className="dm-conversation-scroll">
      <ScrollArea.Viewport className="dm-conversation-scroll-viewport">
      <div className="dm-conversation-list">
      {visible.map((conversation) => (
        <div
          className={`dm-conversation-row ${currentConversationId === conversation.id ? "is-active" : ""}`}
          key={conversation.id}
        >
          <button type="button" className="dm-conversation-main" onClick={() => onOpenConversation(conversation)}>
            <Avatar.Root className="dm-avatar">
              {conversation.other_user.avatar ? <Avatar.Image src={conversation.other_user.avatar} alt="" /> : null}
              <Avatar.Fallback>{conversation.other_user.name.slice(0, 1).toUpperCase()}</Avatar.Fallback>
            </Avatar.Root>
            <span className="dm-conversation-copy">
              <span className="dm-conversation-name">
                {conversation.other_user.name}
                {conversation.other_user.online ? <small>Online</small> : null}
              </span>
              <span className="dm-conversation-preview">{conversationPreview(conversation)}</span>
            </span>
            {conversation.unread_count > 0 ? (
              <span className="dm-unread-count">{conversation.unread_count}</span>
            ) : null}
          </button>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button type="button" className="dm-pin-button" disabled={pinningConversationId === conversation.id} aria-label={`Actions for ${conversation.other_user.name}`}>...</button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="dm-action-menu" align="end" sideOffset={4}>
                <DropdownMenu.Item className="dm-action-menu-item" onSelect={() => onTogglePin(conversation)}>
                  {conversation.is_pinned ? "Unpin conversation" : "Pin conversation"}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      ))}
      </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar className="dm-scrollbar" orientation="vertical"><ScrollArea.Thumb className="dm-scroll-thumb" /></ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}
