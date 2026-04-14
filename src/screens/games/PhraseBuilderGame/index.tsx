/**
 * PhraseBuilderGame — silent retry UX.
 *
 * Key behaviour:
 * - Retries up to MAX_ATTEMPTS times without showing error UI.
 * - Only shows an error if ALL attempts fail.
 * - Loading spinner stays on during retries — user sees "thinking…" not errors.
 * - choices are plain strings.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import type { LearnerProfile } from "../../../types/learner";
import {
  buildPhraseBuilderPrompt,
  validatePhraseChallenge,
} from "../../../lib/prompts/phraseBuilder";
import type { PhraseChallenge } from "../../../lib/prompts/phraseBuilder";
import { useLlm } from "../../../hooks/useLlm";
import { parseLlmJson, shuffle } from "../../../lib/utils";
import { GameShell } from "../../../components/layout/GameShell";
import { PhraseDisplay } from "./PhraseDisplay";
import { ChoiceButtons } from "./ChoiceButtons";

const MAX_ATTEMPTS = 4; // silent retry limit before showing error

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
  const [shuffledChoices, setShuffledChoices] = useState<string[]>([]);
  const attemptRef = useRef(0);

  const { generate, isLoading } = useLlm();

  const fetchChallenge = useCallback(async () => {
    setError(null);
    setSelectedAnswer(null);
    setRevealed(false);
    setChallenge(null);
    setShuffledChoices([]);
    attemptRef.current = 0;

    const { system, user } = buildPhraseBuilderPrompt(profile);

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      attemptRef.current = attempt;
      console.log(`[PHRASE] attempt ${attempt}/${MAX_ATTEMPTS}`);

      try {
        const raw = await generate(
          [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          400
        );

        console.log(`[PHRASE] raw response (attempt ${attempt}):`, raw);

        const parsed = parseLlmJson<PhraseChallenge>(raw);
        console.log(`[PHRASE] parsed (attempt ${attempt}):`, parsed);

        if (parsed && validatePhraseChallenge(parsed, attempt)) {
          // Normalise choices to plain strings
          const rawChoices: string[] = parsed.choices.map((c: any) =>
            typeof c === "string" ? c : (c.text ?? String(c))
          );

          // Ensure correct answer is present
          const withCorrect = rawChoices.includes(parsed.missingWord)
            ? rawChoices
            : [parsed.missingWord, ...rawChoices.slice(0, 3)];

          setChallenge(parsed);
          setShuffledChoices(shuffle(withCorrect));
          return; // success — stop retrying
        }

        // Validation failed — loop will retry silently
      } catch (err: any) {
        if (err?.message === "cancelled") return;
        console.error(`[PHRASE] attempt ${attempt} threw:`, err);
        // Continue retrying unless it's a cancellation
      }
    }

    // All attempts exhausted
    console.error("[PHRASE] all attempts failed");
    setError("Could not generate a valid exercise. Make sure llama.cpp is running and try again.");
  }, [generate, profile]);

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
            {score.correct}/{score.total}
          </span>
        ) : undefined
      }
    >
      <div className="h-full flex flex-col items-center justify-center p-6">

        {/* Loading — shown during initial load AND silent retries */}
        {isLoading && !challenge && (
          <div className="flex flex-col items-center gap-3 animate-fade-in">
            <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            <p className="text-sm text-[var(--text-2)]">Thinking…</p>
          </div>
        )}

        {/* Terminal error only if all retries fail */}
        {error && !isLoading && (
          <div className="text-center max-w-xs">
            <p className="text-sm text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchChallenge}
              className="px-5 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-sm text-[var(--text-2)] hover:bg-white/[0.1] transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Challenge ready */}
        {challenge && !isLoading && (
          <div className="w-full max-w-sm flex flex-col gap-5 animate-fade-up">
            <p className="text-xs text-[var(--text-3)] text-center uppercase tracking-widest">
              Choose the missing word
            </p>

            <PhraseDisplay
              displaySentence={challenge.displaySentence}
              translation={challenge.translation}
              romanization={challenge.romanization}
              selectedAnswer={selectedAnswer}
              correctAnswer={challenge.missingWord}
              revealed={revealed}
            />

            <ChoiceButtons
              choices={shuffledChoices}
              correctAnswer={challenge.missingWord}
              selectedAnswer={selectedAnswer}
              revealed={revealed}
              onSelect={handleSelect}
            />

            {revealed && (
              <div className="flex flex-col items-center gap-3 animate-fade-up">
                <p className="text-sm font-medium">
                  {selectedAnswer === challenge.missingWord ? (
                    <span className="text-emerald-400">✓ Correct!</span>
                  ) : (
                    <span className="text-red-400">
                      ✗ Answer: <span className="font-bold">{challenge.missingWord}</span>
                    </span>
                  )}
                </p>
                <button
                  onClick={fetchChallenge}
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-violet-500 hover:bg-violet-400 disabled:opacity-40 text-white text-sm font-semibold transition-colors"
                >
                  Next Challenge →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </GameShell>
  );
}