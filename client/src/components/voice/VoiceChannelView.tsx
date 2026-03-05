"use client";

import { useEffect } from "react";
import { Volume2, Mic, MicOff, HeadphoneOff } from "lucide-react";
import { useVoice } from "@/providers/VoiceProvider";
import { useAuth } from "@/providers/AuthProvider";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import type { VoiceUser } from "@/types";

interface Props {
  channelId: string;
  channelName: string;
}

export function VoiceChannelView({ channelId, channelName }: Props) {
  const { user } = useAuth();
  const {
    isConnected,
    currentChannelId,
    voiceUsers,
    isMuted,
    isDeafened,
    isSpeaking,
    joinVoice,
    voiceStates,
  } = useVoice();

  const isInThisChannel = isConnected && currentChannelId === channelId;

  // Get users in this channel from global state
  const channelVoiceUsers = voiceStates.get(channelId) || [];

  return (
    <div className="flex-1 flex flex-col bg-[#313338]">
      {/* Header */}
      <div className="h-12 px-4 flex items-center gap-2 border-b border-[#1e1f22] shadow-sm shrink-0">
        <Volume2 size={22} className="text-[#949ba4]" />
        <span className="text-white font-semibold text-[15px]">{channelName}</span>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {!isInThisChannel ? (
          /* Not connected - show join button */
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#5865f2]/20 flex items-center justify-center">
              <Volume2 size={40} className="text-[#5865f2]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{channelName}</h2>
            <p className="text-[#949ba4] text-sm mb-6">
              {channelVoiceUsers.length > 0
                ? `${channelVoiceUsers.length} usuario(s) conectado(s)`
                : "Nadie en el canal de voz"}
            </p>

            {/* Show connected users */}
            {channelVoiceUsers.length > 0 && (
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {channelVoiceUsers.map((vu) => (
                  <VoiceUserBadge key={vu.userId} user={vu} isMe={vu.userId === user?.id} />
                ))}
              </div>
            )}

            <button
              onClick={() => joinVoice(channelId)}
              className="px-6 py-2.5 bg-[#23a559] hover:bg-[#1a8f4a] text-white font-semibold rounded-lg transition-colors"
            >
              Unirse al canal de voz
            </button>
          </div>
        ) : (
          /* Connected - show users grid */
          <div className="w-full max-w-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#23a559]/20 rounded-full mb-4">
                <div className="w-2 h-2 rounded-full bg-[#23a559] animate-pulse" />
                <span className="text-[#23a559] text-sm font-semibold">Conectado a voz</span>
              </div>
              <h2 className="text-xl font-bold text-white">{channelName}</h2>
            </div>

            {/* Users grid */}
            <div className="flex flex-wrap justify-center gap-6">
              {/* Current user */}
              {user && (
                <VoiceUserCard
                  username={user.username}
                  isMe={true}
                  isMuted={isMuted}
                  isDeafened={isDeafened}
                  isSpeaking={isSpeaking}
                />
              )}

              {/* Other users */}
              {voiceUsers.map((vu) => (
                <VoiceUserCard
                  key={vu.userId}
                  username={vu.username}
                  isMe={false}
                  isMuted={vu.muted}
                  isDeafened={vu.deafened}
                  isSpeaking={false}
                />
              ))}
            </div>

            {voiceUsers.length === 0 && (
              <p className="text-center text-[#949ba4] text-sm mt-6">
                Esperando a que otros se unan...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function VoiceUserCard({
  username,
  isMe,
  isMuted,
  isDeafened,
  isSpeaking,
}: {
  username: string;
  isMe: boolean;
  isMuted: boolean;
  isDeafened: boolean;
  isSpeaking: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          "relative rounded-full p-1 transition-all",
          isSpeaking && !isMuted ? "ring-2 ring-[#23a559] ring-offset-2 ring-offset-[#313338]" : ""
        )}
      >
        <Avatar username={username} size="lg" />

        {/* Muted/deafened indicator */}
        {(isMuted || isDeafened) && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#ed4245] flex items-center justify-center border-[3px] border-[#313338]">
            {isDeafened ? (
              <HeadphoneOff size={10} className="text-white" />
            ) : (
              <MicOff size={10} className="text-white" />
            )}
          </div>
        )}
      </div>

      <span className="text-sm text-[#dbdee1] font-medium">
        {username}
        {isMe && <span className="text-[#949ba4] text-xs ml-1">(tú)</span>}
      </span>
    </div>
  );
}

function VoiceUserBadge({ user, isMe }: { user: VoiceUser; isMe: boolean }) {
  return (
    <div className="flex items-center gap-2 bg-[#2b2d31] px-3 py-1.5 rounded-full">
      <Avatar username={user.username} size="sm" />
      <span className="text-sm text-[#dbdee1]">
        {user.username}
        {isMe && <span className="text-xs text-[#949ba4] ml-1">(tú)</span>}
      </span>
      {user.muted && <MicOff size={12} className="text-[#ed4245]" />}
    </div>
  );
}
