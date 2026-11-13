import type { DownloadSettings } from "../../../state/downloads/actions";
import { checkForUpdates, setLaunchAtLogin } from "../../../state/app/appSettings";
import { pickFolder } from "../../../state/app/system";
import { ActivitySpinner, Button, PopUp, space, Symbol, Toggle } from "../../ui";
import { useEffect } from "react";
import { AppState, View } from "react-native";
import { useTheme } from "../../ui/theme";
import { updateSettings } from "../../../state/settings/actions";
import { currentEngineProfile } from "../../../state/browser/current";
import { useProfiles, useSettings } from "../../../state/browser/hooks";
import { SHARING_COPY } from "../../../state/telemetry/copy";
import { Anchor, Group, ProfilePicker, Row, SectionHeader, SettingToggle, useSettingsProfile } from "../Form";
import { defaultBrowser, downloadSettings, followUpdater, loginItem, makeDefaultBrowser, setDownloadsFor, setUpdaterPrefs, updater } from "../../../state/settings/paneData";
import { checkNowControl, switchCheckLine, updaterBusy } from "../../../state/settings/updateStatus";
import { useResource } from "../../../state/settings/resources";
import { openImport } from "../../../state/settings/settingsWindows";
import { redoSetupFromSettings } from "../../../state/onboarding/redo";
import { ExportBookmarksRow } from "./ExportBookmarksRow";
import { SetupCodeRow } from "./SetupCodeRow";
import { UI_LOCALE } from "../../../lib/uiLocale";
import { useT } from "../../../state/i18n";

const APP = "Ardia";

export function GeneralPane() {
  const t = useT();
  const openLinksInLittleArdia = useSettings((s) => s.openLinksInLittleArdia);
  const restoreSession = useSettings((s) => s.restoreSession);
  const commandBarPreference = useSettings((s) => s.commandBarPreference);
  const language = useSettings((s) => s.language);
  const [loginStatus = "notRegistered", refreshLogin] = useResource(loginItem);

  return (
    <View>
      <DefaultBrowserBanner />

      <SectionHeader anchor="general.language" />
      <Group>
        <Row anchor="general.language">
          <PopUp
            value={language}
            options={[
              { value: "system", title: t("System default") },
              { value: "en", title: "English" },
              { value: "zh-Hans", title: "简体中文" },
            ]}
            onChange={(v) => updateSettings({ language: v })}
            minWidth={190}
          />
        </Row>
      </Group>

      <SectionHeader title={t("General")} />
      <Group>
        <Row
          anchor="general.openAtLogin"
          description={loginStatus === "requiresApproval" ? t("Allow it in System Settings › General › Login Items.") : undefined}
        >
          <Toggle
            value={loginStatus === "enabled" || loginStatus === "requiresApproval"}
            onChange={(on) => void setLaunchAtLogin(on).catch(() => {}).finally(refreshLogin)}
          />
        </Row>
        <SettingToggle anchor="general.warnBeforeQuitting" />
        <SettingToggle anchor="general.warnBeforeClosingWindow" />
        <SettingToggle
          anchor="general.openLinksInLittleArdia"
          description={
            openLinksInLittleArdia
              ? t("A link from Discord, Slack or Mail opens in Little Ardia, a small window of its own. ⌘O moves it into Ardia; closing it throws it away.")
              : t("A link from Discord, Slack or Mail opens as a new tab in the Ardia window you used last.")
          }
        />
        <SettingToggle anchor="general.littleArdiaOpensNewTabLinks" />
      </Group>

      <SectionHeader title={t(`When quitting ${APP}:`)} />
      <Group>
        <Row anchor="general.windowsAndTabs">
          <PopUp
            value={restoreSession ? "keep" : "close"}
            options={[
              { value: "keep", title: t("Preserve tabs and windows") },
              { value: "close", title: t("Start fresh") },
            ]}
            onChange={(v) => updateSettings({ restoreSession: v === "keep" })}
            minWidth={190}
          />
        </Row>
      </Group>

      <SectionHeader title={t("Command bar")} description={t("What happens when what you type could be a website or a search.")} />
      <Group>
        <Row anchor="general.commandBarPreference">
          <PopUp
            value={commandBarPreference}
            options={[
              { value: "website", title: t("Use Website First") },
              { value: "search", title: t("Prefer Search Engine") },
            ]}
            onChange={(v) => updateSettings({ commandBarPreference: v })}
            minWidth={190}
          />
        </Row>
      </Group>

      <DownloadsSection />

      <UpdatesSection />

      <SectionHeader title={t("Import and Export")} />
      <Group>
        <Row anchor="general.importBrowser">
          <Button title={t("Import…")} onPress={openImport} />
        </Row>
        <ExportBookmarksRow />
        <SetupCodeRow />
      </Group>
    </View>
  );
}

const homeRelative = (path: string) => path.replace(/^\/Users\/[^/]+(?=\/|$)/, "~");

function DownloadsSection() {
  const t = useT();
  const profiles = useProfiles();
  const [profileId, setProfileId] = useSettingsProfile();
  const profile = currentEngineProfile(profileId);
  const [current] = useResource(downloadSettings, profile);
  const others = [...new Set(profiles.map((p) => currentEngineProfile(p.id)))].filter((p) => p !== profile);
  const apply = (patch: Partial<Pick<DownloadSettings, "folder" | "askWhereToSave">>, targets = [profile]) => void setDownloadsFor(patch, targets);
  const change = async () => {
    if (!current) return;
    const folder = await pickFolder(current.folder, t("Use Folder"));
    if (folder) apply({ folder });
  };

  return (
    <>
      <SectionHeader
        title={t("Downloads")}
        description={profiles.length > 1 ? t("Each profile saves to its own folder.") : undefined}
        action={<ProfilePicker value={profileId} onChange={setProfileId} />}
      />
      <Group>
        <Row
          anchor="general.downloadsFolder"
          description={current ? (current.managed ? t("{path}, set by your organization.", { path: homeRelative(current.folder) }) : homeRelative(current.folder)) : undefined}
        >
          <Button title={t("Change…")} disabled={!current || current.managed} onPress={() => void change()} />
        </Row>
        <Row anchor="general.askWhereToSave">
          <Toggle value={current?.askWhereToSave ?? false} disabled={!current || current.managed} onChange={(v) => apply({ askWhereToSave: v })} />
        </Row>
        {others.length > 0 && (
          <Row anchor="general.downloadsAllProfiles">
            <Button
              title={t("Use for All Profiles")}
              disabled={!current || current.managed}
              onPress={() => current && apply({ folder: current.folder, askWhereToSave: current.askWhereToSave }, others)}
            />
          </Row>
        )}
      </Group>
    </>
  );
}

function UpdatesSection() {
  const t = useT();
  const [state, reload] = useResource(updater);
  const refresh = () => void reload();
  useEffect(() => {
    const sub = AppState.addEventListener("change", refresh);
    return () => sub.remove();
  }, []);
  const busy = updaterBusy(state);
  useEffect(() => {
    if (busy) followUpdater();
  }, [busy]);
  if (!state?.available) return null;
  const ready = state.configured;
  const lastCheck = state.lastCheck
    ? t("Last checked {date}.", { date: new Date(state.lastCheck).toLocaleString(UI_LOCALE, { dateStyle: "medium", timeStyle: "short" }) })
    : t("Not checked yet.");
  const status = switchCheckLine(state, APP) ?? lastCheck;
  const checkNow = checkNowControl(state);
  return (
    <>
      <SectionHeader title={t("Updates")} description={ready ? undefined : t("Updates aren't set up for this build.")} />
      <Group>
        <Row anchor="general.updateChecks" description={`${t(SHARING_COPY.updateChecks)} ${t(SHARING_COPY.switchFile)}`}>
          <Toggle value={ready && state.automaticChecks} disabled={!ready} onChange={(v) => setUpdaterPrefs({ automaticChecks: v })} />
        </Row>
        <Row anchor="general.autoUpdate">
          <Toggle
            value={ready && state.automaticChecks && state.automaticDownloads}
            disabled={!ready || !state.automaticChecks}
            onChange={(v) => setUpdaterPrefs({ automaticDownloads: v })}
          />
        </Row>
        {state.channel && (
          <Row anchor="general.updateChannel">
            <PopUp
              value={state.channel}
              options={[
                { value: "stable", title: t("Stable") },
                { value: "nightly", title: t("Nightly") },
              ]}
              disabled={!ready}
              onChange={(channel) => setUpdaterPrefs({ channel })}
              minWidth={190}
            />
          </Row>
        )}
        <Row anchor="general.checkNow" title={`${APP} ${state.displayVersion ?? state.version}`} description={ready ? status : undefined}>
          <View style={CHECK_NOW}>
            {checkNow.checking ? <ActivitySpinner style={CHECK_SPINNER} /> : null}
            <Button title={t(checkNow.title)} disabled={checkNow.disabled} onPress={() => checkNow.pressable && void checkForUpdates().finally(() => followUpdater())} />
          </View>
        </Row>
      </Group>
    </>
  );
}

function DefaultBrowserBanner() {
  const t = useT();
  const theme = useTheme();
  const [isDefault, reload] = useResource(defaultBrowser);
  useEffect(() => {
    const sub = AppState.addEventListener("change", () => void reload());
    return () => sub.remove();
  }, []);
  return (
    <Anchor id="general.defaultBrowser" shape="card" style={BANNER}>
      <Group>
        <Row
          icon={<Symbol name={isDefault ? "checkmark.seal.fill" : "safari"} size={20} color={isDefault ? theme.success : theme.icon} style={BANNER_ICON} />}
          title={isDefault ? t(`${APP} is your default browser`) : t(`${APP} works best as your default browser`)}
        >
          {!isDefault && <Button title={t(`Set ${APP} as Default`)} kind="primary" onPress={() => void makeDefaultBrowser()} />}
        </Row>
        <Row anchor="general.redoSetup" icon={<Symbol name="sparkles" size={18} color={theme.icon} style={BANNER_ICON} />} description="Walk through import, look and layout again">
          <Button title="Redo Setup…" onPress={redoSetupFromSettings} />
        </Row>
      </Group>
    </Anchor>
  );
}

const BANNER = { marginTop: space.xxl } as const;
const BANNER_ICON = { width: 28, height: 28 } as const;

const CHECK_NOW = { flexDirection: "row", alignItems: "center", gap: space.m } as const;
const CHECK_SPINNER = { width: 14, height: 14 } as const;
