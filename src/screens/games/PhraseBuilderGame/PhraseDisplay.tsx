import { cn } from "../../../lib/utils";

interface PhraseDisplayProps {
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
}: PhraseDisplayProps) {
  // Highlight the blank or the revealed answer
  const parts = displaySentence.split("____");

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Sentence display */}
      <div className="bg-[#0d1018] border border-white/[0.08] rounded-2xl p-6 text-center mb-4">
        <p className="text-lg font-medium text-[var(--text-1)] leading-relaxed">
          {parts[0]}
          <span
            className={cn(
              "inline-block min-w-[80px] px-2 py-0.5 rounded-lg border mx-1 transition-all duration-400",
              !revealed
                ? "border-blue-500/50 bg-blue-500/10 text-blue-400"
                : selectedAnswer === correctAnswer
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                : "border-red-500/50 bg-red-500/10 text-red-400"
            )}
          >
            {revealed ? selectedAnswer || correctAnswer : "____"}
          </span>
          {parts[1]}
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

interface ChoiceButtonsProps {
  choices: string[];
  correctAnswer: string;
  selectedAnswer: string | null;
  revealed: boolean;
  onSelect: (choice: string) => void;
}

export function ChoiceButtons({
  choices,
  correctAnswer,
  selectedAnswer,
  revealed,
  onSelect,
}: ChoiceButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 w-full max-w-sm mx-auto">
      {choices.map((choice) => {
        const isSelected = selectedAnswer === choice;
        const isCorrect = choice === correctAnswer;

        let style = "border-white/[0.07] bg-white/[0.03] text-[var(--text-2)] hover:bg-white/[0.07] hover:text-[var(--text-1)]";

        if (revealed) {
          if (isCorrect) {
            style = "border-emerald-500/50 bg-emerald-500/10 text-emerald-400";
          } else if (isSelected && !isCorrect) {
            style = "border-red-500/50 bg-red-500/10 text-red-400";
          } else {
            style = "border-white/[0.07] bg-white/[0.02] text-[var(--text-3)] opacity-50";
          }
        }

        return (
          <button
            key={choice}
            onClick={() => !revealed && onSelect(choice)}
            disabled={revealed}
            className={cn(
              "py-3 px-4 rounded-xl border text-sm font-medium transition-all duration-200",
              style
            )}
          >
            {choice}
          </button>
        );
      })}
    </div>
  );
}