"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Server } from "@/types";
import { ChannelSidebar } from "@/components/channel/ChannelSidebar";
import { ChatArea } from "@/components/chat/ChatArea";
import { VoiceChannelView } from "@/components/voice/VoiceChannelView";
import { Spinner } from "@/components/ui/Spinner";

export default function ChannelPage() {
  const params = useParams();
  const serverId = params?.serverId as string;
  const channelId = params?.channelId as string;
  const [server, setServer] = useState<Server | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchServer = async () => {
    try {
      const data = await api.getServer(serverId);
      setServer(data);
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

  const channel = server.channels?.find((c) => c.id === channelId);
  const channelName = channel?.name || "unknown";
  const isVoice = channel?.type === "VOICE";

  return (
    <>
      <ChannelSidebar server={server} onChannelCreated={fetchServer} />
      {isVoice ? (
        <VoiceChannelView channelId={channelId} channelName={channelName} />
      ) : (
        <ChatArea channelId={channelId} channelName={channelName} />
      )}
    </>
  );
}
