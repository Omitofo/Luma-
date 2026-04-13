import { useState } from "react";
import type { AnkiCard } from "../../../types/llm";
import { cn } from "../../../lib/utils";

interface Props {
  card: AnkiCard;
  index: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
}

export function CardView({ card, index, total, onNext, onPrev }: Props) {
  const [flipped, setFlipped] = useState(false);
  const [lastIndex, setLastIndex] = useState(index);

  // Reset flip when card changes
  if (lastIndex !== index) {
    setFlipped(false);
    setLastIndex(index);
  }

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 animate-fade-in">
      {/* Progress bar */}
      <div className="w-full max-w-sm mb-6 flex items-center gap-3">
        <div className="flex-1 h-1 bg-white/[0.07] rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
        <span className="text-xs text-[var(--text-3)] tabular-nums shrink-0">
          {index + 1} / {total}
        </span>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm cursor-pointer"
        onClick={() => setFlipped((f) => !f)}
        style={{ perspective: "1000px" }}
      >
        <div
          className={cn("card-flip relative", flipped && "flipped")}
          style={{ height: "260px" }}
        >
          {/* Front */}
          <div className="card-face absolute inset-0 flex flex-col items-center justify-center bg-[#0d1018] border border-white/[0.08] rounded-2xl p-6 text-center">
            <p className="text-xs text-[var(--text-3)] uppercase tracking-widest mb-4">
              Target language
            </p>
            <p className="text-3xl font-semibold text-[var(--text-1)] mb-2 leading-snug">
              {card.front}
            </p>
            {card.romanization && (
              <p className="text-sm text-[var(--text-2)] mt-1">{card.romanization}</p>
            )}
            <p className="text-xs text-[var(--text-3)] mt-6">Tap to reveal →</p>
          </div>

          {/* Back */}
          <div className="card-face card-back absolute inset-0 flex flex-col items-center justify-center bg-blue-500/[0.06] border border-blue-500/20 rounded-2xl p-6 text-center">
            <p className="text-xs text-[var(--text-3)] uppercase tracking-widest mb-4">
              Translation
            </p>
            <p className="text-2xl font-semibold text-[var(--text-1)] mb-3">
              {card.back}
            </p>
            {card.example && (
              <div className="mt-2 px-4 py-2.5 bg-white/[0.04] rounded-xl border border-white/[0.07] w-full">
                <p className="text-xs text-[var(--text-3)] mb-1">Example</p>
                <p className="text-sm text-[var(--text-2)]">{card.example}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {!flipped && (
        <p className="text-xs text-[var(--text-3)] mt-4 animate-fade-in">
          Tap the card to see the answer
        </p>
      )}

      {/* Navigation — only show after flip */}
      {flipped && (
        <div className="flex gap-3 mt-6 w-full max-w-sm animate-fade-up">
          <button
            onClick={onPrev}
            disabled={index === 0}
            className="flex-1 py-3 rounded-xl border border-white/[0.07] text-sm font-medium text-[var(--text-2)] hover:bg-white/[0.04] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          <button
            onClick={onNext}
            className="flex-1 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold transition-colors"
          >
            {index === total - 1 ? "Finish 🎉" : "Next →"}
          </button>
        </div>
      )}
    </div>
  );
}