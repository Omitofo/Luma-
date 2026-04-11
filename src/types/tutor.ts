export type TutorMode = "casual" | "academic";

export type ExplanationLanguage = "english" | "spanish";

export type Language =
  | "english"
  | "spanish"
  | "french"
  | "german"
  | "italian"
  | "japanese";

export type Level = "A1" | "A2" | "B1" | "B2" | "C1";

export type LearnerProfile = {
  language: Language;
  level: Level;
  focus?: string;
  explanation_language: ExplanationLanguage;
};