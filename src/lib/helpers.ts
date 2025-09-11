import { Section } from "../types";

export const getSection = (date: Date): Section => {
  const today = new Date();
  const diff = today.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return "lastWeek";
};

export const toTitleCase = (s: string) =>
  s.replace(/\w\S*/g, (t) => t[0].toUpperCase() + t.slice(1).toLowerCase());

export const summarizeTitle = (text: string): string => {
  const normalized = text.trim().replace(/\s+/g, " ");
  const explicit: { re: RegExp; title: string }[] = [
    { re: /(current.*president.*us)/i, title: "Current US President" },
    { re: /(nba.*finals.*winner)/i, title: "NBA Finals Winner" },
    { re: /(btc|eth).*price/i, title: "Crypto/FX Rate" },
    { re: /(weather|forecast)/i, title: "Weather (Current)" },
  ];
  for (const e of explicit) if (e.re.test(normalized)) return e.title;
  let s = normalized
    .replace(/^(who|what|whats|define|give me|find)\b[^a-z0-9]*/i, "")
    .replace(/^(the|a|an)\s+/i, "")
    .replace(/[?.!]+$/g, "");
  const words = s.split(/\s+/).slice(0, 7).join(" ");
  s = toTitleCase(words);
  if (!s) return "New Chat";
  return s.length > 40 ? `${s.slice(0, 37)}…` : s;
};
