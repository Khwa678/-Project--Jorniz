import { Avatar, DropdownMenu, ScrollArea } from "radix-ui";
import { Button } from "../../../components/ui/Button";
import type { DirectMessage, ConversationSummary } from "../api/requests";

export interface ConversationThreadProps {
  conversation: ConversationSummary;
  currentAccountId: string;
  highlightedMessageIds: Set<string>;
  messages: DirectMessage[];
  onBlockMember: () => void;
  onDeleteMessage: (message: DirectMessage) => void;
  onEditMessage: (message: DirectMessage) => void;
  onSearch: (query: string) => void;
}

function readableMessageTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
}

export function ConversationThread({
  conversation,
  currentAccountId,
  highlightedMessageIds,
  messages,
  onBlockMember,
  onDeleteMessage,
  onEditMessage,
  onSearch,
}: ConversationThreadProps) {
  return (
    <div className="dm-thread">
      <header className="dm-thread-header">
        <div className="dm-thread-member">
          <Avatar.Root className="dm-thread-avatar">
            {conversation.other_user.avatar ? <Avatar.Image src={conversation.other_user.avatar} alt="" /> : null}
            <Avatar.Fallback>{conversation.other_user.name.slice(0, 1).toUpperCase()}</Avatar.Fallback>
          </Avatar.Root>
          <span className="dm-thread-member-copy">
            <strong>{conversation.other_user.name}</strong>
            <span>{conversation.other_user.online ? "Online" : conversation.other_user.specialty || "Jorniz member"}</span>
          </span>
        </div>
        <input
          aria-label="Search this conversation"
          placeholder="Search messages"
          onChange={(event) => onSearch(event.target.value)}
        />
        <Button size="small" variant="secondary" onClick={onBlockMember}>
          {conversation.other_user.blocked_by_me ? "Unblock" : "Block"}
        </Button>
      </header>

      <ScrollArea.Root className="dm-message-scroll-root">
        <ScrollArea.Viewport className="dm-message-scroll">
        {messages.length === 0 ? (
          <div className="dm-thread-empty">
            <strong>No messages in this conversation</strong>
            <span>Send the first message when live messaging is available.</span>
          </div>
        ) : (
          messages.map((message) => {
            const isMine = String(message.sender_id) === String(currentAccountId);
            const isHighlighted = highlightedMessageIds.has(message.id);
            return (
              <article
                className={`dm-message ${isMine ? "is-mine" : "is-theirs"} ${isHighlighted ? "is-highlighted" : ""}`}
                key={message.id}
              >
                <div className="dm-message-bubble">
                  {message.reply_to ? <blockquote>{message.reply_to.content || "Attached message"}</blockquote> : null}
                  {message.is_deleted ? (
                    <em>This message was deleted.</em>
                  ) : (
                    <>
                      {message.media_url ? (
                        <a href={message.media_url} target="_blank" rel="noreferrer">
                          Open {message.media_type || "attachment"}
                        </a>
                      ) : null}
                      {message.content ? <p>{message.content}</p> : null}
                    </>
                  )}
                </div>
                <footer>
                  <span>{readableMessageTime(message.created_at)}</span>
                  {message.edited_at ? <span>Edited</span> : null}
                  {isMine && !message.is_deleted ? (
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <button type="button" aria-label="Message actions">...</button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content className="dm-action-menu" align="end" sideOffset={4}>
                          {!message.media_url ? <DropdownMenu.Item className="dm-action-menu-item" onSelect={() => onEditMessage(message)}>Edit message</DropdownMenu.Item> : null}
                          <DropdownMenu.Item className="dm-action-menu-item is-danger" onSelect={() => onDeleteMessage(message)}>Delete message</DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                  ) : null}
                </footer>
              </article>
            );
          })
        )}
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar className="dm-scrollbar" orientation="vertical"><ScrollArea.Thumb className="dm-scroll-thumb" /></ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </div>
  );
}
