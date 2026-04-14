//lib/prompts/anki.ts
import type { LearnerProfile } from "../../types/learner";

/**
 * Builds the system + user messages for generating Anki flash cards.
 * The model must return a strict JSON array — no prose, no markdown fences.
 */
export function buildAnkiPrompt(
  topic: string,
  count: number,
  profile: LearnerProfile
) {
  const { language, level, explanationLanguage, showRomanization } = profile;

  const romanizationInstruction = showRomanization
    ? `Include a "romanization" field with the pronunciation (romaji for Japanese, pinyin for Mandarin, romanization for Korean).`
    : `Omit the "romanization" field.`;

  const system = `You are a language learning assistant that generates flash card data.
You MUST respond ONLY with a valid JSON array. No explanation, no markdown, no prose.
The JSON array format is:
[
  {
    "front": "<word or short phrase in ${language}>",
    "back": "<translation in ${explanationLanguage}>",
    "romanization": "<pronunciation guide if applicable>",
    "example": "<one short example sentence in ${language}>"
  }
]
${romanizationInstruction}
Adjust difficulty strictly for CEFR level ${level}.`;

  const user = `Generate exactly ${count} flash cards about the topic: "${topic}".
Language: ${language}. Level: ${level}. Translation language: ${explanationLanguage}.
Return ONLY the JSON array.`;

  return { system, user };
}