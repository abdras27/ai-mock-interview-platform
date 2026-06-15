import { NextResponse } from "next/server";
import {
  EvaluateInterviewInputSchema,
  EvaluateInterviewOutputSchema,
  type EvaluateInterviewInput,
  type EvaluateInterviewOutput,
} from "@/types/interview-evaluation";

const DEFAULT_TIMEOUT_MS = 60000;

function clampScore(score: number): number {
  return Math.max(1, Math.min(10, Math.round(score * 10) / 10));
}

function evaluateLocally(input: EvaluateInterviewInput): EvaluateInterviewOutput {
  const transcripts = input.interview.map((entry) => entry.transcript.trim());
  const wordsByAnswer = transcripts.map((t) => (t ? t.split(/\s+/).length : 0));
  const totalWords = wordsByAnswer.reduce((sum, count) => sum + count, 0);
  const avgWords = wordsByAnswer.length ? totalWords / wordsByAnswer.length : 0;

  const knowledge = clampScore(3 + Math.min(5, avgWords / 20));
  const logicalReasoning = clampScore(3 + Math.min(5, avgWords / 22));
  const communicationClarity = clampScore(4 + Math.min(4, avgWords / 30));
  const confidence = clampScore(4 + Math.min(3, totalWords / 120));

  const completionRatio =
    wordsByAnswer.length === 0
      ? 0
      : wordsByAnswer.filter((count) => count >= 25).length / wordsByAnswer.length;
  const timeManagement = clampScore(3 + completionRatio * 5);

  const frameCount = input.interview.reduce(
    (sum, entry) => sum + entry.videoFrames.length,
    0
  );
  const avgFramesPerAnswer =
    input.interview.length === 0 ? 0 : frameCount / input.interview.length;
  const facialPresence = clampScore(4 + Math.min(4, avgFramesPerAnswer / 3));

  const output: EvaluateInterviewOutput = {
    knowledge: {
      score: knowledge,
      improvementTip:
        knowledge < 7
          ? "Use one concrete example with technical details in each answer."
          : "Keep backing claims with specific outcomes and metrics.",
    },
    logicalReasoning: {
      score: logicalReasoning,
      improvementTip:
        logicalReasoning < 7
          ? "Structure answers as context, action, and result to improve flow."
          : "Continue using clear step-by-step reasoning.",
    },
    communicationClarity: {
      score: communicationClarity,
      improvementTip:
        communicationClarity < 7
          ? "Use shorter sentences and avoid filler words to improve clarity."
          : "Your communication is clear; keep responses concise and focused.",
    },
    confidence: {
      score: confidence,
      improvementTip:
        confidence < 7
          ? "Pause briefly and state key points with more certainty."
          : "Maintain this confident delivery and pace.",
    },
    timeManagement: {
      score: timeManagement,
      improvementTip:
        timeManagement < 7
          ? "Aim for balanced answer length across all questions."
          : "Good pacing overall; keep answers focused on relevance.",
    },
    facialPresence: {
      score: facialPresence,
      improvementTip:
        facialPresence < 7
          ? "Keep your face centered and maintain steady eye contact."
          : "Strong on-camera presence; keep posture and eye contact consistent.",
    },
    overallFeedback:
      "This is a local fallback evaluation based on response completeness, clarity proxies, and captured frame consistency. For model-based scoring, configure TRAINED_MODEL_API_URL.",
  };

  return output;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsedInput = EvaluateInterviewInputSchema.safeParse(body);

  if (!parsedInput.success) {
    return NextResponse.json(
      { error: "Invalid request payload", details: parsedInput.error.flatten() },
      { status: 400 }
    );
  }

  const modelApiUrl = process.env.TRAINED_MODEL_API_URL;
  if (!modelApiUrl) {
    return NextResponse.json(evaluateLocally(parsedInput.data));
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(modelApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.TRAINED_MODEL_API_KEY
          ? { Authorization: `Bearer ${process.env.TRAINED_MODEL_API_KEY}` }
          : {}),
      },
      body: JSON.stringify(parsedInput.data),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      const details = await response.text();
      return NextResponse.json(
        { error: "Model service request failed", details },
        { status: 502 }
      );
    }

    const modelResponseJson = await response.json();
    const candidateOutput =
      modelResponseJson?.evaluation ?? modelResponseJson?.result ?? modelResponseJson;

    const parsedOutput = EvaluateInterviewOutputSchema.safeParse(candidateOutput);
    if (!parsedOutput.success) {
      return NextResponse.json(
        {
          error: "Model service returned an invalid response shape",
          details: parsedOutput.error.flatten(),
        },
        { status: 502 }
      );
    }

    return NextResponse.json(parsedOutput.data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error calling model service";
    return NextResponse.json(
      { error: "Failed to call model service", details: message },
      { status: 502 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
