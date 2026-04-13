import type { GameConfig } from "../types/game";

export const GAMES: GameConfig[] = [
  {
    id: "anki",
    title: "Flash Cards",
    description:
      "AI-generated vocabulary cards. Pick any topic — animals, food, travel — and practice at your level.",
    icon: "🃏",
    color: "blue",
    available: true,
  },
  {
    id: "phrase-builder",
    title: "Phrase Builder",
    description:
      "Fill in the missing word. AI crafts sentences tailored to your level for targeted grammar practice.",
    icon: "🧩",
    color: "violet",
    available: true,
  },
  {
    id: "scenario",
    title: "Real Scenarios",
    description:
      "Write any situation and watch AI generate authentic dialogues between native speakers.",
    icon: "💬",
    color: "emerald",
    available: true,
  },
];
