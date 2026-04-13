import { cn } from "../../../lib/utils";

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
      {choices.map((choice) => {
        const isSelected = selectedAnswer === choice;
        const isCorrect = choice === correctAnswer;

        let style =
          "border-white/[0.07] bg-white/[0.03] text-[var(--text-2)] hover:bg-white/[0.07] hover:text-[var(--text-1)]";

        if (revealed) {
          if (isCorrect) {
            style = "border-emerald-500/50 bg-emerald-500/10 text-emerald-400";
          } else if (isSelected && !isCorrect) {
            style = "border-red-500/50 bg-red-500/10 text-red-400";
          } else {
            style = "border-white/[0.07] bg-white/[0.02] text-[var(--text-3)] opacity-40";
          }
        }

        return (
          <button
            key={choice}
            onClick={() => !revealed && onSelect(choice)}
            disabled={revealed}
            className={cn(
              "py-3 px-4 rounded-xl border text-sm font-medium transition-all duration-200 disabled:cursor-default",
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