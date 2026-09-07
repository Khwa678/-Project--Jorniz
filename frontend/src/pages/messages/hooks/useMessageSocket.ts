import { useCallback, useEffect, useRef, useState } from "react";
import type { DirectMessage } from "../api/requests";

interface JornizMessageSocket {
  connected?: boolean;
  disconnect(): void;
  emit(event: string, payload: unknown): void;
  off(event: string, listener: (payload: any) => void): void;
  on(event: string, listener: (payload: any) => void): void;
}

type JornizSocketFactory = (
  url: string,
  options: { query: { token: string }; transports: string[] },
) => JornizMessageSocket;

declare global {
  interface Window {
    io?: JornizSocketFactory;
  }
}

export type MessageSocketStatus = "unavailable" | "connecting" | "connected" | "disconnected";

export interface MessageSocketCallbacks {
  onConversationChanged?: () => void;
  onMessageDeleted?: (messageId: string) => void;
  onMessageEdited?: (messageId: string, content: string) => void;
  onMessageReceived?: (message: DirectMessage) => void;
}

export interface UseMessageSocketOptions extends MessageSocketCallbacks {
  accessToken?: string;
  socketUrl?: string;
}

export interface SendSocketMessageInput {
  conversationId: string;
  content: string;
  mediaUrl?: string;
  mediaType?: string;
  replyToId?: string | null;
}

export function useMessageSocket({
  accessToken,
  socketUrl,
  onConversationChanged,
  onMessageDeleted,
  onMessageEdited,
  onMessageReceived,
}: UseMessageSocketOptions) {
  const socketRef = useRef<JornizMessageSocket | null>(null);
  const [status, setStatus] = useState<MessageSocketStatus>("unavailable");
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken || !window.io) {
      setStatus("unavailable");
      setFailure(
        !accessToken
          ? "Live messaging needs an authenticated socket token."
          : "Live messaging needs the Socket.IO browser client.",
      );
      return;
    }

    setStatus("connecting");
    setFailure(null);
    const resolvedUrl =
      socketUrl || import.meta.env.VITE_API_URL || window.location.origin;
    const socket = window.io(resolvedUrl, {
      query: { token: accessToken },
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    const connected = () => {
      setStatus("connected");
      setFailure(null);
    };
    const disconnected = () => setStatus("disconnected");
    const connectionFailed = (error: unknown) => {
      setStatus("disconnected");
      setFailure(error instanceof Error ? error.message : "Could not connect to live messages.");
    };
    const newMessage = (message: DirectMessage) => onMessageReceived?.(message);
    const conversationChanged = () => onConversationChanged?.();
    const messageEdited = (payload: { message_id: string; content: string }) =>
      onMessageEdited?.(payload.message_id, payload.content);
    const messageDeleted = (payload: { message_id: string }) =>
      onMessageDeleted?.(payload.message_id);

    socket.on("connect", connected);
    socket.on("disconnect", disconnected);
    socket.on("connect_error", connectionFailed);
    socket.on("new_message", newMessage);
    socket.on("conversation_update", conversationChanged);
    socket.on("message_edited", messageEdited);
    socket.on("message_deleted", messageDeleted);

    return () => {
      socket.off("connect", connected);
      socket.off("disconnect", disconnected);
      socket.off("connect_error", connectionFailed);
      socket.off("new_message", newMessage);
      socket.off("conversation_update", conversationChanged);
      socket.off("message_edited", messageEdited);
      socket.off("message_deleted", messageDeleted);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [
    accessToken,
    onConversationChanged,
    onMessageDeleted,
    onMessageEdited,
    onMessageReceived,
    socketUrl,
  ]);

  const openConversationSocket = useCallback((conversationId: string) => {
    socketRef.current?.emit("join_conversation", { conversation_id: conversationId });
    socketRef.current?.emit("mark_read", { conversation_id: conversationId });
  }, []);

  const sendSocketMessage = useCallback((input: SendSocketMessageInput) => {
    if (!socketRef.current?.connected) return false;
    socketRef.current.emit("send_message", {
      conversation_id: input.conversationId,
      content: input.content.trim(),
      media_url: input.mediaUrl || "",
      media_type: input.mediaType || "",
      reply_to_id: input.replyToId || null,
    });
    return true;
  }, []);

  const announceTyping = useCallback((conversationId: string) => {
    socketRef.current?.emit("typing", { conversation_id: conversationId });
  }, []);

  return {
    announceTyping,
    failure,
    openConversationSocket,
    sendSocketMessage,
    status,
  };
}
