import type { LearnerProfile } from "../../types/learner";

export function buildPhraseBuilderPrompt(profile: LearnerProfile) {
  const { language, level, explanationLanguage } = profile;

  const system = `You are a strict Japanese language exercise generator.

YOU MUST ALWAYS INCLUDE ROMANIZATION.

OUTPUT RULES:
- Return ONLY valid JSON
- No markdown, no explanation

FORMAT:
{
  "sentence": "...",
  "displaySentence": "...",
  "missingWord": "...",
  "choices": ["...", "...", "...", "..."],
  "translation": "...",
  "romanization": "..."
}

RULES:
- sentence MUST be natural Japanese
- displaySentence MUST replace ONE meaningful word with "____"
- missingWord MUST be exactly the removed word
- romanization MUST be full sentence in romaji
- choices MUST be 4 items (1 correct + 3 wrong same part of speech)
- NEVER place blank at sentence end
- Remove only ONE grammatical unit (noun, verb, particle, auxiliary)

LEVEL: CEFR ${level}
LANGUAGE: ${language}
TRANSLATION LANGUAGE: ${explanationLanguage}
`;

  const user = `Generate ONE Japanese sentence.

IMPORTANT:
- blank MUST replace a real word inside sentence
- DO NOT place blank at end
- return ONLY JSON`;

  return { system, user };
}