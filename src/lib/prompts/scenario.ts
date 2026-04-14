//lib/prompts/scenario.ts

import type { LearnerProfile } from "../../types/learner";

/**
 * Builds the prompt for generating authentic native-speaker dialogues.
 */
export function buildScenarioPrompt(
  scenarioText: string,
  profile: LearnerProfile
) {
  const { language, level, explanationLanguage, showRomanization } = profile;

  const romanizationInstruction = showRomanization
    ? `Include "romanization" for each turn with the pronunciation guide.`
    : `Omit the "romanization" field.`;

  const system = `You are a language learning assistant that writes realistic native-speaker dialogues.
You MUST respond ONLY with a valid JSON object. No explanation, no markdown, no prose.
The JSON format is:
{
  "scenario": "<brief scenario description>",
  "turns": [
    {
      "speaker": "<Speaker name, e.g. Yuki>",
      "original": "<utterance in ${language}>",
      "translation": "<translation in ${explanationLanguage}>",
      "romanization": "<pronunciation if applicable>"
    }
  ]
}
Rules:
- Use 2 speakers with natural names for the culture.
- Generate 4 to 6 turns total (back and forth).
- Write natural, authentic dialogue — not textbook language.
- Adjust vocabulary and grammar for CEFR level ${level}.
- ${romanizationInstruction}`;

  const user = `Write a realistic dialogue in ${language} for this scenario: "${scenarioText}".
Level: ${level}. Return ONLY the JSON object.`;

  return { system, user };
}