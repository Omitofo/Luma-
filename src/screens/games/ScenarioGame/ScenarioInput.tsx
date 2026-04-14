import { useState } from "react";

interface Props {
  onGenerate: (scenario: string) => void;
  isLoading: boolean;
}

const EXAMPLES = [
  "Ordering coffee at a café in Tokyo",
  "Asking for directions in Paris",
  "Shopping at a street market",
  "Meeting someone for the first time at a party",
  "Booking a hotel room",
  "Calling a doctor's office",
];

export function ScenarioInput({ onGenerate, isLoading }: Props) {
  const [text, setText] = useState("");

  // Loading state — full-panel spinner
  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 animate-fade-in">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-sm text-[var(--text-2)]">Writing dialogue…</p>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">💬</div>
          <h2 className="text-xl font-semibold text-[var(--text-1)] mb-1">Real Scenarios</h2>
          <p className="text-sm text-[var(--text-2)]">
            Describe any situation and the AI will write an authentic dialogue between native speakers.
          </p>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. Two friends catching up after not seeing each other for a year…"
          rows={3}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-[var(--text-1)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all resize-none mb-4"
        />

        <div className="mb-6">
          <p className="text-xs text-[var(--text-3)] mb-2">Try one of these:</p>
          <div className="space-y-1.5">
            {EXAMPLES.map((s) => (
              <button
                key={s}
                onClick={() => setText(s)}
                className="w-full text-left px-3 py-2 rounded-lg text-xs text-[var(--text-2)] bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.07] hover:text-[var(--text-1)] transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => onGenerate(text.trim())}
          disabled={!text.trim()}
          className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
        >
          Generate Dialogue →
        </button>
      </div>
    </div>
  );
}