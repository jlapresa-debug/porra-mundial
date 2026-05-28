"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useGroups } from "@/hooks/useGroups";

export default function JoinGroupPage() {
  const router = useRouter();
  const { joinByCode } = useGroups();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const g = await joinByCode(code.trim());
      router.replace(`/groups/${g.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <Header title="Unirme a un grupo" back="/groups" />

      <form onSubmit={handleSubmit} className="container-app mt-6 grid gap-4">
        <Input
          label="Código de invitación"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ABCD23"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          maxLength={8}
          className="font-mono tracking-[0.3em] text-center text-lg"
          required
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" size="lg" loading={loading} disabled={code.length < 4}>
          Unirme
        </Button>
      </form>
    </AppShell>
  );
}
