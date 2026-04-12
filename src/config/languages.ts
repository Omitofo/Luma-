import type { Language, Level } from "../types/learner";

export const LANGUAGES: { value: Language; label: string; flag: string }[] = [
  { value: "japanese", label: "Japanese", flag: "🇯🇵" },
  { value: "spanish", label: "Spanish", flag: "🇪🇸" },
  { value: "french", label: "French", flag: "🇫🇷" },
  { value: "german", label: "German", flag: "🇩🇪" },
  { value: "italian", label: "Italian", flag: "🇮🇹" },
  { value: "portuguese", label: "Portuguese", flag: "🇧🇷" },
  { value: "mandarin", label: "Mandarin", flag: "🇨🇳" },
  { value: "korean", label: "Korean", flag: "🇰🇷" },
];

export const LEVELS: { value: Level; label: string; description: string }[] = [
  { value: "A1", label: "A1", description: "Absolute Beginner" },
  { value: "A2", label: "A2", description: "Elementary" },
  { value: "B1", label: "B1", description: "Intermediate" },
  { value: "B2", label: "B2", description: "Upper Intermediate" },
  { value: "C1", label: "C1", description: "Advanced" },
  { value: "C2", label: "C2", description: "Mastery" },
];

export const EXPLANATION_LANGUAGES = [
  { value: "english", label: "English" },
  { value: "spanish", label: "Spanish" },
  { value: "french", label: "French" },
] as const;