import { useMemo } from "react";
import { useBrowser } from "./browser/store";
import { resolveUiLanguage, type LanguageSetting, type UiLanguage } from "../lib/i18n/languages";
import { translatorFor, type Translate } from "../lib/i18n/translate";
import { systemLanguages } from "../platform/locale";

export function uiLanguage(setting: LanguageSetting): UiLanguage {
  return resolveUiLanguage(setting, systemLanguages());
}

export function useUiLanguage(): UiLanguage {
  const setting = useBrowser((s) => s.settings.language);
  return useMemo(() => uiLanguage(setting), [setting]);
}

export function useT(): Translate {
  const language = useUiLanguage();
  return useMemo(() => translatorFor(language), [language]);
}

export function currentUiLanguage(): UiLanguage {
  return uiLanguage(useBrowser.getState().settings.language);
}

export function currentT(): Translate {
  return translatorFor(currentUiLanguage());
}
