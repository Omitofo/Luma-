/**
 * Anki Flash Card prompt — v3
 *
 * Fixes from logs:
 * - Example sentences were mixing Spanish words into French ("avión", "pasaporte")
 * - Model sometimes ignored the target language for "front"
 *
 * Key changes:
 * - Explicit: example sentence must contain ONLY target-language words
 * - Shorter, cleaner prompt — less rope for the model to hang itself with
 * - Language label injected into EVERY field description
 */

import type { LearnerProfile } from "../../types/learner";

export interface AnkiCard {
  front: string;          // target-language word/phrase
  back: string;           // explanation-language translation
  romanization?: string;  // pronunciation (Japanese/Mandarin/Korean only)
  example?: string;       // example sentence in target language (no loanwords)
}

export function buildAnkiPrompt(
  topic: string,
  count: number,
  profile: LearnerProfile
) {
  const { language, level, explanationLanguage, showRomanization } = profile;

  const langLabel = LANGUAGE_LABELS[language] ?? language;
  const expLabel  = EXPLANATION_LABELS[explanationLanguage] ?? explanationLanguage;

  const romanField = showRomanization
    ? `"romanization":"<${langLabel} pronunciation>",`
    : "";

  return {
    system: `You generate bilingual vocabulary flash cards as a JSON array.
Return ONLY the JSON array. No prose, no markdown, no code fences.

Array format:
[{"front":"<${langLabel} word>","back":"<${expLabel} translation>",${romanField}"example":"<short sentence in ${langLabel} only — no ${expLabel} words>"}]

Rules:
- "front" = one ${langLabel} word or short phrase
- "back" = its ${expLabel} translation
- "example" = a short sentence written ONLY in ${langLabel} (no mixed languages)
- Level: CEFR ${level}
- Return exactly ${count} objects`,

    user: `Topic: "${topic}". Language: ${langLabel}. Translation: ${expLabel}. Level: ${level}. Count: ${count}.`,
  };
}

export function validateAnkiCard(card: Partial<AnkiCard>, index: number): card is AnkiCard {
  if (!card.front?.trim()) {
    console.warn(`[ANKI] card[${index}] rejected: missing front`, card);
    return false;
  }
  if (!card.back?.trim()) {
    console.warn(`[ANKI] card[${index}] rejected: missing back`, card);
    return false;
  }
  console.log(`[ANKI] card[${index}] ✓ | front: "${card.front}" | back: "${card.back}"`);
  return true;
}

// ─── label maps ──────────────────────────────────────────────────────────────

const LANGUAGE_LABELS: Record<string, string> = {
  japanese:   "Japanese",
  spanish:    "Spanish",
  french:     "French",
  german:     "German",
  italian:    "Italian",
  portuguese: "Portuguese",
  mandarin:   "Mandarin Chinese",
  korean:     "Korean",
};

const EXPLANATION_LABELS: Record<string, string> = {
  english: "English",
  spanish: "Spanish",
  french:  "French",
};