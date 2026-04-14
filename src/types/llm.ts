export interface PhraseChoice {
  text: string;
  romanization?: string;
}

export interface PhraseChallenge {
  sentence: string;
  displaySentence: string;
  missingWord: string;
  choices: PhraseChoice[];
  translation: string;
  romanization?: string;
}

export interface AnkiCard {
  front: string;
  back: string;
  romanization?: string;
  example?: string;
}