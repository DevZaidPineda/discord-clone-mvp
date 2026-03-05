"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { PlusCircle, Smile, SendHorizonal } from "lucide-react";

interface Props {
  channelName: string;
  onSend: (content: string) => void;
  onTyping: () => void;
}

export function ChatInput({ channelName, onSend, onTyping }: Props) {
  const [content, setContent] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleSend = () => {
    if (!content.trim()) return;
    onSend(content.trim());
    setContent("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (value: string) => {
    setContent(value);
    // Debounced typing indicator
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    onTyping();
    typingTimeout.current = setTimeout(() => {}, 2000);
  };

  return (
    <div className="px-4 pb-6 pt-0 shrink-0">
      <div className="bg-discord-sidebar rounded-lg flex items-end">
        <button className="p-3 text-discord-text-muted hover:text-discord-text transition-colors shrink-0">
          <PlusCircle size={24} />
        </button>
        <textarea
          ref={inputRef}
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message #${channelName}`}
          rows={1}
          className="flex-1 py-3 bg-transparent text-discord-text text-[15px] placeholder-discord-text-dark resize-none focus:outline-none max-h-48"
          style={{ overflowY: content.split("\n").length > 6 ? "auto" : "hidden" }}
        />
        <button className="p-3 text-discord-text-muted hover:text-discord-text transition-colors shrink-0">
          <Smile size={24} />
        </button>
        {content.trim() && (
          <button
            onClick={handleSend}
            className="p-3 text-discord-channel hover:text-discord-channel-hover transition-colors shrink-0"
          >
            <SendHorizonal size={24} />
          </button>
        )}
      </div>
    </div>
  );
}
