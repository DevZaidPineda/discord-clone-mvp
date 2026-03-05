"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { getSocket } from "@/lib/socket";
import type { VoiceUser } from "@/types";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

interface PeerConnection {
  pc: RTCPeerConnection;
  userId: string;
  username: string;
}

export function useVoiceChat() {
  const [isConnected, setIsConnected] = useState(false);
  const [currentChannelId, setCurrentChannelId] = useState<string | null>(null);
  const [voiceUsers, setVoiceUsers] = useState<VoiceUser[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, PeerConnection>>(new Map());
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  const cleanup = useCallback(() => {
    // Stop local stream
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;

    // Close all peer connections
    peersRef.current.forEach(({ pc }) => pc.close());
    peersRef.current.clear();

    // Remove audio elements
    audioElementsRef.current.forEach((audio) => {
      audio.pause();
      audio.srcObject = null;
      audio.remove();
    });
    audioElementsRef.current.clear();
  }, []);

  const createPeerConnection = useCallback(
    (socketId: string, userId: string, username: string): RTCPeerConnection => {
      const pc = new RTCPeerConnection(ICE_SERVERS);

      // Add local tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!);
        });
      }

      // Handle incoming tracks (remote audio)
      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        let audio = audioElementsRef.current.get(socketId);
        if (!audio) {
          audio = new Audio();
          audio.autoplay = true;
          audio.playsInline = true;
          audioElementsRef.current.set(socketId, audio);
        }
        audio.srcObject = remoteStream;
      };

      // ICE candidates
      const socket = getSocket();
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket?.emit("voice:ice-candidate", {
            to: socketId,
            candidate: event.candidate.toJSON(),
          });
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
          console.warn(`Voice peer ${username} connection ${pc.connectionState}`);
        }
      };

      peersRef.current.set(socketId, { pc, userId, username });
      return pc;
    },
    []
  );

  // ── Join Voice Channel ──
  const joinVoice = useCallback(
    async (channelId: string) => {
      const socket = getSocket();
      if (!socket) return;

      try {
        // Get microphone access
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        });
        localStreamRef.current = stream;

        // Set up speaking detection
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 256;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkSpeaking = () => {
          if (!localStreamRef.current) return;
          analyser.getByteFrequencyData(dataArray);
          const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setIsSpeaking(avg > 15);
          requestAnimationFrame(checkSpeaking);
        };
        checkSpeaking();

        // Tell server we're joining
        socket.emit("voice:join", { channelId });
        setCurrentChannelId(channelId);
        setIsConnected(true);
        setIsMuted(false);
        setIsDeafened(false);
      } catch (err) {
        console.error("Failed to get microphone:", err);
        alert("No se pudo acceder al micrófono. Verifica los permisos del navegador.");
      }
    },
    []
  );

  // ── Leave Voice Channel ──
  const leaveVoice = useCallback(() => {
    const socket = getSocket();
    if (socket && currentChannelId) {
      socket.emit("voice:leave", { channelId: currentChannelId });
    }
    cleanup();
    setIsConnected(false);
    setCurrentChannelId(null);
    setVoiceUsers([]);
    setIsMuted(false);
    setIsDeafened(false);
    setIsSpeaking(false);
  }, [currentChannelId, cleanup]);

  // ── Toggle Mute ──
  const toggleMute = useCallback(() => {
    const socket = getSocket();
    const newMuted = !isMuted;
    setIsMuted(newMuted);

    // Mute/unmute local track
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !newMuted;
      });
    }

    if (socket && currentChannelId) {
      socket.emit("voice:toggle-mute", { channelId: currentChannelId, muted: newMuted });
    }
  }, [isMuted, currentChannelId]);

  // ── Toggle Deafen ──
  const toggleDeafen = useCallback(() => {
    const socket = getSocket();
    const newDeafened = !isDeafened;
    setIsDeafened(newDeafened);

    // If deafening, also mute
    if (newDeafened) {
      setIsMuted(true);
      localStreamRef.current?.getAudioTracks().forEach((t) => {
        t.enabled = false;
      });
    }

    // Mute/unmute all remote audio
    audioElementsRef.current.forEach((audio) => {
      audio.muted = newDeafened;
    });

    if (socket && currentChannelId) {
      socket.emit("voice:toggle-deafen", { channelId: currentChannelId, deafened: newDeafened });
    }
  }, [isDeafened, currentChannelId]);

  // ── Socket Event Listeners ──
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // When we get the list of existing users in the room
    const handleRoomUsers = async (data: { channelId: string; users: VoiceUser[] }) => {
      setVoiceUsers(data.users);

      // Create offers for each existing user
      for (const user of data.users) {
        const pc = createPeerConnection(user.socketId, user.userId, user.username);
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("voice:offer", { to: user.socketId, offer });
        } catch (err) {
          console.error("Failed to create offer:", err);
        }
      }
    };

    // When a new user joins
    const handleUserJoined = (data: VoiceUser) => {
      setVoiceUsers((prev) => [...prev.filter((u) => u.userId !== data.userId), data]);
    };

    // When a user leaves
    const handleUserLeft = (data: { userId: string; socketId: string }) => {
      setVoiceUsers((prev) => prev.filter((u) => u.userId !== data.userId));
      const peer = peersRef.current.get(data.socketId);
      if (peer) {
        peer.pc.close();
        peersRef.current.delete(data.socketId);
      }
      const audio = audioElementsRef.current.get(data.socketId);
      if (audio) {
        audio.pause();
        audio.srcObject = null;
        audioElementsRef.current.delete(data.socketId);
      }
    };

    // WebRTC: Receive offer
    const handleOffer = async (data: {
      from: string;
      fromUserId: string;
      fromUsername: string;
      offer: RTCSessionDescriptionInit;
    }) => {
      const pc = createPeerConnection(data.from, data.fromUserId, data.fromUsername);
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("voice:answer", { to: data.from, answer });
      } catch (err) {
        console.error("Failed to handle offer:", err);
      }
    };

    // WebRTC: Receive answer
    const handleAnswer = async (data: { from: string; answer: RTCSessionDescriptionInit }) => {
      const peer = peersRef.current.get(data.from);
      if (peer) {
        try {
          await peer.pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        } catch (err) {
          console.error("Failed to set answer:", err);
        }
      }
    };

    // WebRTC: Receive ICE candidate
    const handleIceCandidate = async (data: { from: string; candidate: RTCIceCandidateInit }) => {
      const peer = peersRef.current.get(data.from);
      if (peer) {
        try {
          await peer.pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (err) {
          console.error("Failed to add ICE candidate:", err);
        }
      }
    };

    // Mute/deafen state updates
    const handleUserMuted = (data: { userId: string; muted: boolean }) => {
      setVoiceUsers((prev) =>
        prev.map((u) => (u.userId === data.userId ? { ...u, muted: data.muted } : u))
      );
    };

    const handleUserDeafened = (data: { userId: string; deafened: boolean; muted: boolean }) => {
      setVoiceUsers((prev) =>
        prev.map((u) =>
          u.userId === data.userId ? { ...u, deafened: data.deafened, muted: data.muted } : u
        )
      );
    };

    socket.on("voice:room-users", handleRoomUsers);
    socket.on("voice:user-joined", handleUserJoined);
    socket.on("voice:user-left", handleUserLeft);
    socket.on("voice:offer", handleOffer);
    socket.on("voice:answer", handleAnswer);
    socket.on("voice:ice-candidate", handleIceCandidate);
    socket.on("voice:user-muted", handleUserMuted);
    socket.on("voice:user-deafened", handleUserDeafened);

    return () => {
      socket.off("voice:room-users", handleRoomUsers);
      socket.off("voice:user-joined", handleUserJoined);
      socket.off("voice:user-left", handleUserLeft);
      socket.off("voice:offer", handleOffer);
      socket.off("voice:answer", handleAnswer);
      socket.off("voice:ice-candidate", handleIceCandidate);
      socket.off("voice:user-muted", handleUserMuted);
      socket.off("voice:user-deafened", handleUserDeafened);
    };
  }, [createPeerConnection]);

  return {
    isConnected,
    currentChannelId,
    voiceUsers,
    isMuted,
    isDeafened,
    isSpeaking,
    joinVoice,
    leaveVoice,
    toggleMute,
    toggleDeafen,
  };
}
