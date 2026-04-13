import { cn } from "../../../lib/utils";

interface Props {
  displaySentence: string;
  translation: string;
  selectedAnswer: string | null;
  correctAnswer: string;
  revealed: boolean;
}

export function PhraseDisplay({
  displaySentence,
  translation,
  selectedAnswer,
  correctAnswer,
  revealed,
}: Props) {
  const parts = displaySentence.split("____");

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-[#0d1018] border border-white/[0.08] rounded-2xl p-6 text-center mb-4">
        <p className="text-lg font-medium text-[var(--text-1)] leading-relaxed">
          {parts[0]}
          <span
            className={cn(
              "inline-block min-w-[80px] px-2 py-0.5 rounded-lg border mx-1 transition-all duration-300",
              !revealed
                ? "border-blue-500/50 bg-blue-500/10 text-blue-400"
                : selectedAnswer === correctAnswer
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                : "border-red-500/50 bg-red-500/10 text-red-400"
            )}
          >
            {revealed ? (selectedAnswer ?? correctAnswer) : "____"}
          </span>
          {parts[1] ?? ""}
        </p>

        {revealed && (
          <p className="text-sm text-[var(--text-2)] mt-4 pt-4 border-t border-white/[0.06] animate-fade-in">
            {translation}
          </p>
        )}
      </div>
    </div>
  );
}