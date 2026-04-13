import { useState, useCallback, useEffect } from "react";
import type { LearnerProfile } from "../../../types/learner";
import type { PhraseChallenge } from "../../../types/llm";
import { useLlm } from "../../../hooks/useLlm";
import { buildPhraseBuilderPrompt } from "../../../lib/prompts/phraseBuilder";
import { parseLlmJson, shuffle } from "../../../lib/utils";
import { GameShell } from "../../../components/layout/GameShell";
import { PhraseDisplay } from "./PhraseDisplay";
import { ChoiceButtons } from "./ChoiceButtons";

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

      if (!parsed?.sentence || !parsed?.missingWord || !Array.isArray(parsed?.choices)) {
        setError("Could not generate a challenge. Trying again…");
        return;
      }

      const safeChoices = parsed.choices.includes(parsed.missingWord)
        ? parsed.choices
        : [...parsed.choices.slice(0, 3), parsed.missingWord];

      setChallenge({ ...parsed, choices: shuffle(safeChoices) });
    } catch {
      setError("Failed to connect to AI. Is llama.cpp running on port 8080?");
    }
  }, [generate, profile]);

  // Fetch first challenge on mount
  useEffect(() => {
    fetchChallenge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSelect(choice: string) {
    if (revealed || !challenge) return;
    setSelectedAnswer(choice);
    setRevealed(true);
    setScore((s) => ({
      correct: s.correct + (choice === challenge.missingWord ? 1 : 0),
      total: s.total + 1,
    }));
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
        {/* Loading state — no challenge yet */}
        {isLoading && !challenge && (
          <div className="flex flex-col items-center gap-3 animate-fade-in">
            <span className="text-3xl animate-spin inline-block">⟳</span>
            <p className="text-sm text-[var(--text-2)]">Generating challenge…</p>
          </div>
        )}

        {/* Error state */}
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

        {/* Challenge */}
        {challenge && !isLoading && (
          <div className="w-full max-w-sm flex flex-col gap-5 animate-fade-up">
            <p className="text-xs text-[var(--text-3)] text-center uppercase tracking-widest">
              Choose the missing word
            </p>

            <PhraseDisplay
              displaySentence={challenge.displaySentence}
              translation={challenge.translation}
              selectedAnswer={selectedAnswer}
              correctAnswer={challenge.missingWord}
              revealed={revealed}
            />

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
                  onClick={fetchChallenge}
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