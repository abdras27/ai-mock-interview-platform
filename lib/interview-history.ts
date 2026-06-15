import type { EvaluateInterviewOutput } from "@/types/interview-evaluation";

export type InterviewType = "hr" | "technical" | "company";

export interface InterviewSession {
  id: string;
  createdAt: string;
  interviewType: InterviewType;
  company: string;
  jobRole: string;
  questions: string[];
  answers: string[];
  evaluation: EvaluateInterviewOutput;
  averageScore: number;
}

const STORAGE_KEY = "verbal_insights_interview_history_v1";
const MAX_HISTORY_ITEMS = 100;

function canUseStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function calculateAverageScore(evaluation: EvaluateInterviewOutput): number {
  const scores = [
    evaluation.knowledge.score,
    evaluation.logicalReasoning.score,
    evaluation.communicationClarity.score,
    evaluation.confidence.score,
    evaluation.timeManagement.score,
    evaluation.facialPresence.score,
  ];
  return scores.reduce((sum, value) => sum + value, 0) / scores.length;
}

export function getInterviewHistory(): InterviewSession[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as InterviewSession[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveInterviewSession(
  session: Omit<InterviewSession, "id" | "createdAt">
): InterviewSession {
  const record: InterviewSession = {
    ...session,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    createdAt: new Date().toISOString(),
  };

  if (!canUseStorage()) return record;

  const history = getInterviewHistory();
  const next = [record, ...history].slice(0, MAX_HISTORY_ITEMS);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return record;
}
