"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APTITUDE_LAST_RESULT_KEY, type AptitudeResultPayload } from "@/lib/aptitude-session";
import { APTITUDE_DIFFICULTY_LABELS } from "@/lib/aptitude-question-bank";
import { useAuth } from "@/context/AuthContext";
import { saveAptitudeSessionCloud } from "@/lib/cloud-history";
import { useToast } from "@/hooks/use-toast";

export default function AptitudeResultsPage() {
  const router = useRouter();
  const { user, isAuthReady } = useAuth();
  const { toast } = useToast();
  const [result, setResult] = useState<AptitudeResultPayload | null>(null);
  const hasSavedRef = useRef(false);

  useEffect(() => {
    const raw = window.sessionStorage.getItem(APTITUDE_LAST_RESULT_KEY);
    if (!raw) {
      router.push("/aptitude");
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<AptitudeResultPayload>;
      if (!parsed || !Array.isArray(parsed.questions) || !Array.isArray(parsed.answers)) {
        router.push("/aptitude");
        return;
      }
      setResult({
        difficulty: parsed.difficulty ?? "medium",
        timedMode: parsed.timedMode ?? false,
        durationSeconds: parsed.durationSeconds ?? 0,
        timeTakenSeconds: parsed.timeTakenSeconds ?? 0,
        questions: parsed.questions,
        answers: parsed.answers,
        correctCount: typeof parsed.correctCount === "number" ? parsed.correctCount : 0,
        score: typeof parsed.score === "number" ? parsed.score : 0,
      });
    } catch {
      router.push("/aptitude");
    }
  }, [router]);

  useEffect(() => {
    if (!result || hasSavedRef.current || !isAuthReady) return;

    if (!user?.uid) {
      toast({
        title: "Login required",
        description: "Please sign in to save aptitude history in Firestore.",
        variant: "destructive",
      });
      router.push("/login?next=/aptitude/results");
      return;
    }

    hasSavedRef.current = true;
    const sessionPayload = {
      difficulty: result.difficulty,
      timedMode: result.timedMode,
      durationSeconds: result.durationSeconds,
      timeTakenSeconds: result.timeTakenSeconds,
      score: result.score,
      correctCount: result.correctCount,
      totalQuestions: result.questions.length,
      answers: result.answers,
      questions: result.questions,
    };

    saveAptitudeSessionCloud(user.uid, sessionPayload).catch((error) => {
      console.error("Failed to save aptitude session to cloud:", error);
      toast({
        title: "Save failed",
        description: "Could not save aptitude history to Firestore.",
        variant: "destructive",
      });
    });
  }, [result, user?.uid, isAuthReady, router, toast]);

  const wrongCount = useMemo(() => {
    if (!result) return 0;
    return result.questions.length - result.correctCount;
  }, [result]);

  if (!result) {
    return (
      <main className="min-h-screen bg-background p-4 sm:p-8 flex items-center justify-center">
        <p className="text-muted-foreground">Loading results...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold font-headline">Aptitude Results</h1>
          <p className="text-muted-foreground mt-1">
            {APTITUDE_DIFFICULTY_LABELS[result.difficulty]} difficulty - review correct answers, your choices, and explanations.
          </p>
          <p className="text-muted-foreground mt-1">
            {result.timedMode
              ? `Timed mode: ${Math.floor(result.timeTakenSeconds / 60)}m ${result.timeTakenSeconds % 60}s used`
              : "Untimed mode"}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Score</CardDescription>
              <CardTitle className="text-3xl">{result.score.toFixed(0)}%</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Correct</CardDescription>
              <CardTitle className="text-3xl text-accent">{result.correctCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Wrong</CardDescription>
              <CardTitle className="text-3xl text-destructive">{wrongCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
            <CardDescription>Each question includes your answer, correct answer, and explanation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.questions.map((question, index) => {
              const givenIndex = result.answers[index];
              const isCorrect = givenIndex === question.correctAnswerIndex;
              const givenAnswer =
                givenIndex >= 0 ? question.options[givenIndex] : "Not answered";
              const correctAnswer = question.options[question.correctAnswerIndex];

              return (
                <div key={question.id} className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium">
                      Q{index + 1}. {question.question}
                    </p>
                    {isCorrect ? (
                      <span className="inline-flex items-center text-accent text-sm font-medium">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-destructive text-sm font-medium">
                        <XCircle className="h-4 w-4 mr-1" />
                        Incorrect
                      </span>
                    )}
                  </div>
                  <p className="text-sm">
                    <span className="font-semibold">Your answer: </span>
                    <span className={isCorrect ? "text-accent" : "text-destructive"}>{givenAnswer}</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Correct answer: </span>
                    <span className="text-accent">{correctAnswer}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Explanation: </span>
                    {question.explanation}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/history">View History</Link>
          </Button>
          <Button asChild>
            <Link href="/aptitude">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retake Aptitude Test
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
