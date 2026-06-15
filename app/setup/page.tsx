"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useInterview } from "@/context/InterviewContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight } from "lucide-react";
import { AVAILABLE_COMPANIES } from "@/lib/company-question-bank";

export default function SetupPage() {
  const [interviewType, setInterviewType] = useState<"hr" | "technical" | "company">("hr");
  const [jobRole, setJobRole] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [customCompanyName, setCustomCompanyName] = useState("");
  const router = useRouter();
  const { 
    setInterviewType: setContextInterviewType, 
    setJobRole: setContextJobRole,
    setCompany: setContextCompany,
  } = useInterview();

  const handleStart = () => {
    const companyName =
      selectedCompany === "other" ? customCompanyName.trim() : selectedCompany.trim();
    const normalizedJobRole = interviewType === "technical" ? jobRole.trim() : "";

    if (interviewType === "technical" && !normalizedJobRole) {
      alert("Please enter a job role for the technical interview.");
      return;
    }
    if (interviewType === "company" && !companyName.trim()) {
      alert("Please select or enter a company name.");
      return;
    }
    setContextInterviewType(interviewType);
    setContextJobRole(normalizedJobRole);
    setContextCompany(companyName);
    router.push("/interview");
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-8">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-center">Interview Setup</CardTitle>
          <CardDescription className="text-center">
            Choose your interview type to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-lg">Interview Type</Label>
            <RadioGroup
              value={interviewType}
              onValueChange={(value) => setInterviewType(value as "hr" | "technical" | "company")}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hr" id="hr" />
                <Label htmlFor="hr" className="text-base">HR / Behavioral</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="technical" id="technical" />
                <Label htmlFor="technical" className="text-base">Technical</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="company" id="company" />
                <Label htmlFor="company" className="text-base">Company Based</Label>
              </div>
            </RadioGroup>
          </div>

          {interviewType === "technical" && (
            <div className="space-y-2 animate-in fade-in duration-500">
              <Label htmlFor="jobRole" className="text-lg">Job Role</Label>
              <Input
                id="jobRole"
                placeholder="e.g., Software Engineer, Product Manager"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
              />
               <p className="text-sm text-muted-foreground">
                Specify the role to get tailored technical questions.
              </p>
            </div>
          )}

          {interviewType === "company" && (
            <div className="space-y-4 animate-in fade-in duration-500">
               <div className="space-y-2">
                <Label htmlFor="companyName" className="text-lg">Company Name</Label>
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger id="companyName">
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_COMPANIES.map((company) => (
                      <SelectItem key={company} value={company}>
                        {company}
                      </SelectItem>
                    ))}
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {selectedCompany === "other" && (
                  <Input
                    id="customCompanyName"
                    placeholder="Enter company name"
                    value={customCompanyName}
                    onChange={(e) => setCustomCompanyName(e.target.value)}
                  />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Get company-focused interview questions.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleStart} size="lg" className="w-full">
            Start Your Interview
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
