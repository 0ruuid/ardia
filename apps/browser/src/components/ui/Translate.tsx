import { createContext, useContext, type ReactNode } from "react";

export type TranslateText = (text: string, params?: Record<string, string | number>) => string;

const identity: TranslateText = (text) => text;
const TranslateContext = createContext<TranslateText>(identity);

export function TranslateProvider({ value, children }: { value: TranslateText; children: ReactNode }) {
  return <TranslateContext.Provider value={value}>{children}</TranslateContext.Provider>;
}

export const useTranslate = (): TranslateText => useContext(TranslateContext);
