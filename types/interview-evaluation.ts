import { z } from "zod";

export const InterviewEntrySchema = z.object({
  question: z.string(),
  transcript: z.string(),
  videoFrames: z.array(z.string()),
});

export const EvaluateInterviewInputSchema = z.object({
  interview: z.array(InterviewEntrySchema),
});

const MetricSchema = z.object({
  score: z.number(),
  improvementTip: z.string(),
});

export const EvaluateInterviewOutputSchema = z.object({
  knowledge: MetricSchema,
  logicalReasoning: MetricSchema,
  communicationClarity: MetricSchema,
  confidence: MetricSchema,
  timeManagement: MetricSchema,
  facialPresence: MetricSchema,
  overallFeedback: z.string(),
});

export type EvaluateInterviewInput = z.infer<typeof EvaluateInterviewInputSchema>;
export type EvaluateInterviewOutput = z.infer<typeof EvaluateInterviewOutputSchema>;
