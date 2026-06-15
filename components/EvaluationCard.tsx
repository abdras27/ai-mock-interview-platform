import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Lightbulb } from "lucide-react";

interface EvaluationCardProps {
  title: string;
  score: number;
  tip: string;
}

export function EvaluationCard({ title, score, tip }: EvaluationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <div className="flex items-center gap-4 pt-2">
          <Progress value={score * 10} className="w-full" />
          <span className="font-bold text-lg text-primary">{score}/10</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-3">
          <Lightbulb className="text-accent h-5 w-5 mt-1 shrink-0" />
          <div>
            <p className="font-semibold text-foreground">Improvement Tip:</p>
            <CardDescription>{tip}</CardDescription>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
