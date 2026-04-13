import { useState, useCallback, useRef } from "react";
import type { LearnerProfile } from "../../../types/learner";
import type { AnkiCard } from "../../../types/llm";
import { useLlm } from "../../../hooks/useLlm";
import { buildAnkiPrompt } from "../../../lib/prompts/anki";
import { parseLlmJson } from "../../../lib/utils";
import { GameShell } from "../../../components/layout/GameShell";
import { TopicInput } from "./TopicInput";
import { CardView } from "./CardView";
import { ResultScreen } from "./ResultScreen";

type Phase = "input" | "playing" | "done";

interface Props {
  profile: LearnerProfile;
  onEnd: () => void;
}

export function AnkiGame({ profile, onEnd }: Props) {
  const [phase, setPhase] = useState<Phase>("input");
  const [cards, setCards] = useState<AnkiCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [topic, setTopic] = useState("");
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  const { generate, isLoading } = useLlm();

  const handleStart = useCallback(
    async (inputTopic: string, count: number) => {
      setError(null);
      setTopic(inputTopic);

      const { system, user } = buildAnkiPrompt(inputTopic, count, profile);

      try {
        const raw = await generate(
          [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          600
        );

        const parsed = parseLlmJson<AnkiCard[]>(raw);

        if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
          setError("Could not parse cards. Please try again.");
          return;
        }

        setCards(parsed);
        setCurrentIndex(0);
        setPhase("playing");
      } catch {
        setError("Failed to generate cards. Is llama.cpp running on port 8080?");
      }
    },
    [generate, profile]
  );

  function handleNext() {
    if (currentIndex >= cards.length - 1) {
      setPhase("done");
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  function handlePrev() {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }

  function handlePlayAgain() {
    setPhase("input");
    setCards([]);
    setCurrentIndex(0);
    setError(null);
    startedRef.current = false;
  }

  return (
    <GameShell title="Flash Cards" icon="🃏" onEnd={onEnd}>
      {phase === "input" && (
        <div className="h-full flex flex-col">
          <TopicInput onStart={handleStart} isLoading={isLoading} />
          {error && (
            <p className="text-center text-xs text-red-400 pb-4 px-6">{error}</p>
          )}
        </div>
      )}

      {phase === "playing" && cards.length > 0 && (
        <CardView
          card={cards[currentIndex]}
          index={currentIndex}
          total={cards.length}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}

      {phase === "done" && (
        <ResultScreen
          topic={topic}
          cardCount={cards.length}
          onPlayAgain={handlePlayAgain}
          onEnd={onEnd}
        />
      )}
    </GameShell>
  );
}