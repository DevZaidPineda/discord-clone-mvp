"use client";

import { useState, FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { api } from "@/lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
  onJoined: () => void;
}

export function JoinServerModal({ open, onClose, onJoined }: Props) {
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setLoading(true);
    setError("");
    try {
      await api.joinServer(inviteCode.trim());
      setInviteCode("");
      onJoined();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Join a Server">
      <p className="text-discord-text-muted text-sm mb-4">
        Enter an invite code to join an existing server.
      </p>
      <form onSubmit={handleSubmit}>
        <label className="block text-xs font-bold uppercase text-discord-text-muted mb-2">
          Invite Code
        </label>
        <input
          type="text"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          placeholder="e.g. abc123"
          className="w-full px-3 py-2.5 bg-discord-bg-darker rounded text-discord-text text-sm focus:outline-none focus:ring-2 focus:ring-discord-channel"
          autoFocus
        />
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-discord-text-muted hover:text-white transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading || !inviteCode.trim()} className="px-4 py-2 bg-discord-channel hover:bg-discord-channel-hover text-white text-sm font-medium rounded transition-colors disabled:opacity-50">
            {loading ? "Joining..." : "Join Server"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
