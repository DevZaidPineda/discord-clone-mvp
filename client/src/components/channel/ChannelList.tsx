"use client";

import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Hash } from "lucide-react";
import type { Channel } from "@/types";

interface Props {
  channels: Channel[];
  serverId: string;
}

export function ChannelList({ channels, serverId }: Props) {
  const router = useRouter();
  const params = useParams();
  const activeChannelId = params?.channelId as string;

  return (
    <div className="space-y-0.5">
      {channels.map((channel) => (
        <button
          key={channel.id}
          onClick={() => router.push(`/servers/${serverId}/channels/${channel.id}`)}
          className={cn(
            "w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-sm transition-colors group",
            activeChannelId === channel.id
              ? "bg-discord-dark-200/60 text-white"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-discord-dark-200/30"
          )}
        >
          <Hash className="w-4 h-4 text-zinc-500 shrink-0" />
          <span className="truncate">{channel.name}</span>
        </button>
      ))}
    </div>
  );
}
