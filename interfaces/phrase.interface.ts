import { languages } from '../constants/languages.constant';

export type Phrase = string;
export type PhraseKey = string;
export type Language = keyof typeof languages;
export type NamespaceKey = string;

export interface Namespace {
  [key: PhraseKey]: Namespace | Phrase;
}

export type NamespaceDictionary = Record<NamespaceKey, Namespace>;

export type LanguageDictionary = Partial<Record<Language, NamespaceDictionary>>;
