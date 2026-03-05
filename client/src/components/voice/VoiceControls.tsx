"use client";

import { Mic, MicOff, Headphones, HeadphoneOff, PhoneOff, Signal } from "lucide-react";
import { useVoice } from "@/providers/VoiceProvider";
import { cn } from "@/lib/utils";

export function VoiceControls() {
  const { isConnected, currentChannelId, isMuted, isDeafened, toggleMute, toggleDeafen, leaveVoice } =
    useVoice();

  if (!isConnected) return null;

  return (
    <div className="bg-[#232428] border-t border-black/20">
      {/* Connection info */}
      <div className="px-3 py-2 flex items-center gap-2">
        <Signal size={16} className="text-[#23a559]" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-[#23a559]">Voice Connected</p>
        </div>
      </div>

      {/* Control buttons */}
      <div className="flex items-center justify-center gap-2 px-3 pb-2">
        <button
          onClick={toggleMute}
          className={cn(
            "p-2 rounded-full transition-colors",
            isMuted
              ? "bg-[#ed4245]/20 text-[#ed4245] hover:bg-[#ed4245]/30"
              : "bg-[#35373c] text-[#dbdee1] hover:bg-[#404249]"
          )}
          title={isMuted ? "Activar micrófono" : "Silenciar micrófono"}
        >
          {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        <button
          onClick={toggleDeafen}
          className={cn(
            "p-2 rounded-full transition-colors",
            isDeafened
              ? "bg-[#ed4245]/20 text-[#ed4245] hover:bg-[#ed4245]/30"
              : "bg-[#35373c] text-[#dbdee1] hover:bg-[#404249]"
          )}
          title={isDeafened ? "Activar audio" : "Ensordecerse"}
        >
          {isDeafened ? <HeadphoneOff size={18} /> : <Headphones size={18} />}
        </button>

        <button
          onClick={leaveVoice}
          className="p-2 rounded-full bg-[#ed4245]/20 text-[#ed4245] hover:bg-[#ed4245]/30 transition-colors"
          title="Desconectar"
        >
          <PhoneOff size={18} />
        </button>
      </div>
    </div>
  );
}
