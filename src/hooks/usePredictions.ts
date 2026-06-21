"use client";

import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./useAuth";
import type { ExpressPrediction, SpecialBets } from "@/lib/types";

// Almacenamiento en Firestore (colección predictions ya tiene reglas):
//   users/{uid}/predictions/GROUP_A  → { group, order: [t1,t2,t3,t4] }
//   users/{uid}/predictions/M73      → { matchId, winner: teamCode }
//   users/{uid}/meta/specials        → SpecialBets

export function usePredictions() {
  const { user } = useAuth();

  // group → ordered array of 4 team codes (pos 0 = 1°)
  const [groupPredictions, setGroupPredictions] = useState<Record<string, string[]>>({});
  // matchId → winning team code
  const [knockoutPredictions, setKnockoutPredictions] = useState<Record<string, string>>({});
  const [specials, setSpecials] = useState<SpecialBets>({});
  const [expressPredictions, setExpressPredictions] = useState<Record<string, ExpressPrediction>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !db) return;

    const unsubP = onSnapshot(
      collection(db, "users", user.uid, "predictions"),
      (snap) => {
        const groups: Record<string, string[]> = {};
        const ko: Record<string, string> = {};
        snap.forEach((d) => {
          if (d.id.startsWith("GROUP_")) {
            const group = d.id.replace("GROUP_", "");
            const order = d.data().order;
            if (Array.isArray(order)) groups[group] = order;
          } else {
            const winner = d.data().winner as string | undefined;
            if (winner) ko[d.id] = winner;
          }
        });
        setGroupPredictions(groups);
        setKnockoutPredictions(ko);
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

  async function saveGroupPrediction(group: string, order: string[]) {
    if (!user || !db) return;
    await setDoc(
      doc(db, "users", user.uid, "predictions", `GROUP_${group}`),
      { group, order, updatedAt: serverTimestamp() },
    );
  }

  async function saveKnockoutWinner(matchId: string, winner: string) {
    if (!user || !db) return;
    await setDoc(
      doc(db, "users", user.uid, "predictions", matchId),
      { matchId, winner, updatedAt: serverTimestamp() },
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
    groupPredictions,
    knockoutPredictions,
    specials,
    expressPredictions,
    loading,
    saveGroupPrediction,
    saveKnockoutWinner,
    saveSpecials,
    saveExpressPrediction,
  };
}
