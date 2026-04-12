//wrapper for all games (header + end button)

import type { ReactNode } from "react";

interface Props {
  title: string;
  icon: string;
  onEnd: () => void;
  children: ReactNode;
  rightSlot?: ReactNode;
}

export function GameShell({ title, icon, onEnd, children, rightSlot }: Props) {
  return (
    <div className="h-screen flex flex-col bg-[#080a0f] overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <span className="text-lg">{icon}</span>
          <span className="text-sm font-medium text-[var(--text-1)]">{title}</span>
        </div>

        <div className="flex items-center gap-3">
          {rightSlot}
          <button
            onClick={onEnd}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--text-2)] rounded-xl border border-white/[0.07] hover:bg-white/[0.04] hover:text-[var(--text-1)] transition-all duration-200"
          >
            <span>✕</span>
            End Game
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}