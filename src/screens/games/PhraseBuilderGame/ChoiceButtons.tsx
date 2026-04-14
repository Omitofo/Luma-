import type { PhraseChoice } from "../../../types/llm";

interface Props {
  choices: PhraseChoice[];
  correctAnswer: string;
  selectedAnswer: string | null;
  revealed: boolean;
  onSelect: (choice: PhraseChoice) => void;
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
        const isSelected = selectedAnswer === choice.text;
        const isCorrect = choice.text === correctAnswer;

        let style =
          "border-white/[0.07] bg-white/[0.03] text-[var(--text-2)]";

        if (revealed) {
          if (isCorrect) {
            style = "border-emerald-500/50 bg-emerald-500/10 text-emerald-400";
          } else if (isSelected) {
            style = "border-red-500/50 bg-red-500/10 text-red-400";
          }
        }

        return (
          <button
            key={i}
            onClick={() => !revealed && onSelect(choice)}
            className={`p-3 rounded-xl border ${style}`}
          >
            <div className="text-lg">{choice.text}</div>
            <div className="text-xs opacity-60">
              {choice.romanization || ""}
            </div>
          </button>
        );
      })}

    </div>
  );
}