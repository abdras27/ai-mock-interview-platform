"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Timer } from "lucide-react";
import Link from "next/link";
import {
  APTITUDE_DIFFICULTY_LABELS,
  APTITUDE_QUESTION_BANK,
  fetchAptitudeQuestionBank,
  getRandomAptitudeTest,
  type AptitudeDifficulty,
  type AptitudeQuestion,
  type AptitudeQuestionBank,
} from "@/lib/aptitude-question-bank";
import { APTITUDE_LAST_RESULT_KEY, type AptitudeResultPayload } from "@/lib/aptitude-session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

export default function AptitudePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedDifficulty, setSelectedDifficulty] = useState<AptitudeDifficulty>("easy");
  const [hasStarted, setHasStarted] = useState(false);
  const [timedMode, setTimedMode] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionBank, setQuestionBank] = useState<AptitudeQuestionBank>(APTITUDE_QUESTION_BANK);
  const [questions, setQuestions] = useState<AptitudeQuestion[]>(() =>
    getRandomAptitudeTest("easy", 10, APTITUDE_QUESTION_BANK)
  );
  const [answers, setAnswers] = useState<number[]>(Array.from({ length: 10 }, () => -1));
  const autoSubmitTriggeredRef = useRef(false);

  const currentQuestion = questions[currentIndex];
  const answeredCount = useMemo(() => answers.filter((value) => value >= 0).length, [answers]);
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const startTest = () => {
    const generatedQuestions = getRandomAptitudeTest(selectedDifficulty, 10, questionBank);
    setQuestions(generatedQuestions);
    setCurrentIndex(0);
    setAnswers(Array.from({ length: generatedQuestions.length }, () => -1));
    setRemainingSeconds(timedMode ? durationMinutes * 60 : 0);
    autoSubmitTriggeredRef.current = false;
    setHasStarted(true);
  };

  const resetTest = () => {
    setHasStarted(false);
    setCurrentIndex(0);
    setAnswers(Array.from({ length: questions.length }, () => -1));
    setRemainingSeconds(0);
    autoSubmitTriggeredRef.current = false;
  };

  const setAnswer = (value: string) => {
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return;
    const next = [...answers];
    next[currentIndex] = numericValue;
    setAnswers(next);
  };

  const handleSubmit = useCallback((manual: boolean) => {
    const unanswered = answers.some((value) => value < 0);
    if (manual && unanswered) {
      toast({
        title: "Complete all questions",
        description: `Please answer all ${questions.length} questions before submitting.`,
        variant: "destructive",
      });
      return;
    }

    if (!manual && unanswered) {
      toast({
        title: "Time Up",
        description: "The test was auto-submitted with your current answers.",
      });
    }

    const correctCount = questions.reduce((count, question, index) => {
      return answers[index] === question.correctAnswerIndex ? count + 1 : count;
    }, 0);

    const totalDurationSeconds = timedMode ? durationMinutes * 60 : 0;
    const timeTakenSeconds = timedMode ? totalDurationSeconds - remainingSeconds : 0;

    const payload: AptitudeResultPayload = {
      difficulty: selectedDifficulty,
      timedMode,
      durationSeconds: totalDurationSeconds,
      timeTakenSeconds: Math.max(0, timeTakenSeconds),
      questions,
      answers,
      correctCount,
      score: (correctCount / questions.length) * 100,
    };

    window.sessionStorage.setItem(APTITUDE_LAST_RESULT_KEY, JSON.stringify(payload));
    router.push("/aptitude/results");
  }, [answers, questions, selectedDifficulty, timedMode, durationMinutes, remainingSeconds, toast, router]);

  useEffect(() => {
    let cancelled = false;
    fetchAptitudeQuestionBank()
      .then((bank) => {
        if (cancelled) return;
        setQuestionBank(bank);
        if (!hasStarted) {
          setQuestions(getRandomAptitudeTest("easy", 10, bank));
          setAnswers(Array.from({ length: 10 }, () => -1));
          setCurrentIndex(0);
        }
      })
      .catch(() => {
        // Keep built-in bank if loading fails.
      });

    return () => {
      cancelled = true;
    };
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted || !timedMode) return;
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [hasStarted, timedMode]);

  useEffect(() => {
    if (!hasStarted || !timedMode) return;
    if (remainingSeconds !== 0 || autoSubmitTriggeredRef.current) return;
    autoSubmitTriggeredRef.current = true;
    handleSubmit(false);
  }, [hasStarted, timedMode, remainingSeconds, handleSubmit]);

  return (
    <main className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold font-headline">Aptitude Test</h1>
            <p className="text-muted-foreground mt-1">Choose difficulty and answer all questions.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back Home
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Difficulty</CardTitle>
            <CardDescription>Select one of three test levels before you begin.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {(Object.keys(APTITUDE_DIFFICULTY_LABELS) as AptitudeDifficulty[]).map((level) => (
              <Button
                key={level}
                variant={selectedDifficulty === level ? "default" : "outline"}
                onClick={() => setSelectedDifficulty(level)}
                disabled={hasStarted}
              >
                {APTITUDE_DIFFICULTY_LABELS[level]}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timed Mode</CardTitle>
            <CardDescription>Enable timer to auto-submit when time runs out.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={timedMode ? "default" : "outline"}
                onClick={() => setTimedMode(true)}
                disabled={hasStarted}
              >
                Timed
              </Button>
              <Button
                variant={!timedMode ? "default" : "outline"}
                onClick={() => setTimedMode(false)}
                disabled={hasStarted}
              >
                Untimed
              </Button>
            </div>
            {timedMode && (
              <div className="flex flex-wrap gap-2">
                {[10, 15, 20].map((minutes) => (
                  <Button
                    key={minutes}
                    variant={durationMinutes === minutes ? "secondary" : "outline"}
                    onClick={() => setDurationMinutes(minutes)}
                    disabled={hasStarted}
                  >
                    {minutes} min
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {!hasStarted ? (
          <Card>
            <CardHeader>
              <CardTitle>Ready to begin?</CardTitle>
              <CardDescription>
                Selected difficulty: <span className="font-medium text-foreground">{APTITUDE_DIFFICULTY_LABELS[selectedDifficulty]}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={startTest} className="w-full sm:w-auto">
                Start {APTITUDE_DIFFICULTY_LABELS[selectedDifficulty]} Test
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>
                  {APTITUDE_DIFFICULTY_LABELS[selectedDifficulty]} - Question {currentIndex + 1}/{questions.length}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  {timedMode && (
                    <>
                      <Timer className="h-4 w-4" />
                      {formatTime(remainingSeconds)}
                    </>
                  )}
                  <span>{answeredCount} answered</span>
                </CardDescription>
              </div>
              <Progress value={progress} className="h-2" />
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-lg font-medium">{currentQuestion.question}</p>
              <RadioGroup
                value={answers[currentIndex] >= 0 ? String(answers[currentIndex]) : ""}
                onValueChange={setAnswer}
                className="space-y-3"
              >
                {currentQuestion.options.map((option, optionIndex) => (
                  <div
                    key={option}
                    className="flex items-center gap-3 rounded-md border p-3 hover:bg-muted/70 transition-colors"
                  >
                    <RadioGroupItem value={String(optionIndex)} id={`q-${currentQuestion.id}-${optionIndex}`} />
                    <Label htmlFor={`q-${currentQuestion.id}-${optionIndex}`} className="cursor-pointer w-full">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex items-center justify-between gap-3 pt-2">
                <Button variant="outline" onClick={resetTest}>
                  Change Difficulty
                </Button>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>

                  {currentIndex < questions.length - 1 ? (
                    <Button onClick={() => setCurrentIndex((prev) => prev + 1)}>
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button onClick={() => handleSubmit(true)}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Submit Test
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
