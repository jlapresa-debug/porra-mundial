"use client";

import { useEffect, useRef, useState } from "react";
import { ref, onValue, push, serverTimestamp, query, limitToLast } from "firebase/database";
import { rtdb } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/Button";
import type { ChatMessage } from "@/lib/types";

interface Props {
  groupId: string;
}

export function GroupChat({ groupId }: Props) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rtdb) return;
    const q = query(ref(rtdb, `chats/${groupId}`), limitToLast(100));
    const unsub = onValue(q, (snap) => {
      const list: ChatMessage[] = [];
      snap.forEach((child) => {
        list.push({ id: child.key!, ...(child.val() as Omit<ChatMessage, "id">) });
      });
      setMessages(list.sort((a, b) => a.ts - b.ts));
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
      });
    });
    return () => unsub();
  }, [groupId]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !rtdb || !text.trim()) return;
    setSending(true);
    try {
      await push(ref(rtdb, `chats/${groupId}`), {
        uid: user.uid,
        name: user.displayName || "Anónimo",
        text: text.trim(),
        ts: Date.now(),
        serverTs: serverTimestamp(),
      });
      setText("");
    } finally {
      setSending(false);
    }
  }

  if (!rtdb) {
    return (
      <div className="rounded-2xl bg-bg-card border border-line p-4 text-center text-sm text-muted">
        Configura <code>NEXT_PUBLIC_FIREBASE_DATABASE_URL</code> para activar el chat.
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-bg-card border border-line overflow-hidden flex flex-col" style={{ height: 420 }}>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <div className="text-center text-xs text-muted py-12">Aún nadie ha picado. Lánzate. 🔥</div>
        )}
        {messages.map((m) => {
          const mine = m.uid === user?.uid;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[78%] rounded-2xl px-3 py-2 ${
                  mine ? "bg-gradient-brand text-white" : "bg-bg-elevated border border-line"
                }`}
              >
                {!mine && <div className="text-[10px] font-bold text-brand mb-0.5">{m.name}</div>}
                <div className="text-sm break-words">{m.text}</div>
                <div className={`text-[9px] mt-0.5 ${mine ? "text-white/70" : "text-muted"}`}>
                  {new Date(m.ts).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={send} className="border-t border-line p-2 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Mensaje..."
          maxLength={500}
          className="flex-1 h-10 px-3 rounded-xl bg-bg-elevated border border-line text-sm focus:outline-none focus:border-brand"
        />
        <Button type="submit" size="sm" loading={sending} disabled={!text.trim()}>
          Enviar
        </Button>
      </form>
    </div>
  );
}
