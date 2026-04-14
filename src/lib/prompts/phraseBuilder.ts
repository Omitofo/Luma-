/**
 * Phrase Builder prompt.
 *
 * Contract:
 *   sentence        → complete sentence IN the target language
 *   displaySentence → same sentence with ONE word replaced by "____"
 *   missingWord     → exactly the removed word (verbatim)
 *   choices         → array of 4 strings (choices[0] = correct, rest = wrong)
 *   translation     → full sentence meaning in explanation language
 *   romanization    → full sentence romanization (mandatory for JP/ZH/KO)
 */

import type { LearnerProfile } from "../../types/learner";

export interface PhraseChallenge {
  sentence: string;
  displaySentence: string;
  missingWord: string;
  choices: string[];
  translation: string;
  romanization?: string;
}

export function buildPhraseBuilderPrompt(profile: LearnerProfile) {
  const { language, level, explanationLanguage, showRomanization } = profile;

  const langLabel = LANGUAGE_LABELS[language] ?? language;
  const expLabel  = EXPLANATION_LABELS[explanationLanguage] ?? explanationLanguage;

  const romanLine = showRomanization
    ? `"romanization":"<full sentence in romaji/pinyin>",`
    : "";

  return {
    system: `You create fill-in-the-blank language exercises as JSON.
Return ONLY the JSON object. No explanation, no markdown.

Format:
{"sentence":"<${langLabel} sentence>","displaySentence":"<same sentence, one word replaced with ____>","missingWord":"<the replaced word>","choices":["<correct>","<wrong1>","<wrong2>","<wrong3>"],${romanLine}"translation":"<${expLabel} meaning>"}

Rules:
- Write in ${langLabel}. Level: CEFR ${level}.
- "____" must be in the MIDDLE of the sentence (not at the end).
- "missingWord" must match exactly what is in "sentence".
- "choices[0]" is always the correct answer.
- "translation" is in ${expLabel}.`,

    user: `One fill-in-the-blank exercise in ${langLabel}. Level ${level}.`,
  };
}

export function validatePhraseChallenge(
  raw: Partial<PhraseChallenge>,
  attempt: number
): raw is PhraseChallenge {
  // structural checks with logging
  if (!raw.sentence?.trim()) {
    console.warn(`[PHRASE] attempt ${attempt}: missing sentence`, raw);
    return false;
  }
  if (!raw.displaySentence?.includes("____")) {
    console.warn(`[PHRASE] attempt ${attempt}: no ____ in displaySentence`, raw);
    return false;
  }
  if (!raw.missingWord?.trim()) {
    console.warn(`[PHRASE] attempt ${attempt}: missing missingWord`, raw);
    return false;
  }
  if (!Array.isArray(raw.choices) || raw.choices.length < 2) {
    console.warn(`[PHRASE] attempt ${attempt}: bad choices array`, raw);
    return false;
  }

  // missingWord must exist in sentence (allow some fuzziness — model sometimes inflects)
  const sentenceLower = raw.sentence.toLowerCase();
  const wordLower = raw.missingWord.toLowerCase();
  if (!sentenceLower.includes(wordLower)) {
    console.warn(`[PHRASE] attempt ${attempt}: missingWord "${raw.missingWord}" not found in sentence`, raw);
    // Don't reject — the model may have slightly inflected the word; still usable
  }

  // blank must not be at very end
  const trimmed = raw.displaySentence.replace(/[\s。！？.!?、,]+$/, "");
  if (trimmed.endsWith("____")) {
    console.warn(`[PHRASE] attempt ${attempt}: blank is at end of sentence`, raw);
    return false;
  }

  console.log(`[PHRASE] attempt ${attempt}: valid ✓`, {
    sentence: raw.sentence,
    missingWord: raw.missingWord,
    choices: raw.choices,
  });
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