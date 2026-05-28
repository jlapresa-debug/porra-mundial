"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/Header";

export default function LoginPage() {
  const { signInEmail, signInGoogle, configured } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInEmail(email, password);
      router.replace("/matches");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    setError(null);
    try {
      await signInGoogle();
      router.replace("/matches");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen pb-12">
      <Header title="Bienvenido" back="/" />

      <div className="container-app mt-8">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <Input
            label="Email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              {error}
            </div>
          )}
          <Button type="submit" size="lg" loading={loading} disabled={!configured}>
            Entrar
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-line" />
          <span className="text-xs text-muted uppercase tracking-wider">o</span>
          <div className="flex-1 h-px bg-line" />
        </div>

        <Button variant="secondary" size="lg" fullWidth onClick={handleGoogle} disabled={!configured || loading}>
          Continuar con Google
        </Button>

        <p className="text-sm text-muted text-center mt-8">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-brand font-medium">
            Regístrate
          </Link>
        </p>
      </div>
    </main>
  );
}
