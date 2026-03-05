export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  createdAt?: string;
}

export interface Server {
  id: string;
  name: string;
  imageUrl: string | null;
  inviteCode: string;
  ownerId: string;
  channels: Channel[];
  members: ServerMember[];
  _count?: { members: number };
}

export interface ServerMember {
  id: string;
  role: "ADMIN" | "MODERATOR" | "MEMBER";
  userId: string;
  serverId: string;
  user: Pick<User, "id" | "username" | "avatarUrl">;
}

export interface Channel {
  id: string;
  name: string;
  type: "TEXT" | "VOICE";
  serverId: string;
}

// Voice state
export interface VoiceUser {
  userId: string;
  socketId: string;
  username: string;
  muted: boolean;
  deafened: boolean;
}

export interface Message {
  id: string;
  content: string;
  authorId: string;
  channelId: string;
  createdAt: string;
  updatedAt: string;
  deleted: boolean;
  author: Pick<User, "id" | "username" | "avatarUrl">;
}
