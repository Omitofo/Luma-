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
}: Props) {
  const parts = displaySentence.split("____");

  return (
    <div className="w-full max-w-sm mx-auto">

      <div className="bg-[#0d1018] border border-white/[0.08] rounded-2xl p-6 text-center">

        <p className="text-lg font-medium">
          {parts[0]}
          <span className="inline-block min-w-[80px] px-2 py-0.5 border rounded-lg mx-1">
            ____
          </span>
          {parts[1] ?? ""}
        </p>

        <p className="text-sm text-[var(--text-2)] mt-4 border-t pt-4">
          {translation}
        </p>

      </div>
    </div>
  );
}