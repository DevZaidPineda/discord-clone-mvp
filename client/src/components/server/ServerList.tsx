"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";
import { cn, getInitials, getAvatarColor } from "@/lib/utils";
import { CreateServerModal } from "./CreateServerModal";
import { Plus, Compass } from "lucide-react";
import type { Server } from "@/types";

export function ServerList() {
  const router = useRouter();
  const params = useParams();
  const [servers, setServers] = useState<Server[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const activeServerId = params?.serverId as string;

  const fetchServers = async () => {
    try {
      const data = await api.getServers();
      setServers(data);
    } catch (err) {
      console.error("Error fetching servers:", err);
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

  const handleServerClick = (server: Server) => {
    const firstChannel = server.channels?.[0];
    if (firstChannel) {
      router.push(`/servers/${server.id}/channels/${firstChannel.id}`);
    } else {
      router.push(`/servers/${server.id}`);
    }
  };

  return (
    <>
      <div className="w-[72px] bg-discord-dark-500 flex flex-col items-center py-3 gap-2 overflow-y-auto shrink-0">
        {/* Home */}
        <button
          onClick={() => router.push("/")}
          className={cn(
            "w-12 h-12 rounded-[24px] hover:rounded-[16px] transition-all duration-200 flex items-center justify-center",
            !activeServerId
              ? "bg-discord-primary rounded-[16px]"
              : "bg-discord-dark-300 hover:bg-discord-primary"
          )}
        >
          <Compass className="w-6 h-6 text-white" />
        </button>

        <div className="w-8 h-0.5 bg-discord-dark-300 rounded-full" />

        {servers.map((server) => (
          <div key={server.id} className="relative group">
            <div
              className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[22px] w-1 rounded-r-full bg-white transition-all",
                activeServerId === server.id ? "h-10" : "h-0 group-hover:h-5"
              )}
            />
            <button
              onClick={() => handleServerClick(server)}
              className={cn(
                "w-12 h-12 rounded-[24px] hover:rounded-[16px] transition-all duration-200 flex items-center justify-center text-white font-semibold text-sm overflow-hidden",
                activeServerId === server.id && "rounded-[16px]"
              )}
              style={{ backgroundColor: getAvatarColor(server.name) }}
              title={server.name}
            >
              {server.imageUrl ? (
                <img src={server.imageUrl} alt={server.name} className="w-full h-full object-cover" />
              ) : (
                getInitials(server.name)
              )}
            </button>
          </div>
        ))}

        <button
          onClick={() => setShowCreateModal(true)}
          className="w-12 h-12 rounded-[24px] hover:rounded-[16px] transition-all duration-200 bg-discord-dark-300 hover:bg-discord-green flex items-center justify-center group"
        >
          <Plus className="w-6 h-6 text-discord-green group-hover:text-white transition-colors" />
        </button>
      </div>

      <CreateServerModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => {
          setShowCreateModal(false);
          fetchServers();
        }}
      />
    </>
  );
}
