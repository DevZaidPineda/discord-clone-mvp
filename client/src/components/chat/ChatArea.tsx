"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Hash } from "lucide-react";
import { api } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useSocketEvent } from "@/hooks/useSocket";
import { useChatScroll } from "@/hooks/useChatScroll";
import { Message, Channel } from "@/types";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";
import { Spinner } from "@/components/ui/Spinner";

interface Props {
  channelId: string;
  channelName: string;
}

export function ChatArea({ channelId, channelName }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const { ref: scrollRef, scrollToBottom } = useChatScroll(messages);
  const typingTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Fetch initial messages
  useEffect(() => {
    setMessages([]);
    setLoading(true);

    api.getMessages(channelId)
      .then((res) => {
        setMessages(res.messages);
        setTimeout(scrollToBottom, 100);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [channelId]);

  // Join/leave socket room
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit("channel:join", channelId);
    return () => {
      socket.emit("channel:leave", channelId);
    };
  }, [channelId]);

  // Listen for new messages
  useSocketEvent<Message>("message:new", (message) => {
    if (message.channelId === channelId) {
      setMessages((prev) => [...prev, message]);
    }
  });

  // Typing indicators
  useSocketEvent<{ userId: string; username: string }>("message:typing", ({ userId, username }) => {
    setTypingUsers((prev) => {
      if (prev.includes(username)) return prev;
      return [...prev, username];
    });

    // Clear after 3 seconds
    const existing = typingTimeouts.current.get(userId);
    if (existing) clearTimeout(existing);
    typingTimeouts.current.set(
      userId,
      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u !== username));
        typingTimeouts.current.delete(userId);
      }, 3000)
    );
  });

  useSocketEvent<{ userId: string }>("message:stop-typing", ({ userId }) => {
    const timeout = typingTimeouts.current.get(userId);
    if (timeout) clearTimeout(timeout);
    typingTimeouts.current.delete(userId);
    setTypingUsers((prev) => prev.filter((_, i) => true)); // force rerender
  });

  // Listen for deleted messages
  useSocketEvent<{ messageId: string; channelId: string }>("message:deleted", ({ messageId }) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, content: "[Message deleted]", deleted: true } : m
      )
    );
  });

  const handleSend = (content: string) => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit("message:send", { channelId, content });
  };

  const handleTyping = () => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit("message:typing", { channelId });
  };

  return (
    <div className="flex-1 flex flex-col bg-discord-bg min-w-0">
      {/* Channel Header */}
      <div className="h-12 px-4 flex items-center gap-2 border-b border-black/30 shadow-sm shrink-0">
        <Hash size={20} className="text-discord-text-muted" />
        <h3 className="font-semibold text-white text-[15px]">{channelName}</h3>
      </div>

      {/* Messages */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <MessageList
          messages={messages}
          loading={false}
          channelName={channelName}
          scrollRef={scrollRef}
        />
      )}

      {/* Typing Indicator */}
      <TypingIndicator typingUsers={typingUsers} />

      {/* Input */}
      <ChatInput channelName={channelName} onSend={handleSend} onTyping={handleTyping} />
    </div>
  );
}
