import { zhHans } from "./zhHans/index";
import type { UiLanguage } from "./languages";

export function menuTable(language: UiLanguage): Record<string, string> {
  return language === "zh-Hans" ? zhHans : {};
}
