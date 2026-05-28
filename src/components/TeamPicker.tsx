"use client";

import { useState } from "react";
import { TEAMS } from "@/lib/teams";
import { TeamBadge } from "./TeamBadge";
import { cn } from "@/lib/cn";

interface Props {
  value?: string;
  onChange: (code: string) => void;
  placeholder?: string;
}

export function TeamPicker({ value, onChange, placeholder = "Seleccionar selección" }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const selected = TEAMS.find((t) => t.code === value);
  const filtered = TEAMS.filter((t) =>
    t.name.toLowerCase().includes(q.toLowerCase()) || t.code.toLowerCase().includes(q.toLowerCase()),
  ).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "w-full flex items-center gap-3 px-4 h-14 rounded-xl bg-bg-card border border-line text-left transition hover:border-brand/40",
          !selected && "text-muted",
        )}
      >
        {selected ? (
          <>
            <TeamBadge team={selected} size="sm" showName={false} />
            <span className="font-medium">{selected.name}</span>
          </>
        ) : (
          <span>{placeholder}</span>
        )}
        <span className="ml-auto text-muted">›</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-bg/80 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)}>
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-bg-elevated border-t border-line max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-line">
              <div className="w-10 h-1 bg-line rounded-full mx-auto mb-3" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar selección..."
                className="w-full h-11 px-4 rounded-xl bg-bg-card border border-line text-white placeholder:text-muted focus:outline-none focus:border-brand"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {filtered.map((t) => (
                <button
                  key={t.code}
                  onClick={() => {
                    onChange(t.code);
                    setOpen(false);
                    setQ("");
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-bg-card transition",
                    value === t.code && "bg-brand/10 ring-1 ring-brand/30",
                  )}
                >
                  <TeamBadge team={t} size="sm" showName={false} />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{t.name}</div>
                    <div className="text-[10px] text-muted">Grupo {t.group} · {t.confederation}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
