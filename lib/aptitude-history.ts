import type { AptitudeQuestion } from "@/lib/aptitude-question-bank";
import type { AptitudeDifficulty } from "@/lib/aptitude-question-bank";

export interface AptitudeSession {
  id: string;
  createdAt: string;
  difficulty: AptitudeDifficulty;
  timedMode: boolean;
  durationSeconds: number;
  timeTakenSeconds: number;
  score: number;
  correctCount: number;
  totalQuestions: number;
  answers: number[];
  questions: AptitudeQuestion[];
}

const STORAGE_KEY = "verbal_insights_aptitude_history_v1";
const MAX_HISTORY_ITEMS = 100;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function getAptitudeHistory(): AptitudeSession[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<Partial<AptitudeSession>>;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => {
        if (
          !item ||
          typeof item.id !== "string" ||
          typeof item.createdAt !== "string" ||
          typeof item.score !== "number" ||
          typeof item.correctCount !== "number" ||
          typeof item.totalQuestions !== "number" ||
          !Array.isArray(item.answers) ||
          !Array.isArray(item.questions)
        ) {
          return null;
        }

        return {
          ...item,
          difficulty: item.difficulty ?? "medium",
          timedMode: item.timedMode ?? false,
          durationSeconds: item.durationSeconds ?? 0,
          timeTakenSeconds: item.timeTakenSeconds ?? 0,
        } as AptitudeSession;
      })
      .filter((item): item is AptitudeSession => item !== null);
  } catch {
    return [];
  }
}

export function saveAptitudeSession(
  session: Omit<AptitudeSession, "id" | "createdAt">
): AptitudeSession {
  const record: AptitudeSession = {
    ...session,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    createdAt: new Date().toISOString(),
  };

  if (!canUseStorage()) return record;

  const history = getAptitudeHistory();
  const next = [record, ...history].slice(0, MAX_HISTORY_ITEMS);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return record;
}
