"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Hash, Volume2, Plus, ChevronDown, Copy, Check, MicOff, HeadphoneOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Server } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { CreateChannelModal } from "./CreateChannelModal";
import { VoiceControls } from "@/components/voice/VoiceControls";
import { useVoice } from "@/providers/VoiceProvider";

interface Props {
  server: Server;
  onChannelCreated: () => void;
}

export function ChannelSidebar({ server, onChannelCreated }: Props) {
  const router = useRouter();
  const params = useParams();
  const activeChannelId = params?.channelId as string;
  const [showCreate, setShowCreate] = useState(false);
  const [copied, setCopied] = useState(false);
  const { voiceStates, currentChannelId: activeVoiceChannel, isConnected } = useVoice();

  const copyInvite = () => {
    navigator.clipboard.writeText(server.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const textChannels = server.channels?.filter((c) => c.type === "TEXT") || [];
  const voiceChannels = server.channels?.filter((c) => c.type === "VOICE") || [];

  return (
    <>
      <div className="w-60 bg-discord-sidebar flex flex-col shrink-0">
        {/* Server Header */}
        <div className="h-12 px-4 flex items-center justify-between border-b border-black/30 shadow-sm">
          <h2 className="font-bold text-white text-[15px] truncate">{server.name}</h2>
          <ChevronDown size={18} className="text-discord-text-muted shrink-0" />
        </div>

        {/* Invite Code Banner */}
        <div className="px-3 py-2">
          <button
            onClick={copyInvite}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded bg-discord-bg-darker/50 hover:bg-discord-bg-darker text-xs transition-colors"
          >
            {copied ? <Check size={14} className="text-discord-green" /> : <Copy size={14} className="text-discord-text-muted" />}
            <span className="text-discord-text-muted">
              {copied ? "Copied!" : `Invite: ${server.inviteCode}`}
            </span>
          </button>
        </div>

        {/* Channels */}
        <div className="flex-1 overflow-y-auto px-2 pt-2">
          {/* TEXT CHANNELS */}
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-xs font-semibold uppercase text-discord-text-muted tracking-wide">
              Text Channels
            </span>
            <button
              onClick={() => setShowCreate(true)}
              className="text-discord-text-muted hover:text-discord-text transition-colors"
              title="Create Channel"
            >
              <Plus size={16} />
            </button>
          </div>

          {textChannels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => router.push(`/servers/${server.id}/channels/${channel.id}`)}
              className={cn(
                "w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-sm transition-colors mb-0.5",
                activeChannelId === channel.id
                  ? "bg-discord-hover-strong text-white"
                  : "text-discord-text-muted hover:text-discord-text hover:bg-discord-hover"
              )}
            >
              <Hash size={18} className="shrink-0 opacity-60" />
              <span className="truncate">{channel.name}</span>
            </button>
          ))}

          {/* VOICE CHANNELS */}
          {(voiceChannels.length > 0 || textChannels.length > 0) && (
            <div className="flex items-center justify-between px-1 mb-1 mt-4">
              <span className="text-xs font-semibold uppercase text-discord-text-muted tracking-wide">
                Voice Channels
              </span>
              <button
                onClick={() => setShowCreate(true)}
                className="text-discord-text-muted hover:text-discord-text transition-colors"
                title="Create Channel"
              >
                <Plus size={16} />
              </button>
            </div>
          )}

          {voiceChannels.map((channel) => {
            const voiceUsers = voiceStates.get(channel.id) || [];
            const isActiveVoice = isConnected && activeVoiceChannel === channel.id;

            return (
              <div key={channel.id}>
                <button
                  onClick={() => router.push(`/servers/${server.id}/channels/${channel.id}`)}
                  className={cn(
                    "w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-sm transition-colors mb-0.5",
                    activeChannelId === channel.id
                      ? "bg-discord-hover-strong text-white"
                      : "text-discord-text-muted hover:text-discord-text hover:bg-discord-hover"
                  )}
                >
                  <Volume2 size={18} className={cn("shrink-0 opacity-60", isActiveVoice && "text-[#23a559] opacity-100")} />
                  <span className="truncate">{channel.name}</span>
                  {voiceUsers.length > 0 && (
                    <span className="ml-auto text-xs text-[#949ba4] bg-[#35373c] px-1.5 rounded-full">
                      {voiceUsers.length}
                    </span>
                  )}
                </button>

                {/* Show connected users under voice channel */}
                {voiceUsers.length > 0 && (
                  <div className="ml-6 mb-1">
                    {voiceUsers.map((vu) => (
                      <div
                        key={vu.userId}
                        className="flex items-center gap-2 px-2 py-0.5 text-xs text-[#949ba4] rounded hover:bg-discord-hover"
                      >
                        <div className="w-5 h-5 rounded-full bg-[#35373c] flex items-center justify-center text-[10px] text-white font-semibold">
                          {vu.username[0].toUpperCase()}
                        </div>
                        <span className="truncate">{vu.username}</span>
                        {vu.muted && <MicOff size={10} className="text-[#ed4245] shrink-0" />}
                        {vu.deafened && <HeadphoneOff size={10} className="text-[#ed4245] shrink-0" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Voice Controls (shown when in a voice call) */}
        <VoiceControls />

        {/* Members List */}
        <div className="border-t border-black/20 px-2 py-2 max-h-48 overflow-y-auto">
          <span className="text-xs font-semibold uppercase text-discord-text-muted tracking-wide px-1 mb-1 block">
            Members — {server.members?.length || 0}
          </span>
          {server.members?.map((member) => (
            <div key={member.id} className="flex items-center gap-2 px-1 py-1 rounded hover:bg-discord-hover">
              <Avatar username={member.user.username} avatarUrl={member.user.avatarUrl} size="sm" />
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm text-discord-text truncate">{member.user.username}</span>
                {member.role === "ADMIN" && (
                  <span className="text-[10px] bg-discord-channel/20 text-discord-channel px-1 rounded font-semibold">ADMIN</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <CreateChannelModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        serverId={server.id}
        onCreated={onChannelCreated}
      />
    </>
  );
}
