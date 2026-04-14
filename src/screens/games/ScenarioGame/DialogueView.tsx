import type { ScenarioDialogue } from "../../../lib/prompts/scenario";
import { cn } from "../../../lib/utils";

interface Props {
  dialogue: ScenarioDialogue;
  onNext: () => void;
  onChangeScenario: () => void;
  isLoading: boolean;
}

const BUBBLE_STYLES = [
  { bubble: "border-blue-500/20 bg-blue-500/[0.08]",     avatar: "bg-blue-500/20 text-blue-400" },
  { bubble: "border-emerald-500/20 bg-emerald-500/[0.07]", avatar: "bg-emerald-500/20 text-emerald-400" },
] as const;

export function DialogueView({ dialogue, onNext, onChangeScenario, isLoading }: Props) {
  const speakerList = Array.from(new Set(dialogue.turns.map((t) => t.speaker)));

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Scenario banner */}
      <div className="px-5 pt-4 pb-2 shrink-0">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-xs text-[var(--text-2)] italic text-center">
          "{dialogue.scenario}"
        </div>
      </div>

      {/* Turns — scrollable area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {dialogue.turns.map((turn, i) => {
          const speakerIdx = speakerList.indexOf(turn.speaker) % 2;
          const styles = BUBBLE_STYLES[speakerIdx];
          const isRight = speakerIdx === 1;

          return (
            <div
              key={i}
              className={cn("flex gap-3 animate-fade-up", isRight && "flex-row-reverse")}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Avatar */}
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-1",
                styles.avatar
              )}>
                {turn.speaker[0]}
              </div>

              {/* Bubble */}
              <div className={cn("max-w-[78%]", isRight && "items-end")}>
                <p className={cn("text-[10px] mb-1 text-[var(--text-3)]", isRight && "text-right")}>
                  {turn.speaker}
                </p>
                <div className={cn("rounded-2xl border px-4 py-3", styles.bubble)}>
                  <p className="text-sm font-medium text-[var(--text-1)] mb-1 leading-snug">
                    {turn.original}
                  </p>
                  {turn.romanization && (
                    <p className="text-xs text-[var(--text-2)] mb-1.5 italic">{turn.romanization}</p>
                  )}
                  <p className="text-xs text-[var(--text-3)] border-t border-white/[0.06] pt-1.5 mt-1.5">
                    {turn.translation}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer actions — extra bottom padding so buttons breathe */}
      <div className="px-5 pt-3 pb-8 border-t border-white/[0.05] flex gap-3 shrink-0">
        <button
          onClick={onChangeScenario}
          className="flex-1 py-3 rounded-xl border border-white/[0.07] text-sm font-medium text-[var(--text-2)] hover:bg-white/[0.04] transition-colors"
        >
          Change Scenario
        </button>
        <button
          onClick={onNext}
          disabled={isLoading}
          className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
              Loading…
            </span>
          ) : "New Dialogue →"}
        </button>
      </div>
    </div>
  );
}