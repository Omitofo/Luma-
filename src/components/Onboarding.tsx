import { useState } from "react";

import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

import type {
  LearnerProfile,
  ExplanationLanguage,
} from "../types/tutor";

type Language =
  | "english"
  | "spanish"
  | "french"
  | "german"
  | "italian"
  | "japanese";

type Level = "A1" | "A2" | "B1" | "B2" | "C1";

type Props = {
  onComplete: (profile: LearnerProfile) => void;
};

export default function Onboarding({ onComplete }: Props) {
  const [language, setLanguage] = useState<Language | "">("");
  const [level, setLevel] = useState<Level | "">("");
  const [focus, setFocus] = useState("");

  const [explanationLanguage, setExplanationLanguage] =
    useState<ExplanationLanguage>("english");

  const isValid = language !== "" && level !== "";

  function handleStart() {
    if (!isValid) return;

    onComplete({
      language: language as Language,
      level: level as Level,
      focus: focus || undefined,
      explanation_language: explanationLanguage,
    });
  }

  return (
    <div className="h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Start learning</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* LANGUAGE */}
          <div className="space-y-2">
            <Label>Language</Label>

            <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>

              <SelectContent className="bg-popover border border-border z-50">
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
                <SelectItem value="french">French</SelectItem>
                <SelectItem value="german">German</SelectItem>
                <SelectItem value="italian">Italian</SelectItem>
                <SelectItem value="japanese">Japanese</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* LEVEL */}
          <div className="space-y-2">
            <Label>Level</Label>

            <Select value={level} onValueChange={(value) => setLevel(value as Level)}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>

              <SelectContent className="bg-popover border border-border z-50">
                <SelectItem value="A1">A1</SelectItem>
                <SelectItem value="A2">A2</SelectItem>
                <SelectItem value="B1">B1</SelectItem>
                <SelectItem value="B2">B2</SelectItem>
                <SelectItem value="C1">C1</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* EXPLANATION LANGUAGE */}
          <div className="space-y-2">
            <Label>Explanation language</Label>

            <Select
              value={explanationLanguage}
              onValueChange={(value) =>
                setExplanationLanguage(value as ExplanationLanguage)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent className="bg-popover border border-border z-50">
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* FOCUS */}
          <div className="space-y-2">
            <Label>Focus (optional)</Label>

            <Input
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="conversation, grammar..."
            />
          </div>

          <Button className="w-full" onClick={handleStart} disabled={!isValid}>
            Start learning
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}