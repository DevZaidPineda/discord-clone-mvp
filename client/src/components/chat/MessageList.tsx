"use client";

import { Message } from "@/types";
import { MessageItem } from "./MessageItem";
import { Spinner } from "@/components/ui/Spinner";
import { Hash } from "lucide-react";

interface Props {
  messages: Message[];
  loading: boolean;
  channelName: string;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

function shouldShowCompact(current: Message, previous: Message | null): boolean {
  if (!previous) return false;
  if (current.authorId !== previous.authorId) return false;
  const diff = new Date(current.createdAt).getTime() - new Date(previous.createdAt).getTime();
  return diff < 5 * 60 * 1000; // 5 minutes
}

export function MessageList({ messages, loading, channelName, scrollRef }: Props) {
  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto">
      {/* Welcome header */}
      <div className="px-4 pt-16 pb-4">
        <div className="w-16 h-16 rounded-full bg-discord-text-dark/30 flex items-center justify-center mb-3">
          <Hash size={32} className="text-white" />
        </div>
        <h3 className="text-3xl font-bold text-white mb-2">Welcome to #{channelName}</h3>
        <p className="text-discord-text-muted text-sm">
          This is the start of the #{channelName} channel.
        </p>
        <div className="border-b border-discord-separator mt-4" />
      </div>

      {loading && (
        <div className="flex justify-center py-4">
          <Spinner size="sm" />
        </div>
      )}

      {/* Messages */}
      <div className="pb-6">
        {messages.map((msg, i) => (
          <MessageItem
            key={msg.id}
            message={msg}
            isCompact={shouldShowCompact(msg, messages[i - 1] || null)}
          />
        ))}
      </div>
    </div>
  );
}
