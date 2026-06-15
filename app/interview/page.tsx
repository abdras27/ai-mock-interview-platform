"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useInterview } from "@/context/InterviewContext";
import { Mic, MicOff, LoaderCircle, Send, Volume2, RefreshCw, ArrowLeft, ArrowRight, Square } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { COMPANY_QUESTION_BANK } from "@/lib/company-question-bank";

const MAX_FRAMES_PER_QUESTION = 8;
const QUESTION_COUNT = 5;

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  0: SpeechRecognitionAlternative;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResult>;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

const createEmptyVideoFrames = () =>
  Array.from({ length: QUESTION_COUNT }, () => [] as string[]);

function getLocalQuestions(
  interviewType: "hr" | "technical" | "company",
  jobRole: string,
  company: string
): string[] {
  if (interviewType === "technical") {
    const role = jobRole.trim() || "software engineer";
    return [
      `Explain a challenging ${role} problem you solved recently and your approach.`,
      `How would you debug a production issue in a ${role} system under time pressure?`,
      `Describe a tradeoff you made between performance, maintainability, and delivery speed.`,
      `How do you design for scalability and reliability in a ${role} project?`,
      `Walk through a past technical decision that failed and what you changed afterward.`,
    ];
  }

  if (interviewType === "company") {
    const org = company.trim();
    if (org && COMPANY_QUESTION_BANK[org]) {
      return COMPANY_QUESTION_BANK[org];
    }
    const fallbackOrg = org || "this company";
    return [
      `Why do you want to work at ${fallbackOrg}?`,
      `Tell me about a project that would be valuable at ${fallbackOrg}.`,
      `How would you handle conflicting priorities from multiple stakeholders at ${fallbackOrg}?`,
      `Describe a time you received critical feedback and how you responded.`,
      `What impact would you aim to make in your first 90 days at ${fallbackOrg}?`,
    ];
  }

  return [
    "Tell me about yourself and how your background fits this role.",
    "Describe a time you faced a major challenge at work and how you handled it.",
    "How do you prioritize tasks when everything feels urgent?",
    "Tell me about a disagreement with a teammate and how you resolved it.",
    "Why should we hire you for this role?",
  ];
}

export default function InterviewPage() {
  const { 
    setQuestions, 
    setAnswers, 
    setEvaluation, 
    setIsLoading, 
    isLoading, 
    questions, 
    answers,
    interviewType,
    jobRole,
    company
  } = useInterview();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(true);
  const [autoReadAloud, setAutoReadAloud] = useState(false);
  const [inputMode, setInputMode] = useState<"voice" | "type">("voice");

  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [videoFrames, setVideoFrames] = useState<string[][]>(createEmptyVideoFrames);

  const [seconds, setSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const frameCaptureInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  
  const getNewQuestions = useCallback(async () => {
    setIsGeneratingQuestions(true);
    setCurrentQuestionIndex(0);
    setAnswers(Array(5).fill(""));
    setVideoFrames(createEmptyVideoFrames());
    try {
      const questions = getLocalQuestions(interviewType, jobRole, company);
      setQuestions(questions);
    } catch (error) {
      console.error("Failed to generate questions:", error);
      toast({
        title: "Failed to Get Questions",
        description: "Could not generate new questions. Please try again.",
        variant: "destructive",
      });
      setQuestions([
          "Tell me about a time you faced a challenge at work.",
          "Describe a project you are proud of.",
          "How do you handle disagreements with team members?",
          "What is your biggest weakness?",
          "Where do you see yourself in 5 years?"
      ]);
    } finally {
      setIsGeneratingQuestions(false);
    }
  }, [setQuestions, setAnswers, toast, interviewType, jobRole, company]);

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex] || "";
  const questionProgress =
    questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  useEffect(() => {
    getNewQuestions();

    const speechWindow = window as SpeechWindow;
    if (speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition) {
      const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        return;
      }
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            final += `${event.results[i][0].transcript} `;
          } else {
            interim += `${event.results[i][0].transcript} `;
          }
        }
        setInterimTranscript(interim.trim());
        if (final.trim()) {
          setFinalTranscript((prev) => `${prev} ${final}`.trim());
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        toast({
          title: "Speech Recognition Error",
          description: `An error occurred: ${event.error}. Please check your microphone permissions.`,
          variant: "destructive",
        });
        setIsListening(false);
        setTimerActive(false);
      };
    } else {
       toast({
          title: "Browser Not Supported",
          description: "Your browser does not support the Web Speech API. Please use Google Chrome.",
          variant: "destructive",
        });
    }
    
    if('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive) {
      interval = setInterval(() => {
        setSeconds((seconds) => seconds + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive]);
  
  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        cameraStreamRef.current = stream;
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions to see your video.',
        });
      }
    };
    getCameraPermission();
  }, [toast]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if (frameCaptureInterval.current) {
        clearInterval(frameCaptureInterval.current);
        frameCaptureInterval.current = null;
      }
      synthRef.current?.cancel();
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, []);
  
  const saveCurrentAnswer = useCallback(() => {
    const fullTranscript = (finalTranscript + " " + interimTranscript).trim();
    if (fullTranscript) {
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = fullTranscript;
      setAnswers(newAnswers);
    }
  }, [finalTranscript, interimTranscript, answers, currentQuestionIndex, setAnswers]);

  useEffect(() => {
    // Save answer when the transcript changes due to recording
    if (isListening) {
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = (finalTranscript + " " + interimTranscript).trim();
      setAnswers(newAnswers);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalTranscript, interimTranscript, isListening]);


  const speakQuestion = useCallback(() => {
    if (synthRef.current && currentQuestion) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(currentQuestion);
      synthRef.current.speak(utterance);
    }
  }, [currentQuestion]);

  useEffect(() => {
    if (!isGeneratingQuestions && autoReadAloud && currentQuestion) {
      speakQuestion();
    }
  }, [autoReadAloud, currentQuestion, isGeneratingQuestions, speakQuestion]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const captureFrame = useCallback(() => {
    if (videoRef.current && videoRef.current.readyState >= 2) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg');
        setVideoFrames(prevFrames => {
            const newFrames = [...prevFrames];
            const currentFrames = newFrames[currentQuestionIndex] || [];
            if (currentFrames.length >= MAX_FRAMES_PER_QUESTION) {
              return prevFrames;
            }
            newFrames[currentQuestionIndex] = [...currentFrames, dataUri];
            return newFrames;
        });
      }
    }
  }, [currentQuestionIndex]);

  const toggleListening = () => {
    if (inputMode === "type") {
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      if (frameCaptureInterval.current) {
        clearInterval(frameCaptureInterval.current);
        frameCaptureInterval.current = null;
      }
      setIsListening(false);
      setTimerActive(false);
      saveCurrentAnswer();
    } else {
      setFinalTranscript(currentAnswer); 
      setInterimTranscript("");
      setSeconds(0);
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        setTimerActive(true);
        frameCaptureInterval.current = setInterval(captureFrame, 5000); // Capture frame every 5 seconds
      } catch (error) {
         toast({
          title: "Could not start recording",
          description: "Please allow microphone access and try again.",
          variant: "destructive",
        });
      }
    }
  };

  const changeQuestion = (direction: 'next' | 'prev') => {
    if (isListening) {
        toggleListening();
    }
    saveCurrentAnswer();

    const newIndex = direction === 'next' 
        ? currentQuestionIndex + 1 
        : currentQuestionIndex - 1;

    if (newIndex >= 0 && newIndex < questions.length) {
        setCurrentQuestionIndex(newIndex);
        const nextAnswer = answers[newIndex] || "";
        setFinalTranscript(nextAnswer);
        setInterimTranscript("");
        setSeconds(0);
    }
  };


  const submitInterview = async (requireAllAnswers: boolean) => {
     if (isListening) {
        toggleListening(); // This will also save the final answer
    }
    saveCurrentAnswer();

    const answeredEntries = questions
      .map((q, i) => ({
        question: q,
        transcript: answers[i]?.trim() ?? "",
        videoFrames: videoFrames[i] || [],
      }))
      .filter((entry) => entry.transcript.length > 0);

    if (requireAllAnswers && answeredEntries.length !== questions.length) {
         toast({
            title: "Not all questions answered",
            description: "Please provide an answer for every question before submitting.",
            variant: "destructive"
        });
        return;
    }

    if (answeredEntries.length === 0) {
      toast({
        title: "No answers yet",
        description: "Record at least one answer before ending the interview.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ interview: answeredEntries }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody?.error || "Interview evaluation failed");
      }

      const result = await response.json();
      setEvaluation(result);
      router.push("/results");
    } catch (error) {
      console.error("Evaluation error:", error);
      toast({
          title: "Evaluation Failed",
          description: "There was an error evaluating your answers. Please try again.",
          variant: "destructive",
        });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => submitInterview(true);

  const handleEndInterview = async () => {
    if (!window.confirm("End interview now and evaluate your current answers?")) {
      return;
    }
    await submitInterview(false);
  };
  
  const handleNewQuestions = () => {
    if (isListening) {
      toggleListening();
    }
    getNewQuestions();
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-8">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-center select-none">Interview Practice</CardTitle>
           <div className="relative w-full aspect-video bg-muted rounded-md mt-4 overflow-hidden">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            {hasCameraPermission === false && (
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <Alert variant="destructive">
                  <AlertTitle>Camera Access Required</AlertTitle>
                  <AlertDescription>
                    Please allow camera access to see your video feed.
                  </AlertDescription>
                </Alert>
              </div>
            )}
            {hasCameraPermission === null && (
               <div className="absolute inset-0 flex items-center justify-center p-4">
                <p>Loading camera...</p>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center mt-4">
            <p className="text-muted-foreground select-none">Question {currentQuestionIndex + 1} of {questions.length}</p>
             <div className="flex items-center gap-2">
              <Button
                variant={inputMode === "voice" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => {
                  if (isListening) {
                    toggleListening();
                  }
                  setInputMode("voice");
                }}
                disabled={isGeneratingQuestions || isLoading}
              >
                Voice
              </Button>
              <Button
                variant={inputMode === "type" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => {
                  if (isListening) {
                    toggleListening();
                  }
                  setInputMode("type");
                }}
                disabled={isGeneratingQuestions || isLoading}
              >
                Type
              </Button>
              <Button
                variant={autoReadAloud ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setAutoReadAloud((prev) => !prev)}
                disabled={isGeneratingQuestions}
                aria-label="Toggle automatic question read aloud"
              >
                {autoReadAloud ? "Auto Read On" : "Auto Read Off"}
              </Button>
              <Button variant="ghost" size="icon" onClick={speakQuestion} aria-label="Read question aloud" disabled={isGeneratingQuestions}>
                <Volume2 className="h-5 w-5"/>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleNewQuestions} aria-label="Get new questions" disabled={isGeneratingQuestions || isLoading || isListening}>
                <RefreshCw className={`h-5 w-5 ${isGeneratingQuestions ? 'animate-spin' : ''}`}/>
              </Button>
            </div>
          </div>
          <div className="mt-3">
            <Progress value={questionProgress} className="h-2" />
          </div>
           {isGeneratingQuestions ? (
            <div className="flex items-center gap-2 pt-2 h-14">
              <LoaderCircle className="h-5 w-5 animate-spin"/>
              <p className="text-lg font-semibold text-muted-foreground select-none">Generating questions...</p>
            </div>
          ) : (
            <p className="text-lg font-semibold text-foreground pt-2 h-14 select-none">{currentQuestion}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6">
            {inputMode === "voice" ? (
              <>
                <div className="flex items-center gap-4 mt-4">
                  <Button onClick={toggleListening} size="lg" className="rounded-full w-20 h-20 shadow-lg" disabled={isGeneratingQuestions}>
                    {isListening ? <MicOff size={28}/> : <Mic size={28}/>}
                  </Button>
                  <div className="font-mono text-4xl text-foreground select-none">{formatTime(seconds)}</div>
                </div>
                <div className="w-full min-h-[100px] rounded-md border bg-muted p-4 text-muted-foreground">
                  <p>{finalTranscript} <span className="text-primary">{interimTranscript}</span></p>
                </div>
              </>
            ) : (
              <div className="w-full">
                <Textarea
                  value={finalTranscript}
                  onChange={(e) => {
                    const typed = e.target.value;
                    setFinalTranscript(typed);
                    setInterimTranscript("");
                    const newAnswers = [...answers];
                    newAnswers[currentQuestionIndex] = typed;
                    setAnswers(newAnswers);
                  }}
                  placeholder="Type your answer here..."
                  className="min-h-[160px]"
                  disabled={isGeneratingQuestions || isLoading}
                />
              </div>
            )}
            
            <div className="w-full flex justify-between items-center">
                <Button onClick={() => changeQuestion('prev')} disabled={currentQuestionIndex === 0 || isLoading || isListening}>
                    <ArrowLeft className="mr-2 h-5 w-5"/>
                    Previous
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleEndInterview}
                    disabled={isLoading || isGeneratingQuestions}
                  >
                    <Square className="mr-2 h-5 w-5" />
                    End Interview
                  </Button>

                  {currentQuestionIndex < questions.length - 1 ? (
                    <Button onClick={() => changeQuestion('next')} disabled={isLoading || isListening}>
                        Next Question
                        <ArrowRight className="ml-2 h-5 w-5"/>
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} disabled={isLoading || isListening} size="lg" className="w-1/2">
                        {isLoading ? (
                            <>
                            <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                            Evaluating...
                            </>
                        ) : (
                            <>
                            <Send className="mr-2 h-5 w-5" />
                            Submit for Feedback
                            </>
                        )}
                    </Button>
                  )}
                </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
