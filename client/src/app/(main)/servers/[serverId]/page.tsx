"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Server } from "@/types";
import { ChannelSidebar } from "@/components/channel/ChannelSidebar";
import { Spinner } from "@/components/ui/Spinner";

export default function ServerPage() {
  const router = useRouter();
  const params = useParams();
  const serverId = params?.serverId as string;
  const [server, setServer] = useState<Server | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchServer = async () => {
    try {
      const data = await api.getServer(serverId);
      setServer(data);
      // Auto-redirect to first channel
      if (data.channels?.length > 0) {
        router.replace(`/servers/${serverId}/channels/${data.channels[0].id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServer();
  }, [serverId]);

  if (loading || !server) {
    return (
      <div className="flex-1 flex items-center justify-center bg-discord-bg">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <ChannelSidebar server={server} onChannelCreated={fetchServer} />
      <div className="flex-1 flex items-center justify-center bg-discord-bg">
        <p className="text-discord-text-muted">Select a channel to start chatting</p>
      </div>
    </>
  );
}
