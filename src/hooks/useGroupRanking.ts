"use client";

import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ExpressPrediction, GroupMemberScore, MatchPick, SpecialBets } from "@/lib/types";
import { ALL_MATCHES } from "@/lib/matches";
import { DEFAULT_RULES, totalScore } from "@/lib/scoring";
import { EXPRESS_OUTCOMES } from "@/lib/express";
import { TOURNAMENT_OUTCOME, LEAGUE_MATCH_RESULTS } from "@/lib/results";
import { getFinalTop8 } from "@/lib/standings";

const OUTCOME = { ...TOURNAMENT_OUTCOME, top8: getFinalTop8(ALL_MATCHES, LEAGUE_MATCH_RESULTS) ?? undefined };

export function useGroupRanking(memberIds: string[]) {
  const [ranking, setRanking] = useState<GroupMemberScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!db || memberIds.length === 0) {
        setRanking([]);
        setLoading(false);
        return;
      }
      setLoading(true);

      const results = await Promise.all(
        memberIds.map(async (uid) => {
          const profileDoc = await getDoc(doc(db!, "users", uid));
          const profile = profileDoc.data() ?? { displayName: "Anónimo", photoURL: null };

          const predsSnap = await getDocs(collection(db!, "users", uid, "predictions"));
          const matchPredictions: Record<string, MatchPick> = {};
          predsSnap.forEach((d) => {
            const pick = d.data().pick as MatchPick | undefined;
            if (pick) matchPredictions[d.id] = pick;
          });

          const specialsDoc = await getDoc(doc(db!, "users", uid, "meta", "specials"));
          const specials = (specialsDoc.data() as SpecialBets) ?? {};

          const expressSnap = await getDocs(collection(db!, "users", uid, "express"));
          const expressPredictions: Record<string, ExpressPrediction> = {};
          expressSnap.forEach((d) => {
            expressPredictions[d.id] = d.data() as ExpressPrediction;
          });

          const { total, leagueHits, koHits, top8Hits } = totalScore(
            matchPredictions,
            specials,
            ALL_MATCHES,
            OUTCOME,
            DEFAULT_RULES,
            expressPredictions,
            EXPRESS_OUTCOMES,
          );

          return {
            uid,
            displayName: (profile.displayName as string) ?? "Anónimo",
            photoURL: (profile.photoURL as string | null) ?? null,
            points: total,
            leagueHits,
            koHits,
            top8Hits,
          };
        }),
      );

      if (!cancelled) {
        setRanking(results.sort((a, b) =>
          b.points - a.points ||
          b.leagueHits - a.leagueHits ||
          b.koHits - a.koHits
        ));
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberIds.join(",")]);

  return { ranking, loading };
}
