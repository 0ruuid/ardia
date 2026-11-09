import { Box, EmptyState, ListRow, SearchField, space, Symbol, Text } from "../ui";
import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, View, type TextInput } from "react-native";
import { useTheme } from "../ui/theme";
import { groupByPane, search } from "./searchMatch";
import { currentSettingsSearch, moveSettingsSelection, revealSetting, selectSettingsResult, setSettingsQuery, useSettingsSearch } from "../../state/settings/searchState";
import { PANES, localizedIndex, type SettingEntry } from "./settingsIndex";
import { useUnshownSettings } from "./Form";
import { settingsInk } from "./tokens";
import { useT, useUiLanguage } from "../../state/i18n";
import type { UiLanguage } from "../../lib/i18n/languages";

export function SettingsSearchField() {
  const t = useT();
  const language = useUiLanguage();
  const query = useSettingsSearch((s) => s.query);
  const focusRequest = useSettingsSearch((s) => s.focusRequest);
  const input = useRef<TextInput>(null);
  const unshown = useUnshownSettings();
  useEffect(() => {
    if (!focusRequest) return;
    input.current?.focus();
    input.current?.setSelection(0, currentSettingsSearch().query.length);
  }, [focusRequest]);
  return (
    <View style={FIELD}>
      <SearchField
      inputRef={input}
      value={query}
      onChangeText={(text) => {
        setSettingsQuery(text);
        selectSettingsResult(0);
      }}
      placeholder={t("Search")}
      onSubmit={() => {
        const { query, selected } = currentSettingsSearch();
        const hit = settingsResults(query, unshown, language)[selected];
        if (hit) revealSetting(hit);
      }}
      onArrow={(step) => {
        const count = settingsResults(currentSettingsSearch().query, unshown, language).length;
        if (!count) return;
        moveSettingsSelection(step, count);
      }}
      />
    </View>
  );
}

const FIELD = { marginHorizontal: space.ml, marginBottom: space.ml } as const;

let cached: { query: string; unshown: ReadonlySet<string>; language: UiLanguage; results: SettingEntry[] } = { query: "", unshown: new Set(), language: "en", results: [] };

export function settingsResults(query: string, unshown: ReadonlySet<string>, language: UiLanguage): SettingEntry[] {
  if (cached.query !== query || cached.unshown !== unshown || cached.language !== language) {
    const hits = search(localizedIndex(language).filter((p) => !unshown.has(p.entry.id)), query);
    cached = { query, unshown, language, results: groupByPane(hits).flatMap((g) => g.hits.map((h) => h.entry)) };
  }
  return cached.results;
}

export function SettingsSearchResults({ query }: { query: string }) {
  const t = useT();
  const language = useUiLanguage();
  const theme = useTheme();
  const selected = useSettingsSearch((s) => s.selected);
  const results = settingsResults(query, useUnshownSettings(), language);
  const groups = useMemo(() => {
    const out: { pane: (typeof PANES)[number]; rows: { entry: SettingEntry; index: number }[] }[] = [];
    results.forEach((entry, index) => {
      const last = out.at(-1);
      if (last?.pane.id === entry.pane) last.rows.push({ entry, index });
      else out.push({ pane: PANES.find((p) => p.id === entry.pane)!, rows: [{ entry, index }] });
    });
    return out;
  }, [results]);
  const scroller = useRef<ScrollView>(null);
  const [rowTops] = useState(() => new Map<number, number>());
  useEffect(() => {
    const top = rowTops.get(selected);
    if (top !== undefined) scroller.current?.scrollTo({ y: Math.max(0, top - 60), animated: false });
  }, [selected]);

  if (!results.length) {
    return <EmptyState symbol="magnifyingglass" title={t("No Results")} subtitle={t("Nothing matches “{query}”.", { query: query.trim() })} />;
  }
  return (
    <ScrollView ref={scroller} contentContainerStyle={RESULTS}>
      {groups.map((group) => (
        <View key={group.pane.id} onLayout={(e) => group.rows.forEach((r, i) => rowTops.set(r.index, e.nativeEvent.layout.y + GROUP_HEADER + i * RESULT_HEIGHT))}>
          <Box row gap="s" padX="m" style={GROUP_TITLE}>
            <Symbol name={group.pane.icon} size={11} color={theme.textTertiary} style={GROUP_ICON} />
            <Text size="caption" weight="semibold" tone="textTertiary" lines={1}>
              {t(group.pane.title)}
            </Text>
          </Box>
          {group.rows.map(({ entry, index }) => (
            <ResultRow key={entry.id} entry={entry} selected={index === selected} onHover={() => selectSettingsResult(index)} />
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const RESULT_HEIGHT = 40;
const GROUP_HEADER = 26;
const RESULTS = { paddingHorizontal: space.ml, paddingBottom: space.l } as const;
const GROUP_TITLE = { height: GROUP_HEADER, alignItems: "center", marginTop: space.xs } as const;
const GROUP_ICON = { width: 16, height: 16 } as const;

function ResultRow({ entry, selected, onHover }: { entry: SettingEntry; selected: boolean; onHover: () => void }) {
  const t = useT();
  const theme = useTheme();
  const detail = entry.section !== entry.title ? entry.section : entry.paneTitle;
  return (
    <ListRow height={RESULT_HEIGHT} selected={selected} selectedTone="accent" onHover={(hovered) => hovered && onHover()} onPress={() => revealSetting(entry)}>
      <View style={RESULT_TEXT}>
        <Text lines={1} tone={selected ? "onAccent" : "textPrimary"}>
          {t(entry.title)}
        </Text>
        <Text size="caption" lines={1} color={selected ? settingsInk.onAccentSecondary : theme.textSecondary}>
          {t(detail)}
        </Text>
      </View>
    </ListRow>
  );
}

const RESULT_TEXT = { flex: 1 } as const;
