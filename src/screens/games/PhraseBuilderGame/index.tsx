import { useState, useCallback, useEffect } from "react";
import type { LearnerProfile } from "../../../types/learner";
import {
  buildPhraseBuilderPrompt,
  validatePhraseChallenge,
  normaliseChoices,
} from "../../../lib/prompts/phraseBuilder";
import type { PhraseChallenge, PhraseChoice } from "../../../lib/prompts/phraseBuilder";
import { useLlm } from "../../../hooks/useLlm";
import { parseLlmJson, shuffle } from "../../../lib/utils";
import { GameShell } from "../../../components/layout/GameShell";
import { PhraseDisplay } from "./PhraseDisplay";
import { ChoiceButtons } from "./ChoiceButtons";

const MAX_ATTEMPTS = 5;

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
  const [shuffledChoices, setShuffledChoices] = useState<PhraseChoice[]>([]);

  const { generate, isLoading } = useLlm();

  const fetchChallenge = useCallback(async () => {
    setError(null);
    setSelectedAnswer(null);
    setRevealed(false);
    setChallenge(null);
    setShuffledChoices([]);

    const { system, user } = buildPhraseBuilderPrompt(profile);

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      console.log(`[PHRASE] attempt ${attempt}/${MAX_ATTEMPTS}`);

      try {
        const raw = await generate(
          [{ role: "system", content: system }, { role: "user", content: user }],
          450
        );

        console.log(`[PHRASE] raw (attempt ${attempt}):`, raw);
        const parsed = parseLlmJson<any>(raw);
        console.log(`[PHRASE] parsed (attempt ${attempt}):`, parsed);

        if (parsed && validatePhraseChallenge(parsed, attempt)) {
          const choices = normaliseChoices(
            parsed.choices,
            parsed.missingWord,
            profile.showRomanization
          );

          setChallenge({
            sentence: parsed.sentence,
            displaySentence: parsed.displaySentence,
            missingWord: parsed.missingWord,
            choices,
            translation: parsed.translation,
            romanization: parsed.romanization,
          });
          setShuffledChoices(shuffle(choices));
          return; // success
        }
      } catch (err: any) {
        if (err?.message === "cancelled") return;
        console.error(`[PHRASE] attempt ${attempt} error:`, err);
      }
    }

    console.error("[PHRASE] all attempts failed");
    setError("Could not generate a valid exercise. Check that llama.cpp is running.");
  }, [generate, profile]);

  useEffect(() => { fetchChallenge(); }, []); // eslint-disable-line

  function handleSelect(choiceText: string) {
    if (revealed || !challenge) return;
    setSelectedAnswer(choiceText);
    setRevealed(true);
    setScore((s) => ({
      correct: s.correct + (choiceText === challenge.missingWord ? 1 : 0),
      total: s.total + 1,
    }));
  }

  return (
    <GameShell
      title="Phrase Builder"
      icon="🧩"
      onEnd={onEnd}
      rightSlot={score.total > 0 ? (
        <span className="text-xs text-[var(--text-3)] tabular-nums">
          {score.correct}/{score.total}
        </span>
      ) : undefined}
    >
      <div className="h-full flex flex-col items-center justify-center p-6">
        {/* Loading spinner — shown during generation AND silent retries */}
        {isLoading && !challenge && (
          <div className="flex flex-col items-center gap-3 animate-fade-in">
            <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            <p className="text-sm text-[var(--text-2)]">Thinking…</p>
          </div>
        )}

        {/* Error — only if all retries failed */}
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

        {/* Challenge */}
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