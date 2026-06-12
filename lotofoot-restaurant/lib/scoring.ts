/**
 * ⚽ SYSTÈME DE POINTS — LOTO FOOT RESTAURANT
 * ============================================
 * 🎯 Score exact   = 3 points  (ex: pronostic France 2-1 Sénégal, résultat 2-1)
 * ✓  Bon résultat  = 1 point   (ex: pronostic 2-1, France gagne 3-0)
 * ✗  Mauvais       = 0 point
 *
 * Le score pris en compte est celui du temps réglementaire
 * (90 minutes + arrêts de jeu, sans prolongations ni tirs au but).
 *
 * ⚠️ Ce fichier est la SEULE source de vérité du barème côté application.
 *    La fonction SQL `calculate_points` dans supabase/schema.sql
 *    implémente exactement la même règle côté base de données.
 */

export const POINTS = {
  EXACT_SCORE: 3,
  CORRECT_RESULT: 1,
  WRONG: 0,
} as const;

export type Outcome = '1' | 'N' | '2';

/** Déduit l'issue 1/N/2 à partir d'un score. */
export function outcomeFromScore(home: number, away: number): Outcome {
  if (home > away) return '1';
  if (home < away) return '2';
  return 'N';
}

export interface Prediction {
  predHome: number;
  predAway: number;
}

export interface FinalScore {
  home: number;
  away: number;
}

export interface PointsResult {
  points: number;
  isExactScore: boolean;
  isCorrectResult: boolean;
}

/**
 * Calcule les points d'un pronostic.
 *
 * Exemples :
 *   calculatePoints({predHome: 2, predAway: 1}, {home: 2, away: 1})
 *     → { points: 3, isExactScore: true,  isCorrectResult: true }   🎯
 *   calculatePoints({predHome: 2, predAway: 1}, {home: 3, away: 0})
 *     → { points: 1, isExactScore: false, isCorrectResult: true }   ✓
 *   calculatePoints({predHome: 2, predAway: 1}, {home: 0, away: 0})
 *     → { points: 0, isExactScore: false, isCorrectResult: false }  ✗
 */
export function calculatePoints(pred: Prediction, result: FinalScore): PointsResult {
  const isExactScore = pred.predHome === result.home && pred.predAway === result.away;

  const isCorrectResult =
    outcomeFromScore(pred.predHome, pred.predAway) ===
    outcomeFromScore(result.home, result.away);

  if (isExactScore) {
    return { points: POINTS.EXACT_SCORE, isExactScore: true, isCorrectResult: true };
  }
  if (isCorrectResult) {
    return { points: POINTS.CORRECT_RESULT, isExactScore: false, isCorrectResult: true };
  }
  return { points: POINTS.WRONG, isExactScore: false, isCorrectResult: false };
}

/** Verrouillage : un pari ferme 5 minutes avant le coup d'envoi. */
export const LOCK_MINUTES_BEFORE_KICKOFF = 5;

export function isLocked(kickoff: Date, now: Date = new Date()): boolean {
  const lockTime = new Date(kickoff.getTime() - LOCK_MINUTES_BEFORE_KICKOFF * 60_000);
  return now >= lockTime;
}

/** Millisecondes restantes avant verrouillage (0 si déjà fermé). */
export function msUntilLock(kickoff: Date, now: Date = new Date()): number {
  const lockTime = new Date(kickoff.getTime() - LOCK_MINUTES_BEFORE_KICKOFF * 60_000);
  return Math.max(0, lockTime.getTime() - now.getTime());
}
