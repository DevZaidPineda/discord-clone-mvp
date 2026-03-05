"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateServerModal({ isOpen, onClose, onCreated }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<"create" | "join">("create");
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let server;
      if (mode === "create") {
        server = await api.createServer(name);
      } else {
        server = await api.joinServer(inviteCode);
      }

      setName("");
      setInviteCode("");
      onCreated();

      const firstChannel = server.channels?.[0];
      if (firstChannel) {
        router.push(`/servers/${server.id}/channels/${firstChannel.id}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === "create" ? "Crea tu servidor" : "Unirse a un servidor"}>
      <div className="flex gap-2 mb-5">
        <button
          type="button"
          onClick={() => { setMode("create"); setError(""); }}
          className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${
            mode === "create"
              ? "bg-discord-primary text-white"
              : "bg-discord-dark-200 text-zinc-400 hover:text-white"
          }`}
        >
          Crear
        </button>
        <button
          type="button"
          onClick={() => { setMode("join"); setError(""); }}
          className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${
            mode === "join"
              ? "bg-discord-primary text-white"
              : "bg-discord-dark-200 text-zinc-400 hover:text-white"
          }`}
        >
          Unirse
        </button>
      </div>

      {error && (
        <div className="bg-discord-red/10 border border-discord-red/20 rounded-md p-3 mb-4">
          <p className="text-sm text-discord-red">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "create" ? (
          <>
            <p className="text-sm text-zinc-400">
              Tu servidor es donde tu y tus amigos pasan el rato. Crea el tuyo y comienza a hablar.
            </p>
            <Input
              label="Nombre del servidor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mi servidor"
              required
            />
          </>
        ) : (
          <>
            <p className="text-sm text-zinc-400">
              Ingresa el codigo de invitacion para unirte a un servidor existente.
            </p>
            <Input
              label="Codigo de invitacion"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="ej: abc123XY"
              required
            />
          </>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            {mode === "create" ? "Crear" : "Unirse"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
