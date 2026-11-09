export type UiLanguage = "en" | "zh-Hans";
export type LanguageSetting = "system" | UiLanguage;

export const UI_LANGUAGES: readonly UiLanguage[] = ["en", "zh-Hans"];

const han = /^(hant|tw|hk|mo)$/i;

export function resolveUiLanguage(setting: LanguageSetting, system: readonly string[]): UiLanguage {
  if (setting !== "system") return setting;
  const first = system[0] ?? "en";
  const parts = first.split(/[-_]/);
  const base = parts[0]?.toLowerCase();
  if (base === "zh") return han.test(parts[1] ?? "") ? "en" : "zh-Hans";
  return "en";
}
