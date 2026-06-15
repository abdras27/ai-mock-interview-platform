import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, BrainCircuit, FileCheck2, History, Mic } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-8">
      <div className="flex flex-col items-center text-center max-w-2xl w-full">
        <Bot size={64} className="text-primary" />
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mt-4 font-headline">
          Welcome to Verbal Insights
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Hone your interview skills with our AI-powered practice tool. Get instant, detailed feedback on your answers.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link href="/setup">
            <Button size="lg" className="font-semibold text-lg py-7 px-8">
              Start Interview
            </Button>
          </Link>
          <Link href="/coding">
            <Button size="lg" variant="secondary" className="font-semibold text-lg py-7 px-8">
              Practice Coding
            </Button>
          </Link>
          <Link href="/history">
            <Button size="lg" variant="outline" className="font-semibold text-lg py-7 px-8">
              <History className="mr-2 h-5 w-5" />
              View History
            </Button>
          </Link>
          <Link href="/aptitude">
            <Button size="lg" variant="secondary" className="font-semibold text-lg py-7 px-8">
              <FileCheck2 className="mr-2 h-5 w-5" />
              Aptitude Test
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Mic className="text-primary" size={32} />
              <CardTitle>Practice Speaking</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Answer questions using your voice. Our app transcribes your speech in real-time, just like a real interview.
            </CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <BrainCircuit className="text-primary" size={32}/>
              <CardTitle>Get AI Feedback</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Receive instant, AI-driven analysis of your performance across key metrics like clarity, confidence, and knowledge.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
