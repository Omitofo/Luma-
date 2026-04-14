/**
 * types/llm.ts
 *
 * Source-of-truth types now live in the prompt modules themselves:
 *   AnkiCard       → src/lib/prompts/anki.ts
 *   PhraseChallenge → src/lib/prompts/phraseBuilder.ts
 *   ScenarioDialogue → src/lib/prompts/scenario.ts
 *
 * This file re-exports them for backward compatibility.
 */

export type { AnkiCard }           from "../lib/prompts/anki";
export type { PhraseChallenge }    from "../lib/prompts/phraseBuilder";
export type { ScenarioDialogue, ScenarioTurn } from "../lib/prompts/scenario";

/**
 * @deprecated — choices are now plain strings.
 * Kept only to avoid TypeScript errors in any remaining files that import this.
 */
export interface PhraseChoice {
  text: string;
  romanization?: string;
}