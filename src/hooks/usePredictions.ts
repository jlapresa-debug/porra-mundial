"use client";

import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./useAuth";
import type { Prediction, SpecialBets } from "@/lib/types";

export function usePredictions() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
  const [specials, setSpecials] = useState<SpecialBets>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !db) return;
    const unsubP = onSnapshot(collection(db, "users", user.uid, "predictions"), (snap) => {
      const map: Record<string, Prediction> = {};
      snap.forEach((d) => {
        const data = d.data() as Prediction;
        map[d.id] = data;
      });
      setPredictions(map);
      setLoading(false);
    });
    const unsubS = onSnapshot(doc(db, "users", user.uid, "meta", "specials"), (snap) => {
      setSpecials((snap.data() as SpecialBets) || {});
    });
    return () => {
      unsubP();
      unsubS();
    };
  }, [user]);

  async function savePrediction(matchId: string, home: number, away: number, pkWinner?: "home" | "away") {
    if (!user || !db) return;
    const data: Prediction = { matchId, home, away, pkWinner, updatedAt: Date.now() };
    await setDoc(doc(db, "users", user.uid, "predictions", matchId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  async function saveSpecials(partial: Partial<SpecialBets>) {
    if (!user || !db) return;
    await setDoc(
      doc(db, "users", user.uid, "meta", "specials"),
      { ...partial, updatedAt: serverTimestamp() },
      { merge: true },
    );
  }

  return { predictions, specials, loading, savePrediction, saveSpecials };
}
