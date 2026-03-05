import { cn, getInitials, getAvatarColor } from "@/lib/utils";

interface AvatarProps {
  username: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({ username, avatarUrl, size = "md", className }: AvatarProps) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-xl",
  };

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={username}
        className={cn("rounded-full object-cover", sizes[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold text-white shrink-0",
        sizes[size],
        className
      )}
      style={{ backgroundColor: getAvatarColor(username) }}
    >
      {getInitials(username)}
    </div>
  );
}
