export type WebSource = { title?: string; link: string; snippet?: string };

const SERPER_TOP_N = 5;
const WEB_MAX_CHARS = 2500;

export async function ddgInstantAnswer(query: string) {
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
  const res = await fetch(url);
  const data = await res.json();
  const text = data.Answer || data.AbstractText || "";
  return { text, url: data.AbstractURL || "" };
}

export async function fetchFromSerper(query: string) {
  const apiKey = import.meta.env.VITE_SERPER_API_KEY;
  if (!apiKey) return { text: "", sources: [] };
  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-KEY": apiKey },
    body: JSON.stringify({ q: query }),
  });
  const data = await res.json();
  const parts: string[] = [];
  const sources: WebSource[] = [];
  if (data.organic) {
    for (const o of data.organic.slice(0, SERPER_TOP_N)) {
      if (o.snippet) parts.push(o.snippet);
      if (o.link) sources.push({ title: o.title, link: o.link, snippet: o.snippet });
    }
  }
  return { text: parts.join("\n\n").slice(0, WEB_MAX_CHARS), sources };
}

export async function fetchFreshFact(query: string) {
  const serper = await fetchFromSerper(query);
  if (serper.text) return serper;
  try {
    const r = await ddgInstantAnswer(query);
    return { text: r.text, sources: r.url ? [{ link: r.url }] : [] };
  } catch {
    return { text: "", sources: [] };
  }
}
