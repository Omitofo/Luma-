export interface LlmMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface LlmRequest {
  messages: LlmMessage[];
  maxTokens?: number;
  temperature?: number;
}

export interface AnkiCard {
  front: string;        // word/phrase in target language
  back: string;         // translation in explanation language
  romanization?: string; // romaji / pinyin / romanization
  example?: string;     // optional example sentence
}

export interface PhraseChallenge {
  sentence: string;          // full sentence in target language
  displaySentence: string;   // sentence with ____ for missing word
  missingWord: string;       // correct answer
  choices: string[];         // array of 4 choices including correct
  translation: string;       // full sentence translation
}

export interface ScenarioDialogue {
  scenario: string;
  turns: DialogueTurn[];
}

export interface DialogueTurn {
  speaker: string;
  original: string;
  translation: string;
  romanization?: string;
}