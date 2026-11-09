import type { UiLanguage } from "./languages";
import { translate } from "./translate";

let active: UiLanguage = "en";

export function setActiveLanguage(language: UiLanguage) {
  active = language;
}

export function activeLanguage(): UiLanguage {
  return active;
}

export function translateActive(text: string): string {
  return translate(text, active);
}
