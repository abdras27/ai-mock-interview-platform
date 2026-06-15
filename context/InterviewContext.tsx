"use client";

import type { EvaluateInterviewOutput } from "@/types/interview-evaluation";
import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

type InterviewType = "hr" | "technical" | "company";

interface InterviewContextType {
  answers: string[];
  setAnswers: (answers: string[]) => void;
  evaluation: EvaluateInterviewOutput | null;
  setEvaluation: (evaluation: EvaluateInterviewOutput | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  questions: string[];
  setQuestions: (questions: string[]) => void;
  interviewType: InterviewType;
  setInterviewType: (type: InterviewType) => void;
  jobRole: string;
  setJobRole: (role: string) => void;
  company: string;
  setCompany: (company: string) => void;
}

const InterviewContext = createContext<InterviewContextType | undefined>(
  undefined
);

export const InterviewProvider = ({ children }: { children: ReactNode }) => {
  const [answers, setAnswers] = useState<string[]>(Array(5).fill(""));
  const [evaluation, setEvaluation] = useState<EvaluateInterviewOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [interviewType, setInterviewType] = useState<InterviewType>("hr");
  const [jobRole, setJobRole] = useState("");
  const [company, setCompany] = useState("");

  return (
    <InterviewContext.Provider
      value={{
        answers,
        setAnswers,
        evaluation,
        setEvaluation,
        isLoading,
        setIsLoading,
        questions,
        setQuestions,
        interviewType,
        setInterviewType,
        jobRole,
        setJobRole,
        company,
        setCompany,
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
};

export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (context === undefined) {
    throw new Error("useInterview must be used within an InterviewProvider");
  }
  return context;
};
