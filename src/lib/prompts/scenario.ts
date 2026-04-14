/**
 * Scenario Dialogue prompt.
 *
 * Contract:
 *   scenario → brief description of the scene (explanation language)
 *   turns    → 4-6 dialogue turns, alternating between 2 speakers
 *     speaker      → realistic first name for the culture
 *     original     → utterance in target language
 *     translation  → meaning in explanation language
 *     romanization → pronunciation (JP/ZH/KO only)
 */

import type { LearnerProfile } from "../../types/learner";

export interface ScenarioTurn {
  speaker: string;
  original: string;
  translation: string;
  romanization?: string;
}

export interface ScenarioDialogue {
  scenario: string;
  turns: ScenarioTurn[];
}

export function buildScenarioPrompt(
  scenarioText: string,
  profile: LearnerProfile
) {
  const { language, level, explanationLanguage, showRomanization } = profile;

  const langLabel = LANGUAGE_LABELS[language] ?? language;
  const expLabel  = EXPLANATION_LABELS[explanationLanguage] ?? explanationLanguage;

  const romanField = showRomanization
    ? `      "romanization": "<pronunciation>",`
    : `      // romanization: omit this field`;

  return {
    system: `\
You write realistic native-speaker dialogues for language learners.

Respond ONLY with a valid JSON object. Zero prose. Zero markdown.

Required shape:
{
  "scenario": "<one sentence describing the scene in ${expLabel}>",
  "turns": [
    {
      "speaker": "<culturally appropriate first name>",
      "original": "<utterance entirely in ${langLabel}>",
${romanField}
      "translation": "<meaning in ${expLabel}>"
    }
  ]
}

Hard rules:
• "original" in every turn MUST be written in ${langLabel}.
• "translation" MUST be in ${expLabel}.
• Use exactly 2 speakers alternating. Total turns: 4 to 6.
• Dialogue must feel authentic — not textbook. Contractions, natural flow.
• CEFR level: ${level} — adjust vocabulary and grammar accordingly.
• No trailing commas, no extra keys.`,

    user: `Write a ${langLabel} dialogue for this situation: "${scenarioText}".
Level: ${level} | Explanation language: ${expLabel}
Return ONLY the JSON object.`,
  };
}

export function validateScenarioDialogue(
  raw: Partial<ScenarioDialogue>
): raw is ScenarioDialogue {
  if (!raw.scenario) return false;
  if (!Array.isArray(raw.turns) || raw.turns.length < 2) return false;
  return raw.turns.every(
    (t) => t.speaker && t.original && t.translation
  );
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