// game card on homescreen

import { cn } from "../lib/utils";
import type { GameConfig } from "../types/game";

interface Props {
  game: GameConfig;
  onClick: () => void;
}

const colorMap = {
  blue: {
    icon: "bg-blue-500/10 text-blue-400",
    border: "hover:border-blue-500/30",
    glow: "hover:shadow-[0_0_32px_rgba(59,130,246,0.1)]",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  violet: {
    icon: "bg-violet-500/10 text-violet-400",
    border: "hover:border-violet-500/30",
    glow: "hover:shadow-[0_0_32px_rgba(139,92,246,0.1)]",
    badge: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  },
  emerald: {
    icon: "bg-emerald-500/10 text-emerald-400",
    border: "hover:border-emerald-500/30",
    glow: "hover:shadow-[0_0_32px_rgba(16,185,129,0.1)]",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
} as const;

export function GameCard({ game, onClick }: Props) {
  const colors = colorMap[game.color as keyof typeof colorMap] ?? colorMap.blue;

  return (
    <button
      onClick={onClick}
      disabled={!game.available}
      className={cn(
        "group relative w-full text-left p-6 rounded-2xl",
        "bg-[#0d1018] border border-white/[0.07]",
        "transition-all duration-300 cursor-pointer",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        colors.border,
        colors.glow,
        "hover:-translate-y-0.5"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4",
          "transition-transform duration-300 group-hover:scale-110",
          colors.icon
        )}
      >
        {game.icon}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-[var(--text-1)] text-base mb-1.5 leading-snug">
        {game.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-[var(--text-2)] leading-relaxed">
        {game.description}
      </p>

      {/* Arrow indicator */}
      <div
        className={cn(
          "absolute top-6 right-6 text-[var(--text-3)]",
          "transition-all duration-300",
          "group-hover:text-[var(--text-2)] group-hover:translate-x-0.5"
        )}
      >
        →
      </div>
    </button>
  );
}