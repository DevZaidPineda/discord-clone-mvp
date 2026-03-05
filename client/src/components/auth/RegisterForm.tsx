"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await register(email, username, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white">Crear una cuenta</h1>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <Input label="Correo electrónico" type="email" value={email}
        onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" required />
      <Input label="Nombre de usuario" value={username}
        onChange={(e) => setUsername(e.target.value)} placeholder="MiNombre" minLength={3} maxLength={20} required />
      <Input label="Contraseña" type="password" value={password}
        onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" minLength={6} required />

      <Button type="submit" loading={loading} className="w-full" size="lg">
        Continuar
      </Button>

      <p className="text-sm text-zinc-400">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-[#5865f2] hover:underline">Iniciar sesión</Link>
      </p>
    </form>
  );
}