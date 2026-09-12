import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertDialog, Avatar, Dialog, ScrollArea } from "radix-ui";
import { Button } from "../../components/ui/Button";
import type { SignedInAccount } from "../../lib/auth/accountTypes";
import { ConversationList } from "./components/ConversationList";
import { ConversationThread } from "./components/ConversationThread";
import { MessageComposer, type MessageComposerInput } from "./components/MessageComposer";
import { VoiceVideoCallScreen } from "./components/VoiceVideoCallScreen";
import {
  blockOrUnblockMember,
  deleteOwnMessage,
  editOwnMessage,
  findMembersToMessage,
  loadConversationMessages,
  loadConversations,
  pinOrUnpinConversation,
  searchConversationMessages,
  startConversation,
  uploadMessageAttachment,
  type ConversationSummary,
  type DirectMessage,
  type MessageableMember,
} from "./api/requests";
import { useMessageSocket } from "./hooks/useMessageSocket";
import "./styles.css";

export interface DirectMessagesPageProps {
  accessToken?: string;
  signedInAccount: SignedInAccount;
  socketUrl?: string;
}

function failureText(error: unknown) {
  return error instanceof Error ? error.message : "The request could not be completed.";
}

export function DirectMessagesPage({ accessToken, signedInAccount, socketUrl }: DirectMessagesPageProps) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ConversationSummary | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [messageSearch, setMessageSearch] = useState<Set<string>>(new Set());
  const [pinningConversationId, setPinningConversationId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [showMemberSearch, setShowMemberSearch] = useState(false);
  const [memberQuery, setMemberQuery] = useState("");
  const [members, setMembers] = useState<MessageableMember[]>([]);
  const [memberSearchFailure, setMemberSearchFailure] = useState<string | null>(null);
  const [messageBeingEdited, setMessageBeingEdited] = useState<DirectMessage | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [messagePendingDeletion, setMessagePendingDeletion] = useState<DirectMessage | null>(null);

  const refreshConversations = useCallback(async () => {
    try {
      const next = await loadConversations();
      setConversations(next);
      setCurrentConversation((current) =>
        current ? next.find((item) => item.id === current.id) || current : null,
      );
      setFailure(null);
    } catch (error) {
      setFailure(failureText(error));
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  const receiveMessage = useCallback((message: DirectMessage) => {
    setMessages((current) =>
      current.some((item) => item.id === message.id) ? current : [...current, message],
    );
  }, []);
  const receiveEdit = useCallback((messageId: string, content: string) => {
    setMessages((current) =>
      current.map((item) => item.id === messageId ? { ...item, content, edited_at: new Date().toISOString() } : item),
    );
  }, []);
  const receiveDelete = useCallback((messageId: string) => {
    setMessages((current) =>
      current.map((item) => item.id === messageId ? { ...item, is_deleted: true, content: "" } : item),
    );
  }, []);

  const messageSocket = useMessageSocket({
    accessToken,
    socketUrl,
    onConversationChanged: refreshConversations,
    onMessageDeleted: receiveDelete,
    onMessageEdited: receiveEdit,
    onMessageReceived: receiveMessage,
  });

  useEffect(() => {
    void refreshConversations();
  }, [refreshConversations]);

  const openConversation = async (conversation: ConversationSummary) => {
    setCurrentConversation(conversation);
    setLoadingMessages(true);
    setFailure(null);
    setMessageSearch(new Set());
    try {
      setMessages(await loadConversationMessages(conversation.id));
      messageSocket.openConversationSocket(conversation.id);
    } catch (error) {
      setFailure(failureText(error));
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const searchMembers = async () => {
    setMemberSearchFailure(null);
    try {
      setMembers(await findMembersToMessage(memberQuery));
    } catch (error) {
      setMemberSearchFailure(failureText(error));
    }
  };

  const beginConversation = async (member: MessageableMember) => {
    try {
      const result = await startConversation(member.id);
      setShowMemberSearch(false);
      await refreshConversations();
      const conversation = (await loadConversations()).find((item) => item.id === result.conversation_id);
      if (conversation) await openConversation(conversation);
    } catch (error) {
      setMemberSearchFailure(failureText(error));
    }
  };

  const togglePin = async (conversation: ConversationSummary) => {
    setPinningConversationId(conversation.id);
    try {
      await pinOrUnpinConversation(conversation.id);
      await refreshConversations();
    } catch (error) {
      setFailure(failureText(error));
    } finally {
      setPinningConversationId(null);
    }
  };

  const toggleBlock = async () => {
    if (!currentConversation) return;
    try {
      const result = await blockOrUnblockMember(currentConversation.other_user.id);
      setCurrentConversation({
        ...currentConversation,
        other_user: { ...currentConversation.other_user, blocked_by_me: result.blocked },
      });
      await refreshConversations();
    } catch (error) {
      setFailure(failureText(error));
    }
  };

  const searchCurrentConversation = async (query: string) => {
    if (!currentConversation || !query.trim()) {
      setMessageSearch(new Set());
      return;
    }
    try {
      const matches = await searchConversationMessages(currentConversation.id, query);
      setMessageSearch(new Set(matches.map((message) => message.id)));
    } catch (error) {
      setFailure(failureText(error));
    }
  };

  const openMessageEditor = (message: DirectMessage) => {
    setMessageBeingEdited(message);
    setEditDraft(message.content);
  };

  const saveEditedMessage = async () => {
    if (!messageBeingEdited || !editDraft.trim() || editDraft.trim() === messageBeingEdited.content) return;
    try {
      await editOwnMessage(messageBeingEdited.id, editDraft);
      receiveEdit(messageBeingEdited.id, editDraft.trim());
      setMessageBeingEdited(null);
    } catch (error) {
      setFailure(failureText(error));
    }
  };

  const deleteMessage = async (message: DirectMessage) => {
    try {
      await deleteOwnMessage(message.id);
      receiveDelete(message.id);
      setMessagePendingDeletion(null);
    } catch (error) {
      setFailure(failureText(error));
    }
  };

  const sendMessage = async ({ content, file }: MessageComposerInput) => {
    if (!currentConversation) return false;
    setSending(true);
    setFailure(null);
    try {
      const attachment = file ? await uploadMessageAttachment(file) : null;
      const sent = messageSocket.sendSocketMessage({
        conversationId: currentConversation.id,
        content,
        mediaUrl: attachment?.media_url,
        mediaType: attachment?.media_type,
      });
      if (!sent) throw new Error("The live message connection is not available.");
      return true;
    } catch (error) {
      setFailure(failureText(error));
      return false;
    } finally {
      setSending(false);
    }
  };

  const composerDisabledReason = useMemo(() => {
    if (!currentConversation) return "Select a conversation before sending a message.";
    if (currentConversation.other_user.blocked_by_me) return "Unblock this member before sending a message.";
    if (messageSocket.status !== "connected") return messageSocket.failure || "Live messaging is unavailable.";
    return undefined;
  }, [currentConversation, messageSocket.failure, messageSocket.status]);

  return (
    <section className="dm-page">
      <header className="dm-page-heading">
        <div><span>Private conversations</span><h1>Direct messages</h1></div>
        <Dialog.Root open={showMemberSearch} onOpenChange={setShowMemberSearch}>
          <Dialog.Trigger asChild>
            <Button>New conversation</Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="dm-dialog-overlay" />
            <Dialog.Content className="dm-dialog-content">
              <Dialog.Title>Start a conversation</Dialog.Title>
              <Dialog.Description>Find a Jorniz member and open a private conversation.</Dialog.Description>
              <form className="dm-member-search" onSubmit={(event) => { event.preventDefault(); void searchMembers(); }}>
                <input value={memberQuery} onChange={(event) => setMemberQuery(event.target.value)} placeholder="Find a Jorniz member" autoFocus />
                <Button type="submit" size="small">Search</Button>
                {memberSearchFailure ? <p role="alert">{memberSearchFailure}</p> : null}
                <ScrollArea.Root className="dm-member-results-scroll">
                  <ScrollArea.Viewport className="dm-member-results-viewport">
                    <div className="dm-member-results">
                      {members.map((member) => (
                        <Button
                          className="dm-member-result"
                          key={member.id}
                          onClick={() => void beginConversation(member)}
                          type="button"
                          variant="ghost"
                        >
                          <Avatar.Root className="dm-member-avatar">
                            {member.avatar_url ? <Avatar.Image src={member.avatar_url} alt="" /> : null}
                            <Avatar.Fallback>{member.name.slice(0, 1).toUpperCase()}</Avatar.Fallback>
                          </Avatar.Root>
                          <span className="dm-member-result-copy">
                            <strong>{member.name}</strong>
                            <span>{member.specialty || "Jorniz member"}</span>
                          </span>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea.Viewport>
                  <ScrollArea.Scrollbar className="dm-scrollbar" orientation="vertical">
                    <ScrollArea.Thumb className="dm-scroll-thumb" />
                  </ScrollArea.Scrollbar>
                </ScrollArea.Root>
              </form>
              <div className="dm-dialog-actions">
                <Dialog.Close asChild><Button variant="secondary">Close</Button></Dialog.Close>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </header>

      {failure ? <div className="dm-error" role="alert">{failure}</div> : null}

      <div className="dm-workspace">
        <aside className="dm-sidebar">
          <input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Search conversations" />
          {loadingConversations ? (
            <p className="dm-status">Loading conversations...</p>
          ) : (
            <ConversationList
              conversations={conversations}
              currentConversationId={currentConversation?.id || null}
              onOpenConversation={(conversation) => void openConversation(conversation)}
              onTogglePin={(conversation) => void togglePin(conversation)}
              pinningConversationId={pinningConversationId}
              searchText={searchText}
            />
          )}
        </aside>

        <main className="dm-main">
          {!currentConversation ? (
            <div className="dm-no-selection"><strong>Select a conversation</strong><span>Your message history will appear here.</span></div>
          ) : loadingMessages ? (
            <p className="dm-status">Loading messages...</p>
          ) : (
            <>
              <ConversationThread
                conversation={currentConversation}
                currentAccountId={String(signedInAccount.id)}
                highlightedMessageIds={messageSearch}
                messages={messages}
                onBlockMember={() => void toggleBlock()}
                onDeleteMessage={setMessagePendingDeletion}
                onEditMessage={openMessageEditor}
                onSearch={(query) => void searchCurrentConversation(query)}
              />
              <VoiceVideoCallScreen memberName={currentConversation.other_user.name} />
              <MessageComposer
                disabledReason={composerDisabledReason}
                isSending={sending}
                onSend={sendMessage}
                onTyping={() => messageSocket.announceTyping(currentConversation.id)}
              />
            </>
          )}
        </main>
      </div>

      <Dialog.Root open={Boolean(messageBeingEdited)} onOpenChange={(open) => { if (!open) setMessageBeingEdited(null); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="dm-dialog-overlay" />
          <Dialog.Content className="dm-dialog-content">
            <Dialog.Title>Edit message</Dialog.Title>
            <Dialog.Description>Update the text in your message.</Dialog.Description>
            <form className="dm-edit-form" onSubmit={(event) => { event.preventDefault(); void saveEditedMessage(); }}>
              <textarea aria-label="Message text" value={editDraft} onChange={(event) => setEditDraft(event.target.value)} rows={4} autoFocus />
              <div className="dm-dialog-actions">
                <Dialog.Close asChild><Button variant="secondary">Cancel</Button></Dialog.Close>
                <Button type="submit" disabled={!editDraft.trim() || editDraft.trim() === messageBeingEdited?.content}>Save changes</Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <AlertDialog.Root open={Boolean(messagePendingDeletion)} onOpenChange={(open) => { if (!open) setMessagePendingDeletion(null); }}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="dm-dialog-overlay" />
          <AlertDialog.Content className="dm-dialog-content">
            <AlertDialog.Title>Delete this message?</AlertDialog.Title>
            <AlertDialog.Description>This removes the message from the conversation. This action cannot be undone.</AlertDialog.Description>
            <div className="dm-dialog-actions">
              <AlertDialog.Cancel asChild><Button variant="secondary">Cancel</Button></AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button variant="danger" onClick={() => { if (messagePendingDeletion) void deleteMessage(messagePendingDeletion); }}>Delete message</Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </section>
  );
}
