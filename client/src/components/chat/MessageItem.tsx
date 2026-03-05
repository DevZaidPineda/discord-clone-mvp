"use client";

import { Message } from "@/types";
import { Avatar } from "@/components/ui/Avatar";

interface Props {
  message: Message;
  isCompact: boolean; // true if same author as previous message within 5 min
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (isToday) return `Today at ${time}`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday at ${time}`;
  return `${date.toLocaleDateString()} ${time}`;
}

export function MessageItem({ message, isCompact }: Props) {
  if (isCompact) {
    return (
      <div className="flex gap-4 px-4 py-0.5 hover:bg-discord-hover group">
        <div className="w-10 shrink-0 flex items-center justify-center">
          <span className="text-[11px] text-discord-text-dark opacity-0 group-hover:opacity-100 transition-opacity">
            {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <p className="text-discord-text text-[15px] leading-relaxed break-words min-w-0">
          {message.content}
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 px-4 py-1 mt-3 hover:bg-discord-hover group">
      <Avatar username={message.author.username} avatarUrl={message.author.avatarUrl} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-medium text-[15px] text-white hover:underline cursor-pointer">
            {message.author.username}
          </span>
          <span className="text-xs text-discord-text-dark">
            {formatTime(message.createdAt)}
          </span>
        </div>
        <p className="text-discord-text text-[15px] leading-relaxed break-words">
          {message.content}
        </p>
      </div>
    </div>
  );
}
