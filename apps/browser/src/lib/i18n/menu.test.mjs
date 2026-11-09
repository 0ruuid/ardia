import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { menuTable } from "./menu.ts";
import { zhHans } from "./zhHans/index.ts";

const shell = new URL("../../../../../packages/shell/ios/", import.meta.url);

const PATTERNS = [
  /\btop\("([^"]+)"/g,
  /\bsub\("([^"]+)"/g,
  /\bstd\("([^"]+)"/g,
  /MenuTranslator\.text\("([^"]+)"/g,
  /NSMenu\(title: "([^"]+)"/g,
  /NSMenuItem\(title: "([^"]+)"/g,
];

function titlesIn(file) {
  const source = readFileSync(new URL(file, shell), "utf8");
  const found = new Set();
  for (const pattern of PATTERNS) {
    for (const match of source.matchAll(pattern)) if (!match[1].includes("\\(")) found.add(match[1]);
  }
  return found;
}

test("every native menu title has a translation", () => {
  const table = readFileSync(new URL("CommandTable.swift", shell), "utf8");
  const titles = new Set([...table.matchAll(/^\s+"[^"]+": "((?:[^"\\]|\\.)*)",/gm)].map((match) => match[1]));
  for (const file of ["MainMenu.swift", "MainMenu+Shortcuts.swift", "MenuTarget.swift"]) {
    for (const title of titlesIn(file)) titles.add(title);
  }
  assert.deepEqual([...titles].filter((title) => !(title in zhHans)), []);
});

test("menuTable is the dictionary in Chinese and empty in English", () => {
  assert.ok(Object.keys(menuTable("zh-Hans")).length > 500);
  assert.deepEqual(menuTable("en"), {});
});
