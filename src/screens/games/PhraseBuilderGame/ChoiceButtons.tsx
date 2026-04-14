/**
 * ChoiceButtons — renders the 4 answer options as plain strings.
 *
 * Note: choices are now plain strings (not PhraseChoice objects).
 * Romanization is not shown in the buttons — it would give away the answer.
 */

interface Props {
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
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-2 w-full max-w-sm mx-auto">
      {choices.map((choice, i) => {
        const isSelected = selectedAnswer === choice;
        const isCorrect = choice === correctAnswer;

        let style =
          "border-white/[0.07] bg-white/[0.03] text-[var(--text-2)] hover:bg-white/[0.07] hover:text-[var(--text-1)] hover:border-white/[0.15]";

        if (revealed) {
          if (isCorrect) {
            style = "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 cursor-default";
          } else if (isSelected) {
            style = "border-red-500/50 bg-red-500/10 text-red-400 cursor-default";
          } else {
            style = "border-white/[0.04] bg-white/[0.01] text-[var(--text-3)] cursor-default opacity-50";
          }
        }

        return (
          <button
            key={i}
            onClick={() => !revealed && onSelect(choice)}
            disabled={revealed}
            className={`p-3 rounded-xl border text-sm font-medium transition-all duration-200 ${style}`}
          >
            {choice}
          </button>
        );
      })}
    </div>
  );
}