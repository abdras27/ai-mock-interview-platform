"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ProblemListItem = { id: string; title: string; difficulty: string };
type ProblemDetail = {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  input_format: string;
  output_format: string;
  reference_solution: string;
  testcases: Array<{ input: string; expected_output: string }>;
};

type RunResponse = {
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  status?: { description?: string } | null;
};

type SubmitResponse = {
  verdict: string;
  passed: number;
  total: number;
  results: Array<{
    index: number;
    input: string;
    expected_output: string;
    your_output: string;
    passed: boolean;
    status: string;
    stderr?: string | null;
  }>;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${path} failed (${res.status})`);
  return (await res.json()) as T;
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed (${res.status})`);
  return (await res.json()) as T;
}

export default function CodingPage() {
  const [problems, setProblems] = useState<ProblemListItem[]>([]);
  const [problemId, setProblemId] = useState<string>("");
  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [code, setCode] = useState<string>("");
  const [stdin, setStdin] = useState<string>("");

  const [runResult, setRunResult] = useState<RunResponse | null>(null);
  const [submitResult, setSubmitResult] = useState<SubmitResponse | null>(null);
  const [loading, setLoading] = useState<{ problems: boolean; detail: boolean; run: boolean; submit: boolean }>({
    problems: false,
    detail: false,
    run: false,
    submit: false,
  });
  const [error, setError] = useState<string>("");

  const firstSampleInput = useMemo(() => problem?.testcases?.[0]?.input ?? "", [problem]);

  useEffect(() => {
    let cancelled = false;
    setLoading((s) => ({ ...s, problems: true }));
    apiGet<ProblemListItem[]>("/problems")
      .then((list) => {
        if (cancelled) return;
        setProblems(list);
        setProblemId((prev) => prev || list[0]?.id || "");
      })
      .catch((e) => !cancelled && setError(String(e?.message || e)))
      .finally(() => !cancelled && setLoading((s) => ({ ...s, problems: false })));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!problemId) return;
    let cancelled = false;
    setLoading((s) => ({ ...s, detail: true }));
    setError("");
    setRunResult(null);
    setSubmitResult(null);
    apiGet<ProblemDetail>(`/problems/${encodeURIComponent(problemId)}`)
      .then((p) => {
        if (cancelled) return;
        setProblem(p);
        setCode(p.reference_solution || "");
        setStdin(p.testcases?.[0]?.input ?? "");
      })
      .catch((e) => !cancelled && setError(String(e?.message || e)))
      .finally(() => !cancelled && setLoading((s) => ({ ...s, detail: false })));
    return () => {
      cancelled = true;
    };
  }, [problemId]);

  async function onRun() {
    setError("");
    setRunResult(null);
    setSubmitResult(null);
    setLoading((s) => ({ ...s, run: true }));
    try {
      const res = await apiPost<RunResponse>("/run", { code, stdin });
      setRunResult(res);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading((s) => ({ ...s, run: false }));
    }
  }

  async function onSubmit() {
    if (!problemId) return;
    setError("");
    setSubmitResult(null);
    setRunResult(null);
    setLoading((s) => ({ ...s, submit: true }));
    try {
      const res = await apiPost<SubmitResponse>("/submit", { code, problem_id: problemId });
      setSubmitResult(res);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading((s) => ({ ...s, submit: false }));
    }
  }

  return (
    <main className="min-h-screen w-full bg-background p-4 sm:p-8">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Coding Playground</h1>
          <p className="text-sm text-muted-foreground">
            Frontend: Next.js · Backend: FastAPI · Runner: Judge0
          </p>
        </div>
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>

      <div className="mx-auto mt-6 grid w-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Problem</CardTitle>
            <CardDescription>
              API base: <span className="font-mono text-xs">{API_BASE}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select problem</Label>
              <Select value={problemId} onValueChange={setProblemId} disabled={loading.problems}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a problem" />
                </SelectTrigger>
                <SelectContent>
                  {problems.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title} · {p.difficulty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!problem ? (
              <div className="text-sm text-muted-foreground">
                {loading.detail ? "Loading problem…" : "Pick a problem to see details."}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <div className="text-lg font-semibold">{problem.title}</div>
                  <div className="text-sm text-muted-foreground">{problem.difficulty}</div>
                </div>
                <pre className="whitespace-pre-wrap rounded-md border bg-muted p-3 text-sm">
                  {problem.description}
                </pre>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <div className="text-sm font-medium">Input</div>
                    <div className="text-sm text-muted-foreground">{problem.input_format}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Output</div>
                    <div className="text-sm text-muted-foreground">{problem.output_format}</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Sample stdin: <span className="font-mono">{firstSampleInput}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Code</CardTitle>
            <CardDescription>Run with custom stdin, or submit against testcases.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Python code</Label>
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="min-h-[280px] font-mono text-xs"
                placeholder="Write Python 3 code here…"
              />
            </div>
            <div className="space-y-2">
              <Label>stdin</Label>
              <Textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                className="min-h-[90px] font-mono text-xs"
                placeholder='e.g. {"n":5}'
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={onRun} disabled={loading.run || !code.trim()}>
                {loading.run ? "Running…" : "Run"}
              </Button>
              <Button onClick={onSubmit} variant="secondary" disabled={loading.submit || !problemId || !code.trim()}>
                {loading.submit ? "Submitting…" : "Submit"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setRunResult(null);
                  setSubmitResult(null);
                  setError("");
                }}
              >
                Clear
              </Button>
            </div>

            {error ? (
              <pre className="whitespace-pre-wrap rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </pre>
            ) : null}

            {runResult ? (
              <div className="space-y-2">
                <div className="text-sm font-medium">Run result</div>
                <pre className="whitespace-pre-wrap rounded-md border bg-muted p-3 text-xs">
                  {JSON.stringify(runResult, null, 2)}
                </pre>
              </div>
            ) : null}

            {submitResult ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium">Submit result</div>
                  <div className="text-sm">
                    <span className="font-semibold">{submitResult.verdict}</span>{" "}
                    <span className="text-muted-foreground">
                      ({submitResult.passed}/{submitResult.total})
                    </span>
                  </div>
                </div>
                <pre className="whitespace-pre-wrap rounded-md border bg-muted p-3 text-xs">
                  {JSON.stringify(submitResult, null, 2)}
                </pre>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
