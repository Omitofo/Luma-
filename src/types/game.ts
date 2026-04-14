//src/types/game.ts
export type GameId = "anki" | "phrase-builder" | "scenario";

export type GameStatus = "idle" | "loading" | "playing" | "ended";

export interface GameConfig {
  id: GameId;
  title: string;
  description: string;
  icon: string; // emoji or icon name
  color: string; // accent color class
  available: boolean;
}