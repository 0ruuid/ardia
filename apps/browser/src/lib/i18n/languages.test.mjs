import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveUiLanguage } from "./languages.ts";

test("explicit language wins over the system", () => {
  assert.equal(resolveUiLanguage("zh-Hans", ["en-US"]), "zh-Hans");
  assert.equal(resolveUiLanguage("en", ["zh-CN"]), "en");
});

test("system resolves zh variants to zh-Hans", () => {
  assert.equal(resolveUiLanguage("system", ["zh-Hans-CN"]), "zh-Hans");
  assert.equal(resolveUiLanguage("system", ["zh_CN"]), "zh-Hans");
  assert.equal(resolveUiLanguage("system", ["zh"]), "zh-Hans");
});

test("system resolves non-zh and zh-Hant to en", () => {
  assert.equal(resolveUiLanguage("system", ["en-US"]), "en");
  assert.equal(resolveUiLanguage("system", ["ja-JP"]), "en");
  assert.equal(resolveUiLanguage("system", ["zh-TW"]), "en");
  assert.equal(resolveUiLanguage("system", []), "en");
});
