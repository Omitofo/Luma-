interface Props {
  topic: string;
  cardCount: number;
  onPlayAgain: () => void;
  onEnd: () => void;
}

export function ResultScreen({ topic, cardCount, onPlayAgain, onEnd }: Props) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 animate-fade-up">
      <div className="text-center max-w-xs">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-semibold text-[var(--text-1)] mb-2">
          Session complete!
        </h2>
        <p className="text-sm text-[var(--text-2)] mb-8">
          You reviewed{" "}
          <span className="text-[var(--text-1)] font-medium">{cardCount} cards</span> on{" "}
          <span className="text-[var(--text-1)] font-medium">{topic}</span>.
          Keep at it — consistency builds fluency.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onPlayAgain}
            className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold transition-colors"
          >
            New Topic →
          </button>
          <button
            onClick={onEnd}
            className="w-full py-3 rounded-xl border border-white/[0.07] text-sm font-medium text-[var(--text-2)] hover:bg-white/[0.04] transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}