"use client";

import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./useAuth";
import type { ExpressPrediction, MatchPick, SpecialBets } from "@/lib/types";

// Almacenamiento en Firestore:
//   users/{uid}/predictions/{matchId} → { matchId, pick: TeamCode | "draw" }
//   users/{uid}/meta/specials         → SpecialBets
//   users/{uid}/express/{betId}       → ExpressPrediction

export function usePredictions() {
  const { user } = useAuth();

  // matchId → pronóstico (código de equipo ganador, o "draw")
  const [matchPredictions, setMatchPredictions] = useState<Record<string, MatchPick>>({});
  const [specials, setSpecials] = useState<SpecialBets>({});
  const [expressPredictions, setExpressPredictions] = useState<Record<string, ExpressPrediction>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !db) return;

    const unsubP = onSnapshot(
      collection(db, "users", user.uid, "predictions"),
      (snap) => {
        const picks: Record<string, MatchPick> = {};
        snap.forEach((d) => {
          const pick = d.data().pick as MatchPick | undefined;
          if (pick) picks[d.id] = pick;
        });
        setMatchPredictions(picks);
        setLoading(false);
      },
    );

    const unsubS = onSnapshot(
      doc(db, "users", user.uid, "meta", "specials"),
      (snap) => setSpecials((snap.data() as SpecialBets) || {}),
    );

    const unsubE = onSnapshot(
      collection(db, "users", user.uid, "express"),
      (snap) => {
        const map: Record<string, ExpressPrediction> = {};
        snap.forEach((d) => {
          map[d.id] = d.data() as ExpressPrediction;
        });
        setExpressPredictions(map);
      },
    );

    return () => { unsubP(); unsubS(); unsubE(); };
  }, [user]);

  async function saveMatchPick(matchId: string, pick: MatchPick) {
    if (!user || !db) return;
    await setDoc(
      doc(db, "users", user.uid, "predictions", matchId),
      { matchId, pick, updatedAt: serverTimestamp() },
    );
  }

  async function saveSpecials(partial: Partial<SpecialBets>) {
    if (!user || !db) return;
    await setDoc(
      doc(db, "users", user.uid, "meta", "specials"),
      { ...partial, updatedAt: serverTimestamp() },
      { merge: true },
    );
  }

  async function saveExpressPrediction(betId: string, data: Omit<ExpressPrediction, "betId" | "updatedAt">) {
    if (!user || !db) return;
    await setDoc(
      doc(db, "users", user.uid, "express", betId),
      { betId, ...data, updatedAt: serverTimestamp() },
      { merge: true },
    );
  }

  return {
    matchPredictions,
    specials,
    expressPredictions,
    loading,
    saveMatchPick,
    saveSpecials,
    saveExpressPrediction,
  };
}
