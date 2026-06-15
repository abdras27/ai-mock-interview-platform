import { NextResponse } from "next/server";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  APTITUDE_QUESTION_BANK,
  type AptitudeDifficulty,
  type AptitudeQuestion,
  type AptitudeQuestionBank,
} from "@/lib/aptitude-question-bank";

export const runtime = "nodejs";

type CandidateBank = Record<string, unknown>;

let cachedBank: AptitudeQuestionBank | null = null;
let cachedMtimeMs: number | null = null;

function getBankPath(): string {
  return path.join(process.cwd(), "data", "aptitude-question-bank.json");
}

function isQuestion(value: unknown): value is AptitudeQuestion {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === "number" &&
    typeof obj.question === "string" &&
    Array.isArray(obj.options) &&
    obj.options.every((o) => typeof o === "string") &&
    typeof obj.correctAnswerIndex === "number" &&
    typeof obj.explanation === "string"
  );
}

function parseBank(candidate: CandidateBank): AptitudeQuestionBank | null {
  const difficulties: AptitudeDifficulty[] = ["easy", "medium", "hard"];
  const bank: Partial<AptitudeQuestionBank> = {};

  for (const difficulty of difficulties) {
    const raw = candidate[difficulty];
    if (!Array.isArray(raw)) return null;
    bank[difficulty] = raw.filter(isQuestion);
  }

  return bank as AptitudeQuestionBank;
}

async function ensureBankFileExists(): Promise<void> {
  const bankPath = getBankPath();
  try {
    await stat(bankPath);
  } catch {
    await mkdir(path.dirname(bankPath), { recursive: true });
    await writeFile(bankPath, JSON.stringify(APTITUDE_QUESTION_BANK, null, 2), "utf-8");
  }
}

async function loadBank(): Promise<AptitudeQuestionBank> {
  const bankPath = getBankPath();
  await ensureBankFileExists();

  try {
    const s = await stat(bankPath);
    const mtimeMs = s.mtimeMs;

    if (cachedBank && cachedMtimeMs === mtimeMs) {
      return cachedBank;
    }

    const raw = await readFile(bankPath, "utf-8");
    const json = JSON.parse(raw) as CandidateBank;
    const parsed = parseBank(json);
    if (!parsed) {
      cachedBank = APTITUDE_QUESTION_BANK;
      cachedMtimeMs = null;
      return APTITUDE_QUESTION_BANK;
    }

    cachedBank = parsed;
    cachedMtimeMs = mtimeMs;
    return parsed;
  } catch {
    cachedBank = APTITUDE_QUESTION_BANK;
    cachedMtimeMs = null;
    return APTITUDE_QUESTION_BANK;
  }
}

export async function GET() {
  const bank = await loadBank();
  return NextResponse.json(bank);
}

