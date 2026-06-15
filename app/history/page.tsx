"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, CalendarDays, Building2, FileCheck2 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { InterviewSession } from "@/lib/interview-history";
import type { AptitudeSession } from "@/lib/aptitude-history";
import { APTITUDE_DIFFICULTY_LABELS } from "@/lib/aptitude-question-bank";
import { useAuth } from "@/context/AuthContext";
import { getAptitudeHistoryCloud, getInterviewHistoryCloud } from "@/lib/cloud-history";
import { useRouter } from "next/navigation";

const chartConfig = {
  average: {
    label: "Average Score",
    color: "hsl(var(--primary))",
  },
  sessions: {
    label: "Interviews",
    color: "hsl(var(--accent))",
  },
  difficulty: {
    label: "Difficulty Score",
    color: "hsl(var(--primary))",
  },
  accuracy: {
    label: "Accuracy",
    color: "hsl(var(--accent))",
  },
};

function inferAptitudeTopic(question: string): "Quantitative" | "Logical" | "Verbal" {
  const text = question.toLowerCase();
  if (
    text.includes("synonym") ||
    text.includes("antonym") ||
    text.includes("word")
  ) {
    return "Verbal";
  }
  if (
    text.includes("code") ||
    text.includes("odd one out") ||
    text.includes("arrangement") ||
    text.includes("ways")
  ) {
    return "Logical";
  }
  return "Quantitative";
}

export default function HistoryPage() {
  const [history, setHistory] = useState<InterviewSession[]>([]);
  const [aptitudeHistory, setAptitudeHistory] = useState<AptitudeSession[]>([]);
  const { user, isAuthReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      if (!isAuthReady) return;
      if (!user?.uid) {
        router.push("/login?next=/history");
        return;
      }

      try {
        const [cloudInterview, cloudAptitude] = await Promise.all([
          getInterviewHistoryCloud(user.uid),
          getAptitudeHistoryCloud(user.uid),
        ]);
        if (!isMounted) return;
        setHistory(cloudInterview);
        setAptitudeHistory(cloudAptitude);
      } catch (error) {
        console.error("Failed to load cloud history:", error);
        if (!isMounted) return;
        setHistory([]);
        setAptitudeHistory([]);
      }
    };

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [user?.uid, isAuthReady, router]);

  const trendData = useMemo(
    () =>
      [...history]
        .reverse()
        .map((session, index) => ({
          attempt: index + 1,
          average: Number(session.averageScore.toFixed(2)),
        })),
    [history]
  );

  const companyData = useMemo(() => {
    const grouped = history.reduce<Record<string, { total: number; count: number }>>(
      (acc, session) => {
        const key = session.company?.trim() || "General";
        if (!acc[key]) acc[key] = { total: 0, count: 0 };
        acc[key].total += session.averageScore;
        acc[key].count += 1;
        return acc;
      },
      {}
    );

    return Object.entries(grouped)
      .map(([company, data]) => ({
        company,
        average: Number((data.total / data.count).toFixed(2)),
      }))
      .sort((a, b) => b.average - a.average)
      .slice(0, 10);
  }, [history]);

  const latest = history[0];
  const latestAptitude = aptitudeHistory[0];
  const noData = history.length === 0 && aptitudeHistory.length === 0;
  const aptitudeDifficultyData = useMemo(() => {
    const grouped = aptitudeHistory.reduce<Record<string, { total: number; count: number }>>(
      (acc, session) => {
        const key = session.difficulty;
        if (!acc[key]) acc[key] = { total: 0, count: 0 };
        acc[key].total += session.score;
        acc[key].count += 1;
        return acc;
      },
      {}
    );

    return (Object.keys(APTITUDE_DIFFICULTY_LABELS) as Array<keyof typeof APTITUDE_DIFFICULTY_LABELS>)
      .map((key) => ({
        difficulty: APTITUDE_DIFFICULTY_LABELS[key],
        average: grouped[key] ? Number((grouped[key].total / grouped[key].count).toFixed(2)) : 0,
        attempts: grouped[key]?.count ?? 0,
      }));
  }, [aptitudeHistory]);

  const aptitudeTopicAccuracyData = useMemo(() => {
    const grouped = aptitudeHistory.reduce<Record<string, { correct: number; total: number }>>(
      (acc, session) => {
        session.questions.forEach((question, index) => {
          const topic = inferAptitudeTopic(question.question);
          if (!acc[topic]) acc[topic] = { correct: 0, total: 0 };
          acc[topic].total += 1;
          if (session.answers[index] === question.correctAnswerIndex) {
            acc[topic].correct += 1;
          }
        });
        return acc;
      },
      {}
    );

    return ["Quantitative", "Logical", "Verbal"].map((topic) => {
      const data = grouped[topic] || { correct: 0, total: 0 };
      const accuracy = data.total > 0 ? (data.correct / data.total) * 100 : 0;
      return {
        topic,
        accuracy: Number(accuracy.toFixed(2)),
        total: data.total,
      };
    });
  }, [aptitudeHistory]);

  return (
    <main className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold font-headline">Performance History</h1>
            <p className="text-muted-foreground mt-1">
              Track interview and aptitude performance over time.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back Home
            </Link>
          </Button>
        </div>

        {noData ? (
          <Card>
            <CardHeader>
              <CardTitle>No sessions yet</CardTitle>
              <CardDescription>Complete an interview or aptitude test to start building your dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/setup">Start Interview</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/aptitude">Start Aptitude Test</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Interviews</CardDescription>
                  <CardTitle className="text-3xl">{history.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Latest Interview Score</CardDescription>
                  <CardTitle className="text-3xl">
                    {latest ? `${latest.averageScore.toFixed(1)}/10` : "-"}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Best Interview Score</CardDescription>
                  <CardTitle className="text-3xl">
                    {history.length > 0 ? `${Math.max(...history.map((s) => s.averageScore)).toFixed(1)}/10` : "-"}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Latest Aptitude Score</CardDescription>
                  <CardTitle className="text-3xl">
                    {latestAptitude ? `${latestAptitude.score.toFixed(0)}%` : "-"}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {history.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Interview Score Trend
                    </CardTitle>
                    <CardDescription>Average score across interview attempts.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[280px] w-full">
                      <LineChart data={trendData}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="attempt" tickLine={false} axisLine={false} />
                        <YAxis domain={[0, 10]} tickLine={false} axisLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="average"
                          stroke="var(--color-average)"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Company Performance
                    </CardTitle>
                    <CardDescription>Top companies by your average interview score.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[280px] w-full">
                      <BarChart data={companyData}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="company" tickLine={false} axisLine={false} hide />
                        <YAxis domain={[0, 10]} tickLine={false} axisLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="average" fill="var(--color-sessions)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            )}

            {history.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    Recent Interview Sessions
                  </CardTitle>
                  <CardDescription>Latest interview attempts with key details.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {history.slice(0, 8).map((session) => (
                      <div
                        key={session.id}
                        className="rounded-lg border p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                      >
                        <div>
                          <p className="font-medium">
                            {session.company?.trim() || "General"} - {session.interviewType.toUpperCase()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(session.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-primary">{session.averageScore.toFixed(1)}/10</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {aptitudeHistory.length > 0 && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileCheck2 className="h-5 w-5" />
                        Aptitude by Difficulty
                      </CardTitle>
                      <CardDescription>Average aptitude score for each difficulty.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-[260px] w-full">
                        <BarChart data={aptitudeDifficultyData}>
                          <CartesianGrid vertical={false} />
                          <XAxis dataKey="difficulty" tickLine={false} axisLine={false} />
                          <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="average" fill="var(--color-difficulty)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Topic-wise Accuracy
                      </CardTitle>
                      <CardDescription>Accuracy across Quantitative, Logical, and Verbal questions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-[260px] w-full">
                        <BarChart data={aptitudeTopicAccuracyData}>
                          <CartesianGrid vertical={false} />
                          <XAxis dataKey="topic" tickLine={false} axisLine={false} />
                          <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="accuracy" fill="var(--color-accuracy)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileCheck2 className="h-5 w-5" />
                      Recent Aptitude Tests
                    </CardTitle>
                    <CardDescription>Latest aptitude attempts and scores.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {aptitudeHistory.slice(0, 8).map((session) => (
                        <div
                          key={session.id}
                          className="rounded-lg border p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                        >
                          <div>
                            <p className="font-medium">
                              Aptitude ({APTITUDE_DIFFICULTY_LABELS[session.difficulty]}) - {session.correctCount}/{session.totalQuestions} correct
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(session.createdAt).toLocaleString()} • {session.timedMode ? `Timed ${Math.floor(session.timeTakenSeconds / 60)}m ${session.timeTakenSeconds % 60}s` : "Untimed"}
                            </p>
                          </div>
                          <p className="text-lg font-bold text-primary">{session.score.toFixed(0)}%</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
