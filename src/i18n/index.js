import { reactive } from "vue";
import dayjs from "@/utils/dayjs";
import messages from "@/i18n/messages.js";

const SUPPORTED = new Set(["en", "sv"]);
const STORAGE_KEY = "locale";

export const i18nState = reactive({
  locale: "en",
});

function readByPath(source, path) {
  return path.split(".").reduce((value, key) => value?.[key], source);
}

function readStoredLocale() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return SUPPORTED.has(stored) ? stored : null;
  } catch {
    return null;
  }
}

function writeStoredLocale(locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Ignore private-mode / blocked storage.
  }
}

export function t(key, vars) {
  let value =
    readByPath(messages[i18nState.locale], key) ??
    readByPath(messages.en, key) ??
    key;
  if (vars && typeof value === "string") {
    value = value.replace(/\{(\w+)\}/g, (_, name) =>
      vars[name] == null ? `{${name}}` : String(vars[name]),
    );
  }
  return value;
}

export function localeFromHostname(hostname = window.location.hostname) {
  const host = hostname.replace(/^www\./, "").toLowerCase();
  if (host === "huegoal.se" || host.endsWith(".se")) {
    return "sv";
  }
  return "en";
}

export function detectLocale() {
  const query = new URLSearchParams(window.location.search).get("lang");
  if (SUPPORTED.has(query)) {
    return query;
  }
  return readStoredLocale() ?? localeFromHostname();
}

export function applyLocale(locale) {
  const next = SUPPORTED.has(locale) ? locale : "en";
  i18nState.locale = next;
  document.documentElement.lang = next;
  dayjs.locale(next);
  document.title = t("meta.title");
}

export function setLocale(locale) {
  applyLocale(locale);
  writeStoredLocale(i18nState.locale);
}

export function initI18n() {
  applyLocale(detectLocale());
}

export default {
  install(app) {
    initI18n();
    app.config.globalProperties.$t = t;
    app.config.globalProperties.$i18n = i18nState;
    app.config.globalProperties.$setLocale = setLocale;
  },
};
