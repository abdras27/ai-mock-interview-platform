import type { AptitudeQuestion } from "@/lib/aptitude-question-bank";
import type { AptitudeDifficulty } from "@/lib/aptitude-question-bank";

export interface AptitudeResultPayload {
  difficulty: AptitudeDifficulty;
  timedMode: boolean;
  durationSeconds: number;
  timeTakenSeconds: number;
  questions: AptitudeQuestion[];
  answers: number[];
  correctCount: number;
  score: number;
}

export const APTITUDE_LAST_RESULT_KEY = "verbal_insights_aptitude_last_result_v1";
