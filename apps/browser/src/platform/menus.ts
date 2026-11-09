import { showMenu as showMenuNative, type MenuItem } from "@ardia/shell";
import { translateActive } from "../lib/i18n/active";

export { menuShown, watchMenus, setMenuLanguage, type MenuEntry } from "@ardia/shell";

const localize = (items: MenuItem[]): MenuItem[] =>
  items.map((item) =>
    "separator" in item
      ? item
      : { ...item, title: translateActive(item.title), ...(item.children ? { children: localize(item.children) } : {}) },
  );

export const showMenu = (items: MenuItem[]) => showMenuNative(localize(items));
export type { MenuItem };
