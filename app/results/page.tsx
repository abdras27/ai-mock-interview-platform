"use client";

import { useInterview } from "@/context/InterviewContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EvaluationCard } from "@/components/EvaluationCard";
import Link from "next/link";
import { ArrowLeft, History } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { calculateAverageScore } from "@/lib/interview-history";
import { useAuth } from "@/context/AuthContext";
import { saveInterviewSessionCloud } from "@/lib/cloud-history";
import { useToast } from "@/hooks/use-toast";

export default function ResultsPage() {
  const { evaluation, answers, questions, interviewType, company, jobRole } = useInterview();
  const { user, isAuthReady } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const hasSavedRef = useRef(false);

  useEffect(() => {
    if (!evaluation) {
      router.push("/");
    }
  }, [evaluation, router]);

  if (!evaluation) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <p>Loading results...</p>
      </div>
    );
  }

  useEffect(() => {
    if (!evaluation || hasSavedRef.current || !isAuthReady) return;

    if (!user?.uid) {
      toast({
        title: "Login required",
        description: "Please sign in to save interview history in Firestore.",
        variant: "destructive",
      });
      router.push("/login?next=/results");
      return;
    }

    hasSavedRef.current = true;
    const sessionPayload = {
      interviewType,
      company,
      jobRole,
      questions,
      answers,
      evaluation,
      averageScore: calculateAverageScore(evaluation),
    };

    saveInterviewSessionCloud(user.uid, sessionPayload).catch((error) => {
      console.error("Failed to save interview session to cloud:", error);
      toast({
        title: "Save failed",
        description: "Could not save interview history to Firestore.",
        variant: "destructive",
      });
    });
  }, [evaluation, interviewType, company, jobRole, questions, answers, user?.uid, isAuthReady, router, toast]);

  const evaluationData = [
    { title: "Knowledge", score: evaluation.knowledge.score, tip: evaluation.knowledge.improvementTip },
    { title: "Logical Reasoning", score: evaluation.logicalReasoning.score, tip: evaluation.logicalReasoning.improvementTip },
    { title: "Communication Clarity", score: evaluation.communicationClarity.score, tip: evaluation.communicationClarity.improvementTip },
    { title: "Confidence", score: evaluation.confidence.score, tip: evaluation.confidence.improvementTip },
    { title: "Time Management", score: evaluation.timeManagement.score, tip: evaluation.timeManagement.improvementTip },
    { title: "Facial Presence", score: evaluation.facialPresence.score, tip: evaluation.facialPresence.improvementTip },
  ]

  const averageScore = calculateAverageScore(evaluation);

  return (
    <main className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground font-headline">
            Your Feedback
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
            Here's the AI-powered analysis of your interview.
            </p>
        </div>

        <div className="mb-8 p-6 rounded-lg bg-card border">
            <h2 className="text-2xl font-bold text-center mb-4">Overall Score</h2>
            <div className="flex items-center justify-center gap-4">
                <p className="text-6xl font-bold text-primary">{averageScore.toFixed(1)}</p>
                <p className="text-2xl text-muted-foreground">/ 10</p>
            </div>
            {evaluation.overallFeedback && (
              <div className="mt-6 text-center">
                <h3 className="text-lg font-semibold">Overall Feedback</h3>
                <p className="text-muted-foreground mt-2">{evaluation.overallFeedback}</p>
              </div>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {evaluationData.map((item) => (
                <EvaluationCard key={item.title} {...item} />
            ))}
        </div>

        <Card className="mb-8">
            <CardHeader>
                <CardTitle>Your Answers</CardTitle>
                <CardDescription>Review your responses to the interview questions.</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {questions.map((q, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger>
                                <span className="text-left">Question {index + 1}: {q}</span>
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="italic text-muted-foreground">"{answers[index]}"</p>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild size="lg" variant="outline">
            <Link href="/history">
              <History className="mr-2 h-5 w-5" />
              View History
            </Link>
          </Button>
          <Button asChild size="lg">
            <Link href="/interview">
              <ArrowLeft className="mr-2 h-5 w-5"/>
              Try Another Interview
            </Link>
          </Button>
        </div>

      </div>
    </main>
  );
}
