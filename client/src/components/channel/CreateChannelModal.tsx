"use client";

import { useState, FormEvent } from "react";
import { Hash, Volume2 } from "lucide-react";
import { api } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  serverId: string;
  onCreated: () => void;
}

export function CreateChannelModal({ isOpen, onClose, serverId, onCreated }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"TEXT" | "VOICE">("TEXT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.createChannel(serverId, name, type);
      setName("");
      setType("TEXT");
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crear canal">
      <form onSubmit={handleSubmit} className="space-y-4 mt-3">
        {error && (
          <div className="bg-discord-red/10 border border-discord-red/20 rounded-md p-3">
            <p className="text-sm text-discord-red">{error}</p>
          </div>
        )}

        {/* Channel Type Selector */}
        <div>
          <label className="block text-xs font-bold uppercase text-[#949ba4] mb-2">
            Tipo de canal
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType("TEXT")}
              className={cn(
                "flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 transition-all",
                type === "TEXT"
                  ? "border-[#5865f2] bg-[#5865f2]/10 text-white"
                  : "border-[#3f4147] bg-[#2b2d31] text-[#949ba4] hover:border-[#4f5157]"
              )}
            >
              <Hash size={18} />
              <span className="text-sm font-medium">Texto</span>
            </button>
            <button
              type="button"
              onClick={() => setType("VOICE")}
              className={cn(
                "flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 transition-all",
                type === "VOICE"
                  ? "border-[#5865f2] bg-[#5865f2]/10 text-white"
                  : "border-[#3f4147] bg-[#2b2d31] text-[#949ba4] hover:border-[#4f5157]"
              )}
            >
              <Volume2 size={18} />
              <span className="text-sm font-medium">Voz</span>
            </button>
          </div>
        </div>

        <Input
          label="Nombre del canal"
          value={name}
          onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
          placeholder={type === "TEXT" ? "nuevo-canal" : "sala-de-voz"}
          required
        />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            Crear canal
          </Button>
        </div>
      </form>
    </Modal>
  );
}
