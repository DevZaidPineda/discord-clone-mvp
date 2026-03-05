export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const s = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" };
  return (
    <div className={`${s[size]} border-2 border-discord-text-muted/30 border-t-discord-channel rounded-full animate-spin`} />
  );
}
