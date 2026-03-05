"use client";

import { useState, useRef, useCallback, KeyboardEvent } from "react";
import { PlusCircle, SendHorizonal } from "lucide-react";

interface Props {
  channelName: string;
  onSend: (content: string) => void;
  onTyping: () => void;
  onStopTyping: () => void;
}

export function MessageInput({ channelName, onSend, onTyping, onStopTyping }: Props) {
  const [content, setContent] = useState("");
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const isTyping = useRef(false);

  const handleSend = () => {
    const trimmed = content.trim();
    if (!trimmed) return;

    onSend(trimmed);
    setContent("");

    if (isTyping.current) {
      onStopTyping();
      isTyping.current = false;
    }
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (value: string) => {
    setContent(value);

    // Typing indicator
    if (!isTyping.current && value.trim()) {
      isTyping.current = true;
      onTyping();
    }

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      if (isTyping.current) {
        onStopTyping();
        isTyping.current = false;
      }
    }, 2000);
  };

  return (
    <div className="px-4 pb-6 shrink-0">
      <div className="flex items-end bg-discord-dark-200 rounded-lg px-4">
        <button className="py-3 text-zinc-400 hover:text-zinc-200 transition-colors">
          <PlusCircle className="w-5 h-5" />
        </button>

        <textarea
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Enviar mensaje en #${channelName}`}
          className="flex-1 bg-transparent text-zinc-100 placeholder-zinc-500 px-3 py-3 text-[15px] resize-none max-h-[200px] focus:outline-none"
          rows={1}
          style={{ minHeight: "44px" }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = Math.min(target.scrollHeight, 200) + "px";
          }}
        />

        <button
          onClick={handleSend}
          disabled={!content.trim()}
          className="py-3 text-zinc-400 hover:text-discord-primary transition-colors disabled:opacity-30"
        >
          <SendHorizonal className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
