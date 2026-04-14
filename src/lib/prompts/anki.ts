/**
 * Anki Flash Card prompt.
 *
 * Contract:
 *   front        → word/phrase IN the target language (e.g. "旅行", "voyager")
 *   back         → translation in the learner's explanation language (e.g. "travel")
 *   romanization → only for Japanese/Mandarin/Korean
 *   example      → one short sentence IN the target language
 */

import type { LearnerProfile } from "../../types/learner";

export interface AnkiCard {
  front: string;          // target-language word/phrase
  back: string;           // explanation-language translation
  romanization?: string;  // pronunciation (Japanese/Mandarin/Korean only)
  example?: string;       // example sentence in target language
}

export function buildAnkiPrompt(
  topic: string,
  count: number,
  profile: LearnerProfile
) {
  const { language, level, explanationLanguage, showRomanization } = profile;

  const langLabel = LANGUAGE_LABELS[language] ?? language;
  const expLabel  = EXPLANATION_LABELS[explanationLanguage] ?? explanationLanguage;

  const romanLine = showRomanization
    ? `    "romanization": "<pronunciation guide>",`
    : "";

  // Simpler, shorter prompt — less confusion for the model
  return {
    system: `You generate bilingual vocabulary flash cards as a JSON array.
Return ONLY the JSON array. No explanation, no markdown.

Format:
[{"front":"<${langLabel} word>","back":"<${expLabel} translation>",${romanLine ? `"romanization":"<pronunciation>",` : ""}"example":"<sentence in ${langLabel}>"}]

Rules:
- "front" = the ${langLabel} word
- "back" = the ${expLabel} translation
- Level: CEFR ${level}
- Return exactly ${count} items`,

    user: `${count} flash cards about "${topic}". Language: ${langLabel}. Translate to: ${expLabel}.`,
  };
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

/**
 * Loose validation — only structural checks.
 * Loanwords (hotel/hotel, baggage/baggage) are valid — the model puts the
 * target-language word on front and the translation on back.
 * We log rejections so we can tune from the terminal.
 */
export function validateAnkiCard(card: Partial<AnkiCard>, index: number): card is AnkiCard {
  if (!card.front || typeof card.front !== "string" || !card.front.trim()) {
    console.warn(`[ANKI] card[${index}] rejected: missing "front"`, card);
    return false;
  }
  if (!card.back || typeof card.back !== "string" || !card.back.trim()) {
    console.warn(`[ANKI] card[${index}] rejected: missing "back"`, card);
    return false;
  }
  return true;
}