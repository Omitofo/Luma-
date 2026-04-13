import { useState } from "react";

interface Props {
  onStart: (topic: string, count: number) => void;
  isLoading: boolean;
}

const SUGGESTED_TOPICS = [
  "Animals", "Food & Drinks", "Numbers", "Colors",
  "Travel", "Family", "Weather", "Daily Routine",
];

export function TopicInput({ onStart, isLoading }: Props) {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(8);

  function handleSubmit() {
    const t = topic.trim();
    if (!t) return;
    onStart(t, count);
  }

  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🃏</div>
          <h2 className="text-xl font-semibold text-[var(--text-1)] mb-1">Flash Cards</h2>
          <p className="text-sm text-[var(--text-2)]">
            Enter any topic and the AI will generate vocabulary cards for your level.
          </p>
        </div>

        {/* Topic input */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-[var(--text-3)] uppercase tracking-widest mb-2">
            Topic
          </label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="e.g. kitchen items, emotions, sports…"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-[var(--text-1)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all"
          />
        </div>

        {/* Suggestions */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {SUGGESTED_TOPICS.map((s) => (
            <button
              key={s}
              onClick={() => setTopic(s)}
              className="px-2.5 py-1 rounded-lg text-xs text-[var(--text-2)] bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.08] hover:text-[var(--text-1)] transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Card count */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-[var(--text-3)] uppercase tracking-widest mb-2">
            Number of cards:{" "}
            <span className="text-[var(--text-1)]">{count}</span>
          </label>
          <input
            type="range"
            min={4}
            max={16}
            step={2}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-[10px] text-[var(--text-3)] mt-1">
            <span>4</span><span>8</span><span>12</span><span>16</span>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!topic.trim() || isLoading}
          className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="animate-spin inline-block">⟳</span>
              Generating cards…
            </>
          ) : (
            "Generate Cards →"
          )}
        </button>
      </div>
    </div>
  );
}