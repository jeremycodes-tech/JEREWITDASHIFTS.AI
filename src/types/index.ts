export type Section = "today" | "yesterday" | "lastWeek";

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  title: string;
  section: Section;
  messages: Message[];
  model: "openai" | "groq"; // 🔹 must always be defined
}
