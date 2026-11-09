import { useSettings } from "../../../state/browser/hooks";
import { updateSettings } from "../../../state/settings/actions";
import { PopUp } from "../../ui";
import { Group, Row, SectionHeader, SettingToggle } from "../Form";
import { useT } from "../../../state/i18n";

export function BookmarksBarSection() {
  const t = useT();
  const mode = useSettings((s) => s.bookmarksBar);
  const size = useSettings((s) => s.bookmarksBarSize);
  return (
    <>
      <SectionHeader title="Bookmarks" />
      <Group>
        <SettingToggle anchor="appearance.showBookmarks" />
        <Row anchor="appearance.bookmarksBar">
          <PopUp
            value={mode}
            options={[
              { value: "always", title: t("Always") },
              { value: "newTab", title: t("On New Tab Only") },
              { value: "never", title: t("Never") },
            ]}
            onChange={(v) => updateSettings({ bookmarksBar: v })}
            minWidth={160}
          />
        </Row>
        <Row anchor="appearance.bookmarksBarSize">
          <PopUp
            value={size}
            options={[
              { value: "default", title: t("Default") },
              { value: "large", title: t("Large") },
            ]}
            onChange={(v) => updateSettings({ bookmarksBarSize: v })}
            minWidth={160}
          />
        </Row>
      </Group>
    </>
  );
}
