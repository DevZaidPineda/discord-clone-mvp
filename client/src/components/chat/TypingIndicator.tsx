"use client";

interface Props {
  typingUsers: string[];
}

export function TypingIndicator({ typingUsers }: Props) {
  if (typingUsers.length === 0) return <div className="h-6" />;

  const text =
    typingUsers.length === 1
      ? `${typingUsers[0]} is typing...`
      : typingUsers.length === 2
        ? `${typingUsers[0]} and ${typingUsers[1]} are typing...`
        : `${typingUsers[0]} and ${typingUsers.length - 1} others are typing...`;

  return (
    <div className="h-6 px-4 flex items-center gap-2">
      <div className="flex gap-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
      <span className="text-xs text-discord-text-muted">{text}</span>
    </div>
  );
}
