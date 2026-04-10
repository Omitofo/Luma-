import { useState } from "react";
import { LearnerProfile, TutorMode } from "../types/tutor";

interface Props {
  onStart: (profile: LearnerProfile, mode: TutorMode) => void;
}

export default function Onboarding({ onStart }: Props) {
  const [language, setLanguage] = useState("");
  const [level, setLevel] = useState("");
  const [mode, setMode] = useState<TutorMode>("casual");

  return (
    <div className="onboarding">
      <h1>Welcome to Luma</h1>

      <input
        placeholder="Language (e.g. Japanese)"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      />

      <input
        placeholder="Level (e.g. N5 / A1)"
        value={level}
        onChange={(e) => setLevel(e.target.value)}
      />

      <select
        value={mode}
        onChange={(e) => setMode(e.target.value as TutorMode)}
      >
        <option value="casual">Casual Tutor</option>
        <option value="academic">Academic Tutor</option>
      </select>

      <button
        onClick={() =>
          onStart({ language, level }, mode)
        }
      >
        Start Learning
      </button>
    </div>
  );
}