import { reactive } from "vue";
import dayjs from "@/utils/dayjs";
import messages from "@/i18n/messages.js";

const SUPPORTED = new Set(["en", "sv"]);

export const i18nState = reactive({
  locale: "en",
});

function readByPath(source, path) {
  return path.split(".").reduce((value, key) => value?.[key], source);
}

export function t(key) {
  return (
    readByPath(messages[i18nState.locale], key) ??
    readByPath(messages.en, key) ??
    key
  );
}

export function detectLocale() {
  const query = new URLSearchParams(window.location.search).get("lang");
  if (SUPPORTED.has(query)) {
    return query;
  }
  if (window.location.hostname.endsWith(".se")) {
    return "sv";
  }
  return "en";
}

export function applyLocale(locale) {
  const next = SUPPORTED.has(locale) ? locale : "en";
  i18nState.locale = next;
  document.documentElement.lang = next;
  dayjs.locale(next);
  document.title = t("meta.title");
}

export function localeHref(locale) {
  const { protocol, hostname, pathname, hash } = window.location;
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
  if (isLocal) {
    return `${pathname}?lang=${locale}${hash}`;
  }
  const host = locale === "sv" ? "huegoal.se" : "huegoal.com";
  return `${protocol}//${host}${pathname}${hash}`;
}

export function initI18n() {
  applyLocale(detectLocale());
}

export default {
  install(app) {
    initI18n();
    app.config.globalProperties.$t = t;
    app.config.globalProperties.$i18n = i18nState;
    app.config.globalProperties.$localeHref = localeHref;
  },
};
