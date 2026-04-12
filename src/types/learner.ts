export type Language =
  | "japanese"
  | "spanish"
  | "french"
  | "german"
  | "italian"
  | "portuguese"
  | "mandarin"
  | "korean";

export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type ExplanationLanguage = "english" | "spanish" | "french";

export interface LearnerProfile {
  language: Language;
  level: Level;
  explanationLanguage: ExplanationLanguage;
  showRomanization: boolean; // auto-enabled for japanese/mandarin/korean
}

export const ROMANIZATION_LANGUAGES: Language[] = [
  "japanese",
  "mandarin",
  "korean",
];