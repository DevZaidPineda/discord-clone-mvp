"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { VoiceProvider } from "@/providers/VoiceProvider";
import { ServerList } from "@/components/server/ServerList";
import { Avatar } from "@/components/ui/Avatar";
import { LogOut } from "lucide-react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#1e1f22]">
        <div className="w-8 h-8 border-2 border-[#5865f2]/30 border-t-[#5865f2] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <VoiceProvider>
      <div className="h-screen flex overflow-hidden">
        <ServerList />

        <div className="flex-1 flex min-h-0">
          {children}
        </div>

        <div className="fixed bottom-0 left-[72px] w-60 bg-[#232428] px-2 py-2 flex items-center gap-2 z-10">
          <Avatar username={user.username} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.username}</p>
            <p className="text-[11px] text-[#949ba4] truncate">Online</p>
          </div>
          <button
            onClick={() => { logout(); router.push("/login"); }}
            className="p-1.5 rounded hover:bg-[#35373c] text-[#949ba4] hover:text-white transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </VoiceProvider>
  );
}