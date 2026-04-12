import { useState } from "react";
import type { LearnerProfile, Language, Level, ExplanationLanguage } from "../types/learner";
import { ROMANIZATION_LANGUAGES } from "../types/learner";
import { LANGUAGES, LEVELS, EXPLANATION_LANGUAGES } from "../config/languages";
import { cn } from "../lib/utils";

interface Props {
  onComplete: (profile: LearnerProfile) => void;
}

export function SetupScreen({ onComplete }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [language, setLanguage] = useState<Language | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [expLang, setExpLang] = useState<ExplanationLanguage>("english");

  function handleFinish() {
    if (!language || !level) return;
    onComplete({
      language,
      level,
      explanationLanguage: expLang,
      showRomanization: ROMANIZATION_LANGUAGES.includes(language),
    });
  }

  return (
    <div className="h-screen bg-[#080a0f] flex items-center justify-center p-6 overflow-auto">
      <div className="w-full max-w-sm animate-fade-up">

        {/* Brand */}
        <div className="text-center mb-10">
          <div className="text-4xl mb-3">🌙</div>
          <h1 className="font-serif text-3xl text-[var(--text-1)] italic mb-1">Luma</h1>
          <p className="text-sm text-[var(--text-2)]">Your AI language companion</p>
        </div>

        {/* Step 1 — Language */}
        {step === 1 && (
          <div className="animate-fade-in">
            <p className="text-xs font-medium text-[var(--text-3)] uppercase tracking-widest text-center mb-4">
              What are you learning?
            </p>
            <div className="grid grid-cols-4 gap-2 mb-6">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => setLanguage(lang.value as Language)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200",
                    language === lang.value
                      ? "border-blue-500/60 bg-blue-500/10 scale-[1.02]"
                      : "border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06]"
                  )}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="text-[9px] text-[var(--text-2)] font-medium">{lang.label}</span>
                </button>
              ))}
            </div>
            <button
              disabled={!language}
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 2 — Level */}
        {step === 2 && (
          <div className="animate-fade-in">
            <p className="text-xs font-medium text-[var(--text-3)] uppercase tracking-widest text-center mb-4">
              What's your level?
            </p>
            <div className="space-y-2 mb-6">
              {LEVELS.map((lv) => (
                <button
                  key={lv.value}
                  onClick={() => setLevel(lv.value as Level)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200",
                    level === lv.value
                      ? "border-blue-500/60 bg-blue-500/10"
                      : "border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06]"
                  )}
                >
                  <span className={cn("text-sm font-semibold", level === lv.value ? "text-blue-400" : "text-[var(--text-1)]")}>
                    {lv.value}
                  </span>
                  <span className="text-xs text-[var(--text-2)]">{lv.description}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl border border-white/[0.07] text-sm font-medium text-[var(--text-2)] hover:bg-white/[0.04] transition-colors"
              >
                ← Back
              </button>
              <button
                disabled={!level}
                onClick={() => setStep(3)}
                className="flex-1 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Explanation language */}
        {step === 3 && (
          <div className="animate-fade-in">
            <p className="text-xs font-medium text-[var(--text-3)] uppercase tracking-widest text-center mb-4">
              Explain things in…
            </p>
            <div className="space-y-2 mb-6">
              {EXPLANATION_LANGUAGES.map((el) => (
                <button
                  key={el.value}
                  onClick={() => setExpLang(el.value as ExplanationLanguage)}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200",
                    expLang === el.value
                      ? "border-blue-500/60 bg-blue-500/10 text-blue-400"
                      : "border-white/[0.07] bg-white/[0.03] text-[var(--text-2)] hover:bg-white/[0.06]"
                  )}
                >
                  {el.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 rounded-xl border border-white/[0.07] text-sm font-medium text-[var(--text-2)] hover:bg-white/[0.04] transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold transition-colors"
              >
                Start Learning 🚀
              </button>
            </div>
          </div>
        )}

        {/* Step indicator */}
        <div className="flex justify-center gap-1.5 mt-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                s === step ? "w-6 bg-blue-500" : "w-2 bg-white/10"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}