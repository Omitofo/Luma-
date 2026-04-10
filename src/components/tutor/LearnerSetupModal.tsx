import { useState } from "react";
import { LearnerProfile } from "../../types/tutor";

interface Props {
  onComplete: (profile: LearnerProfile) => void;
}

const levelOptions: Record<string, string[]> = {
  Japanese: ["JLPT N5", "JLPT N4", "JLPT N3", "JLPT N2", "JLPT N1"],
  French: ["A1", "A2", "B1", "B2", "C1", "C2"],
};

export default function LearnerSetupModal({ onComplete }: Props) {
  const [language, setLanguage] = useState("Japanese");
  const [level, setLevel] = useState("JLPT N5");
  const [focus, setFocus] = useState("Conversation");

  function handleLanguageChange(lang: string) {
    setLanguage(lang);
    setLevel(levelOptions[lang][0]);
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Welcome to Luma</h2>

        <label>Language</label>
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
        >
          <option>Japanese</option>
          <option>French</option>
        </select>

        <label>Level</label>
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          {levelOptions[language].map((lvl) => (
            <option key={lvl}>{lvl}</option>
          ))}
        </select>

        <label>Focus</label>
        <select value={focus} onChange={(e) => setFocus(e.target.value)}>
          <option>Conversation</option>
          <option>Grammar</option>
          <option>Vocabulary</option>
          <option>Writing</option>
        </select>

        <button
          onClick={() =>
            onComplete({
              language,
              level,
              focus,
            })
          }
        >
          Start Learning
        </button>
      </div>
    </div>
  );
}