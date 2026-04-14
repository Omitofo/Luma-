/**
 * PhraseDisplay — the sentence card with blank.
 * Shows romanization below if available (JP/ZH/KO).
 */

interface Props {
  displaySentence: string;
  translation: string;
  romanization?: string;
  selectedAnswer: string | null;
  correctAnswer: string;
  revealed: boolean;
}

export function PhraseDisplay({ displaySentence, translation, romanization }: Props) {
  const parts = displaySentence.split("____");

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-[#0d1018] border border-white/[0.08] rounded-2xl p-6 text-center">
        {/* Sentence with styled blank */}
        <p className="text-lg font-medium text-[var(--text-1)] leading-relaxed">
          {parts[0]}
          <span className="inline-block min-w-[72px] px-3 py-0.5 border border-violet-500/40 rounded-lg mx-1.5 text-violet-300/60 bg-violet-500/[0.06]">
            ____
          </span>
          {parts[1] ?? ""}
        </p>

        {/* Romanization of full sentence */}
        {romanization && (
          <p className="text-xs text-[var(--text-2)] italic mt-2 leading-relaxed">
            {romanization}
          </p>
        )}

        {/* Translation */}
        <p className="text-sm text-[var(--text-3)] mt-4 border-t border-white/[0.06] pt-4">
          {translation}
        </p>
      </div>
    </div>
  );
}