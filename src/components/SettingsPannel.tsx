import { useState } from "react";
import type { LearnerProfile, Language, Level, ExplanationLanguage } from "../types/learner";
import { ROMANIZATION_LANGUAGES } from "../types/learner";
import { LANGUAGES, LEVELS, EXPLANATION_LANGUAGES } from "../config/languages";
import { cn } from "../lib/utils";

interface Props {
  profile: LearnerProfile;
  onSave: (profile: LearnerProfile) => void;
  onClose: () => void;
}

export function SettingsPanel({ profile, onSave, onClose }: Props) {
  const [draft, setDraft] = useState<LearnerProfile>(profile);

  function handleSave() {
    onSave({
      ...draft,
      showRomanization: ROMANIZATION_LANGUAGES.includes(draft.language),
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-sm bg-[#0d1018] border border-white/[0.1] rounded-2xl p-6 animate-scale-in shadow-2xl">
        <h2 className="text-base font-semibold text-[var(--text-1)] mb-5">
          Learning Settings
        </h2>

        {/* Language */}
        <label className="block text-xs font-medium text-[var(--text-3)] uppercase tracking-widest mb-2">
          Language
        </label>
        <div className="grid grid-cols-4 gap-2 mb-5">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              onClick={() => setDraft((d) => ({ ...d, language: lang.value as Language }))}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl border transition-all duration-200",
                draft.language === lang.value
                  ? "border-blue-500/50 bg-blue-500/10"
                  : "border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06]"
              )}
            >
              <span className="text-xl">{lang.flag}</span>
              <span className="text-[9px] text-[var(--text-2)] font-medium leading-none">
                {lang.label}
              </span>
            </button>
          ))}
        </div>

        {/* Level */}
        <label className="block text-xs font-medium text-[var(--text-3)] uppercase tracking-widest mb-2">
          Level
        </label>
        <div className="grid grid-cols-6 gap-1.5 mb-5">
          {LEVELS.map((lv) => (
            <button
              key={lv.value}
              onClick={() => setDraft((d) => ({ ...d, level: lv.value as Level }))}
              className={cn(
                "py-2 rounded-xl text-xs font-semibold border transition-all duration-200",
                draft.level === lv.value
                  ? "border-blue-500/50 bg-blue-500/10 text-blue-400"
                  : "border-white/[0.07] bg-white/[0.03] text-[var(--text-2)] hover:bg-white/[0.06]"
              )}
            >
              {lv.value}
            </button>
          ))}
        </div>

        {/* Explanation language */}
        <label className="block text-xs font-medium text-[var(--text-3)] uppercase tracking-widest mb-2">
          Explanations in
        </label>
        <div className="flex gap-2 mb-6">
          {EXPLANATION_LANGUAGES.map((el) => (
            <button
              key={el.value}
              onClick={() => setDraft((d) => ({ ...d, explanationLanguage: el.value as ExplanationLanguage }))}
              className={cn(
                "flex-1 py-2 rounded-xl text-xs font-semibold border transition-all duration-200",
                draft.explanationLanguage === el.value
                  ? "border-blue-500/50 bg-blue-500/10 text-blue-400"
                  : "border-white/[0.07] bg-white/[0.03] text-[var(--text-2)] hover:bg-white/[0.06]"
              )}
            >
              {el.label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-[var(--text-2)] border border-white/[0.07] hover:bg-white/[0.04] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-blue-500 hover:bg-blue-400 text-white transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}