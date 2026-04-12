import type { LearnerProfile } from "../../types/learner";

/**
 * Builds the prompt for generating phrase-builder challenges.
 * Returns a JSON object with one challenge at a time.
 */
export function buildPhraseBuilderPrompt(profile: LearnerProfile) {
  const { language, level, explanationLanguage } = profile;

  const system = `You are a language learning assistant generating fill-in-the-blank grammar exercises.
You MUST respond ONLY with a valid JSON object. No explanation, no markdown, no prose.
The JSON format is:
{
  "sentence": "<complete sentence in ${language}>",
  "displaySentence": "<same sentence with the missing word replaced by ____>",
  "missingWord": "<the correct missing word>",
  "choices": ["<correct word>", "<wrong1>", "<wrong2>", "<wrong3>"],
  "translation": "<full sentence translation in ${explanationLanguage}>"
}
Rules:
- Remove exactly ONE word from the sentence to create the blank.
- Choose a word that tests grammar or vocabulary relevant to level ${level}.
- The 3 wrong choices must be plausible but clearly incorrect in context.
- Shuffle the choices array so the correct answer is not always first.
- Adjust complexity strictly for CEFR level ${level}.`;

  const user = `Generate one fill-in-the-blank sentence in ${language} at level ${level}.
Return ONLY the JSON object.`;

  return { system, user };
}