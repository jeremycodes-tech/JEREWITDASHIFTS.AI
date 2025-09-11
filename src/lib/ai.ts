import OpenAI from "openai";

// 🔹 OpenAI client (normal chat)
export const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// 🔹 Groq client (Pro Tech Dev chat)
export const groq = new OpenAI({
  apiKey: import.meta.env.VITE_GROQ_API_KEY, // set in .env
  baseURL: "https://api.groq.com/openai/v1",
  dangerouslyAllowBrowser: true,
});

// 🔹 System prompt for OpenAI
export function systemPrompt(now: Date) {
  return `You are a helpful assistant with access to live "Web context". 
Current datetime: ${now.toISOString()} (local: ${now.toLocaleString()}).
Use sources if given. Expand clearly. Always cite.`;
}

// 🔹 System prompt for Groq (strict dev focus)
export function proDevPrompt() {
  return `You are a professional senior web developer.
Always provide **complete, production-ready** code when asked.
If the request is about a website, include **HTML, CSS, JS, or React files** as needed.
Explain briefly, then give full code. Do not cut corners.`;
}
