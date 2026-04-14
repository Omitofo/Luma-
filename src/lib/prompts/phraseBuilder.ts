/**
 * Phrase Builder prompt — v3
 *
 * Core insight from logs:
 * The model was generating "Je vais au ____." — the blank was IN the
 * template, not replacing a real word. The sentence and displaySentence
 * were identical, meaning nothing was actually removed.
 *
 * Fix: force a two-step mental model in the prompt:
 *   Step 1 → write a complete sentence with the target word present
 *   Step 2 → copy the sentence, replacing ONLY that one word with ____
 *
 * Also: choices for JP/KO include romanization so learners can read them.
 */

import type { LearnerProfile } from "../../types/learner";

export interface PhraseChoice {
  text: string;           // the word in target script
  romanization?: string;  // pronunciation (JP/KO only)
}

export interface PhraseChallenge {
  sentence: string;        // complete sentence — the target word IS present here
  displaySentence: string; // same sentence with target word replaced by ____
  missingWord: string;     // the exact word removed (must exist verbatim in sentence)
  choices: PhraseChoice[]; // always structured objects now
  translation: string;     // full sentence in explanation language
  romanization?: string;   // full sentence romanization (JP/ZH/KO)
}

export function buildPhraseBuilderPrompt(profile: LearnerProfile) {
  const { language, level, explanationLanguage, showRomanization } = profile;

  const langLabel = LANGUAGE_LABELS[language] ?? language;
  const expLabel  = EXPLANATION_LABELS[explanationLanguage] ?? explanationLanguage;

  // For JP/KO, choices need romanization so the learner can read them
  const choiceFormat = showRomanization
    ? `[{"text":"<word>","romanization":"<pronunciation>"},{"text":"<word>","romanization":"<pronunciation>"},{"text":"<word>","romanization":"<pronunciation>"},{"text":"<word>","romanization":"<pronunciation>"}]`
    : `["<word1>","<word2>","<word3>","<word4>"]`;

  const romanLine = showRomanization
    ? `"romanization":"<complete sentence pronunciation>",`
    : "";

  // Two concrete examples to anchor the model's understanding
  const spanishExample = `EXAMPLE (Spanish, B1):
sentence: "Ella trabaja en un hospital."
displaySentence: "Ella trabaja en un ____."
missingWord: "hospital"
choices[0] = "hospital" (correct)`;

  const frenchExample = `EXAMPLE (French, A1):
sentence: "Je mange une pomme."
displaySentence: "Je mange une ____."
missingWord: "pomme"
choices[0] = "pomme" (correct)`;

  return {
    system: `You create fill-in-the-blank exercises for ${langLabel} learners. CEFR level: ${level}.
Return ONLY a JSON object. No prose, no markdown.

CRITICAL RULE: "sentence" must be a complete ${langLabel} sentence where the target word is fully written out.
"displaySentence" is an EXACT COPY of "sentence" where ONE word is replaced with ____.
"missingWord" is that exact word — it MUST appear verbatim inside "sentence".

${spanishExample}

${frenchExample}

JSON format:
{"sentence":"<complete ${langLabel} sentence>","displaySentence":"<sentence with one word → ____>","missingWord":"<the replaced word>","choices":${choiceFormat},${romanLine}"translation":"<${expLabel} meaning of the full sentence>"}

Additional rules:
- ____ must be in the MIDDLE (not at the end of the sentence).
- Write entirely in ${langLabel}. No ${expLabel} words inside "sentence".
- "translation" is ONLY in ${expLabel}.
- choices[0] is always the correct answer (frontend shuffles).`,

    user: `Generate one fill-in-the-blank exercise in ${langLabel} at CEFR ${level}.`,
  };
}

/**
 * Validate with detailed logging.
 * Key check: missingWord must actually be IN sentence (model was leaving blank as placeholder).
 */
export function validatePhraseChallenge(
  raw: Partial<{ sentence: string; displaySentence: string; missingWord: string; choices: any[]; translation: string; romanization?: string }>,
  attempt: number
): raw is { sentence: string; displaySentence: string; missingWord: string; choices: any[]; translation: string; romanization?: string } {
  if (!raw.sentence?.trim()) {
    console.warn(`[PHRASE] attempt ${attempt}: missing sentence`);
    return false;
  }
  if (!raw.missingWord?.trim()) {
    console.warn(`[PHRASE] attempt ${attempt}: missing missingWord`);
    return false;
  }
  if (!raw.displaySentence?.includes("____")) {
    console.warn(`[PHRASE] attempt ${attempt}: no ____ in displaySentence — raw:`, raw.displaySentence);
    return false;
  }
  if (!Array.isArray(raw.choices) || raw.choices.length < 2) {
    console.warn(`[PHRASE] attempt ${attempt}: bad choices`);
    return false;
  }

  // THE critical check — missingWord must exist verbatim in sentence
  // (catches "Je vais au ____." where blank was the placeholder, not a replacement)
  if (!raw.sentence.includes(raw.missingWord)) {
    console.warn(`[PHRASE] attempt ${attempt}: missingWord "${raw.missingWord}" NOT found in sentence "${raw.sentence}"`);
    return false;
  }

  // ____ must not be at the very end
  const trimmed = raw.displaySentence.replace(/[\s。！？.!?、,]+$/, "").trimEnd();
  if (trimmed.endsWith("____")) {
    console.warn(`[PHRASE] attempt ${attempt}: blank is at end of sentence`);
    return false;
  }

  console.log(`[PHRASE] attempt ${attempt} VALID ✓ | word: "${raw.missingWord}" | sentence: "${raw.sentence}"`);
  return true;
}

// ─── normalise choices to always be PhraseChoice[] ───────────────────────────

export function normaliseChoices(
  raw: any[],
  correctWord: string,
  showRomanization: boolean
): PhraseChoice[] {
  const choices: PhraseChoice[] = raw.map((c) => {
    if (typeof c === "string") return { text: c };
    if (typeof c === "object" && c.text) return { text: c.text, romanization: c.romanization };
    return { text: String(c) };
  });

  // Guarantee the correct answer is present
  const hasCorrect = choices.some((c) => c.text === correctWord);
  if (!hasCorrect) {
    choices[0] = { text: correctWord };
  }

  return choices;
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