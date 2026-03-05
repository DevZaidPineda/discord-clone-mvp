"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, username, password);
      }
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-discord-bg-darker flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-discord-bg rounded-lg shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            {mode === "login" ? "Welcome back!" : "Create an account"}
          </h1>
          <p className="text-discord-text-muted text-sm">
            {mode === "login"
              ? "We're so excited to see you again!"
              : "Join us and start chatting"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-discord-text-muted mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-discord-bg-darker border-none rounded text-discord-text text-sm focus:outline-none focus:ring-2 focus:ring-discord-channel"
            />
          </div>

          {mode === "register" && (
            <div>
              <label className="block text-xs font-bold uppercase text-discord-text-muted mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                className="w-full px-3 py-2.5 bg-discord-bg-darker border-none rounded text-discord-text text-sm focus:outline-none focus:ring-2 focus:ring-discord-channel"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase text-discord-text-muted mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2.5 bg-discord-bg-darker border-none rounded text-discord-text text-sm focus:outline-none focus:ring-2 focus:ring-discord-channel"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-discord-channel hover:bg-discord-channel-hover text-white font-medium rounded transition-colors disabled:opacity-50"
          >
            {loading ? "Loading..." : mode === "login" ? "Log In" : "Register"}
          </button>
        </form>

        <p className="text-sm text-discord-text-muted mt-4">
          {mode === "login" ? (
            <>Need an account? <Link href="/register" className="text-discord-channel hover:underline">Register</Link></>
          ) : (
            <>Already have an account? <Link href="/login" className="text-discord-channel hover:underline">Log In</Link></>
          )}
        </p>
      </div>
    </div>
  );
}
