import { useState, useCallback } from "react";
import type { LearnerProfile } from "../../../types/learner";
import type { PhraseChallenge } from "../../../types/llm";
import { useLlm } from "../../../hooks/useLlm";
import { buildPhraseBuilderPrompt } from "../../../lib/prompts/phraseBuilder";
import { parseLlmJson, shuffle } from "../../../lib/utils";
import { GameShell } from "../../../components/layout/GameShell";
import { PhraseDisplay, ChoiceButtons } from "./PhraseDisplay";

interface Props {
  profile: LearnerProfile;
  onEnd: () => void;
}

export function PhraseBuilderGame({ profile, onEnd }: Props) {
  const [challenge, setChallenge] = useState<PhraseChallenge | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  const { generate, isLoading } = useLlm();

  const fetchChallenge = useCallback(async () => {
    setError(null);
    setSelectedAnswer(null);
    setRevealed(false);

    const { system, user } = buildPhraseBuilderPrompt(profile);

    try {
      const raw = await generate(
        [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        400
      );

      const parsed = parseLlmJson<PhraseChallenge>(raw);

      if (!parsed || !parsed.sentence || !parsed.missingWord || !parsed.choices) {
        setError("Could not generate challenge. Trying again…");
        return;
      }

      // Ensure choices are shuffled and include the correct word
      const safeChoices = parsed.choices.includes(parsed.missingWord)
        ? parsed.choices
        : [...parsed.choices.slice(0, 3), parsed.missingWord];

      setChallenge({ ...parsed, choices: shuffle(safeChoices) });
    } catch {
      setError("Failed to connect to AI. Is llama.cpp running?");
    }
  }, [generate, profile]);

  // Load first challenge on mount
  const [started, setStarted] = useState(false);
  if (!started) {
    setStarted(true);
    fetchChallenge();
  }

  function handleSelect(choice: string) {
    if (revealed) return;
    setSelectedAnswer(choice);
    setRevealed(true);
    setScore((s) => ({
      correct: s.correct + (choice === challenge?.missingWord ? 1 : 0),
      total: s.total + 1,
    }));
  }

  function handleNext() {
    fetchChallenge();
  }

  return (
    <GameShell
      title="Phrase Builder"
      icon="🧩"
      onEnd={onEnd}
      rightSlot={
        score.total > 0 ? (
          <span className="text-xs text-[var(--text-3)] tabular-nums">
            {score.correct}/{score.total} correct
          </span>
        ) : undefined
      }
    >
      <div className="h-full flex flex-col items-center justify-center p-6">
        {isLoading && !challenge && (
          <div className="flex flex-col items-center gap-3 animate-fade-in">
            <span className="text-3xl animate-spin">⟳</span>
            <p className="text-sm text-[var(--text-2)]">Generating challenge…</p>
          </div>
        )}

        {error && (
          <div className="text-center">
            <p className="text-sm text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchChallenge}
              className="px-4 py-2 rounded-xl bg-white/[0.06] text-sm text-[var(--text-2)] hover:bg-white/[0.1] transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {challenge && !isLoading && (
          <div className="w-full max-w-sm flex flex-col gap-5 animate-fade-up">
            {/* Instruction */}
            <p className="text-xs text-[var(--text-3)] text-center uppercase tracking-widest">
              Choose the missing word
            </p>

            {/* Phrase */}
            <PhraseDisplay
              displaySentence={challenge.displaySentence}
              translation={challenge.translation}
              selectedAnswer={selectedAnswer}
              correctAnswer={challenge.missingWord}
              revealed={revealed}
            />

            {/* Choices */}
            <ChoiceButtons
              choices={challenge.choices}
              correctAnswer={challenge.missingWord}
              selectedAnswer={selectedAnswer}
              revealed={revealed}
              onSelect={handleSelect}
            />

            {/* Feedback + Next */}
            {revealed && (
              <div className="flex flex-col items-center gap-3 animate-fade-up">
                <p className="text-sm font-medium">
                  {selectedAnswer === challenge.missingWord ? (
                    <span className="text-emerald-400">✓ Correct!</span>
                  ) : (
                    <span className="text-red-400">
                      ✗ The answer was{" "}
                      <span className="font-semibold">{challenge.missingWord}</span>
                    </span>
                  )}
                </p>
                <button
                  onClick={handleNext}
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                >
                  {isLoading ? "Generating…" : "Next Challenge →"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </GameShell>
  );
}