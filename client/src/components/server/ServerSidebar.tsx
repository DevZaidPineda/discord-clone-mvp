"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { ChannelList } from "@/components/channel/ChannelList";
import { CreateChannelModal } from "@/components/channel/CreateChannelModal";
import { Avatar } from "@/components/ui/Avatar";
import { Plus, LogOut, Copy, Check } from "lucide-react";
import type { Server } from "@/types";

export function ServerSidebar() {
  const params = useParams();
  const serverId = params?.serverId as string;
  const { user, logout } = useAuth();
  const [server, setServer] = useState<Server | null>(null);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchServer = async () => {
    if (!serverId) return;
    try {
      const data = await api.getServer(serverId);
      setServer(data);
    } catch (err) {
      console.error("Error fetching server:", err);
    }
  };

  useEffect(() => {
    fetchServer();
  }, [serverId]);

  const copyInviteCode = async () => {
    if (!server) return;
    await navigator.clipboard.writeText(server.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!server) {
    return (
      <div className="w-60 bg-discord-dark-400 flex items-center justify-center">
        <div className="animate-pulse text-zinc-500 text-sm">Cargando...</div>
      </div>
    );
  }

  return (
    <>
      <div className="w-60 bg-discord-dark-400 flex flex-col shrink-0">
        {/* Server header */}
        <div className="h-12 px-4 flex items-center justify-between border-b border-discord-dark-500 shadow-sm hover:bg-discord-dark-200/50 cursor-pointer transition-colors">
          <h2 className="font-semibold text-white truncate text-[15px]">{server.name}</h2>
          <button onClick={copyInviteCode} className="text-zinc-400 hover:text-white shrink-0" title="Copiar codigo de invitacion">
            {copied ? <Check className="w-4 h-4 text-discord-green" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Channels */}
        <div className="flex-1 overflow-y-auto px-2 pt-4">
          <div className="flex items-center justify-between px-1 mb-1">
            <span className="text-xs font-semibold uppercase text-zinc-400 tracking-wide">
              Canales de texto
            </span>
            {server.ownerId === user?.id && (
              <button
                onClick={() => setShowCreateChannel(true)}
                className="text-zinc-400 hover:text-white"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>

          <ChannelList channels={server.channels} serverId={server.id} />

          {/* Members */}
          {server.members && server.members.length > 0 && (
            <div className="mt-6">
              <span className="text-xs font-semibold uppercase text-zinc-400 tracking-wide px-1">
                Miembros — {server.members.length}
              </span>
              <div className="mt-2 space-y-0.5">
                {server.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-discord-dark-200/30"
                  >
                    <Avatar username={member.user.username} avatarUrl={member.user.avatarUrl} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-300 truncate">{member.user.username}</p>
                      {member.role !== "MEMBER" && (
                        <p className="text-[10px] text-zinc-500 uppercase">{member.role}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User panel */}
        <div className="h-[52px] bg-discord-dark-500/80 px-2 flex items-center gap-2">
          <Avatar username={user?.username || ""} avatarUrl={user?.avatarUrl} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.username}</p>
          </div>
          <button
            onClick={logout}
            className="text-zinc-400 hover:text-discord-red p-1 rounded transition-colors"
            title="Cerrar sesion"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <CreateChannelModal
        isOpen={showCreateChannel}
        onClose={() => setShowCreateChannel(false)}
        serverId={server.id}
        onCreated={() => {
          setShowCreateChannel(false);
          fetchServer();
        }}
      />
    </>
  );
}
