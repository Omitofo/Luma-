/**
 * ChoiceButtons — renders 4 answer choices.
 *
 * For Japanese/Korean, shows romanization below the word so learners
 * can read the options even without knowing the script.
 */

import type { PhraseChoice } from "../../../lib/prompts/phraseBuilder";

interface Props {
  choices: PhraseChoice[];
  correctAnswer: string;
  selectedAnswer: string | null;
  revealed: boolean;
  onSelect: (text: string) => void;
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
        const isCorrect  = choice.text === correctAnswer;

        let style = "border-white/[0.07] bg-white/[0.03] text-[var(--text-2)] hover:bg-white/[0.07] hover:text-[var(--text-1)] hover:border-white/[0.15]";

        if (revealed) {
          if (isCorrect)        style = "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 cursor-default";
          else if (isSelected)  style = "border-red-500/50 bg-red-500/10 text-red-400 cursor-default";
          else                  style = "border-white/[0.04] bg-transparent text-[var(--text-3)] cursor-default opacity-40";
        }

        const hasRoman = Boolean(choice.romanization);

        return (
          <button
            key={i}
            onClick={() => !revealed && onSelect(choice.text)}
            disabled={revealed}
            className={`p-3 rounded-xl border text-sm font-medium transition-all duration-200 flex flex-col items-center gap-0.5 ${style}`}
          >
            <span className={hasRoman ? "text-base" : ""}>{choice.text}</span>
            {hasRoman && (
              <span className="text-[10px] opacity-60 font-normal">{choice.romanization}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}