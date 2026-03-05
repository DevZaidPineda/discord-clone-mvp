"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useVoiceChat } from "@/hooks/useVoiceChat";
import { getSocket } from "@/lib/socket";
import type { VoiceUser } from "@/types";

interface VoiceContextType {
  isConnected: boolean;
  currentChannelId: string | null;
  voiceUsers: VoiceUser[];
  isMuted: boolean;
  isDeafened: boolean;
  isSpeaking: boolean;
  joinVoice: (channelId: string) => Promise<void>;
  leaveVoice: () => void;
  toggleMute: () => void;
  toggleDeafen: () => void;
  // Global voice state (all channels)
  voiceStates: Map<string, VoiceUser[]>;
}

const VoiceContext = createContext<VoiceContextType | null>(null);

export function VoiceProvider({ children }: { children: ReactNode }) {
  const voice = useVoiceChat();
  const [voiceStates, setVoiceStates] = useState<Map<string, VoiceUser[]>>(new Map());

  // Listen for global voice state updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleStateUpdate = (data: { channelId: string; users: VoiceUser[] }) => {
      setVoiceStates((prev) => {
        const next = new Map(prev);
        if (data.users.length === 0) {
          next.delete(data.channelId);
        } else {
          next.set(data.channelId, data.users);
        }
        return next;
      });
    };

    socket.on("voice:state-update", handleStateUpdate);
    return () => {
      socket.off("voice:state-update", handleStateUpdate);
    };
  }, []);

  return (
    <VoiceContext.Provider value={{ ...voice, voiceStates }}>
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const ctx = useContext(VoiceContext);
  if (!ctx) throw new Error("useVoice must be used within VoiceProvider");
  return ctx;
}
