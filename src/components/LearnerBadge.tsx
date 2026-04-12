// shows cuttent lang/level in header

import type { LearnerProfile } from "../types/learner";
import { LANGUAGES } from "../config/languages";

interface Props {
  profile: LearnerProfile;
  onEdit: () => void;
}

export function LearnerBadge({ profile, onEdit }: Props) {
  const lang = LANGUAGES.find((l) => l.value === profile.language);

  return (
    <button
      onClick={onEdit}
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.07] transition-colors duration-200 group"
    >
      <span className="text-base leading-none">{lang?.flag ?? "🌐"}</span>
      <span className="text-xs font-medium text-[var(--text-2)] group-hover:text-[var(--text-1)] transition-colors">
        {lang?.label}
      </span>
      <span className="text-[10px] font-semibold text-[var(--text-3)] bg-white/[0.06] px-1.5 py-0.5 rounded-md">
        {profile.level}
      </span>
    </button>
  );
}