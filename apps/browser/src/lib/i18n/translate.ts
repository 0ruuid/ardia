import { zhHans } from "./zhHans/index";
import type { UiLanguage } from "./languages";

export type TranslateParams = Record<string, string | number>;

export function translate(text: string, language: UiLanguage, params?: TranslateParams): string {
  const source = language === "zh-Hans" ? (zhHans[text] ?? text) : text;
  if (!params) return source;
  return source.replace(/\{(\w+)\}/g, (whole, key: string) => (key in params ? String(params[key]) : whole));
}

export function translatorFor(language: UiLanguage) {
  return (text: string, params?: TranslateParams) => translate(text, language, params);
}

export type Translate = ReturnType<typeof translatorFor>;
