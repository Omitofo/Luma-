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

import type { LearnerProfile } from "../types/tutor";

type Props = {
  onComplete: (profile: LearnerProfile) => void;
};

export default function Onboarding({ onComplete }: Props) {
  const [language, setLanguage] = useState("");
  const [level, setLevel] = useState("");
  const [focus, setFocus] = useState("");

  const isValid = language.length > 0 && level.length > 0;

  function handleStart() {
    if (!isValid) return;

    onComplete({
      language,
      level,
      focus: focus || undefined,
    });
  }

  return (
    <div className="h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            Start learning
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* LANGUAGE */}
          <div className="space-y-2">
            <Label>Language</Label>

            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>

              <SelectContent className="z-[100] border border-border bg-popover text-popover-foreground shadow-xl">
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
                <SelectItem value="french">French</SelectItem>
                <SelectItem value="german">German</SelectItem>
                <SelectItem value="italian">Italian</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* LEVEL */}
          <div className="space-y-2">
            <Label>Level</Label>

            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>

              <SelectContent className="z-[100] border border-border bg-popover text-popover-foreground shadow-xl">
                <SelectItem value="A1">A1 - Beginner</SelectItem>
                <SelectItem value="A2">A2 - Elementary</SelectItem>
                <SelectItem value="B1">B1 - Intermediate</SelectItem>
                <SelectItem value="B2">B2 - Upper Intermediate</SelectItem>
                <SelectItem value="C1">C1 - Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* FOCUS */}
          <div className="space-y-2">
            <Label>
              Focus{" "}
              <span className="text-muted-foreground">
                (optional)
              </span>
            </Label>

            <Input
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="conversation, grammar, travel..."
              className="bg-background border-border"
            />
          </div>

          {/* BUTTON */}
          <Button
            className="w-full"
            onClick={handleStart}
            disabled={!isValid}
          >
            Start learning
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}