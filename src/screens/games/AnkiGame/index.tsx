import { useState, useCallback } from "react";
import type { LearnerProfile } from "../../../types/learner";
import { useLlm } from "../../../hooks/useLlm";
import { buildAnkiPrompt, validateAnkiCard } from "../../../lib/prompts/anki";
import type { AnkiCard } from "../../../lib/prompts/anki";
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
          700 // bump tokens — richer example sentences need more room
        );

        // Log the raw response so we can see exactly what came back
        console.log("[ANKI] raw LLM response:", raw);

        const parsed = parseLlmJson<AnkiCard[]>(raw);
        console.log("[ANKI] parsed:", parsed);

        if (!parsed || !Array.isArray(parsed)) {
          console.warn("[ANKI] parseLlmJson returned non-array:", parsed);
          setError("The AI returned an unexpected format. Please try again.");
          return;
        }

        // Validate each card — structural only, logged inside validateAnkiCard
        const valid = parsed.filter((card, i) => validateAnkiCard(card, i));
        console.log(`[ANKI] ${valid.length}/${parsed.length} cards passed validation`);

        if (valid.length === 0) {
          setError("No usable cards came back. Please try again.");
          return;
        }

        setCards(valid);
        setCurrentIndex(0);
        setPhase("playing");
      } catch (err: any) {
        if (err?.message === "cancelled") return;
        console.error("[ANKI] error:", err);
        setError("Could not reach the AI server. Make sure llama.cpp is running on port 8080.");
      }
    },
    [generate, profile]
  );

  function handleNext() {
    if (currentIndex >= cards.length - 1) setPhase("done");
    else setCurrentIndex((i) => i + 1);
  }

  function handlePrev() {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }

  function handlePlayAgain() {
    setPhase("input");
    setCards([]);
    setCurrentIndex(0);
    setError(null);
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