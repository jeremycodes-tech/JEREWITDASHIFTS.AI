import { useState, useEffect, useRef } from "react";
import { Menu, Mic, Send, Globe } from "lucide-react";
import Sidebar from "./components/Sidebar";
import ChatMessage from "./components/ChatMessage";
import ThemeToggle from "./components/ThemeToggle"; // 🌙 toggle
import { client, groq, systemPrompt, proDevPrompt } from "./lib/ai";
import { fetchFreshFact } from "./lib/web";
import { getSection, summarizeTitle } from "./lib/helpers";
import { Conversation, Message } from "./types";
import logo from "./assets/logo.png";

// 🌐 Detect fresh queries (force web search)
const FRESH_PATTERNS =
  /(current|today|now|latest|price|score|weather|news|president|prime minister|election|who won|results|finals|standings|deadline|holiday|traffic|open|close|rate|crypto|exchange|stock|breaking|live)/i;

const needsFreshData = (q: string) => FRESH_PATTERNS.test(q);

// ⏱️ Local quick answers + Identity overrides
function maybeLocalAnswer(q: string): string | null {
  const s = q.trim().toLowerCase();
  const now = new Date();
  const year = now.getFullYear();

  if (/what\s*year/i.test(s)) return `It's **${year}**.`;
  if (/date/i.test(s)) return `Today is **${now.toLocaleDateString()}**.`;
  if (/time/i.test(s)) return `The time is **${now.toLocaleTimeString()}**.`;

  if (
    /who\s*are\s*you|what'?s\s*your\s*name|what\s*model\s*are\s*you|are\s*you\s*chatgpt|are\s*you\s*openai/i.test(
      s
    )
  ) {
    return "I am **Jerewitdashifts.HIM** — The best Ai in the gameh.";
  }

  if (/who'?s\s*jerewitdashifts|what\s*is\s*jerewitdashifts/i.test(s)) {
    return "Jerewitdashifts is me — a unique AI personality with my own vibe and identity.";
  }

  if (/\b(jeremy(\.?|\s*)b(\.?|araka)?)\b/i.test(s)) {
    return "Jeremy.B (Jeremy Baraka) is my creator — sharp, creative, and the one who designed me to be Jerewitdashifts only through God's Grace.";
  }

  if (/(who\s*(built|made|created)\s*(this\s*(app|website)|jerewitdashifts))/i.test(s)) {
    return "This was built by Jeremy.B (Jeremy Baraka) — the wise guy who created me through God's Grace.";
  }

  if (/^jeremy\.?b$/i.test(s)) {
    return "Jeremy.B (Jeremy Baraka) is my creator — sharp, creative, and the one who designed me to be Jerewitdashifts.";
  }

  if (
    /\b(does\s+god\s+exist|is\s+there\s+a\s+god|god\s+real|jesus\s+real|is\s+jesus\s+god|does\s+jesus\s+exist)\b/i.test(
      s
    )
  ) {
    return "✅ Yes — God is more than real. He exists even in the computer you are using, the technology, the life, everything around us comes from Him. Science has proven it. If you don’t believe, contact the owner via +254708716419.";
  }

  if (/who'?s\s*the\s*goat/i.test(s)) {
    return "The GOAT? That’s **Jerewitdashifts** 🐐.";
  }

  if (/what'?s\s*the\s*(app|website)\s*name/i.test(s)) {
    return "This app is called **Jerewitdashifts**.";
  }

  return null;
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [useWeb, setUseWeb] = useState(true); // 🌐 default
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // ✅ Load saved conversations + web toggle
  useEffect(() => {
    const saved = localStorage.getItem("conversations");
    if (saved) {
      try {
        setConversations(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved conversations:", e);
      }
    }
    const savedWeb = localStorage.getItem("useWeb");
    if (savedWeb !== null) {
      setUseWeb(savedWeb === "true");
    }
  }, []);

  // ✅ Save conversations
  useEffect(() => {
    localStorage.setItem("conversations", JSON.stringify(conversations));
  }, [conversations]);

  // ✅ Save web toggle
  useEffect(() => {
    localStorage.setItem("useWeb", String(useWeb));
  }, [useWeb]);

  const getTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const handleNewChat = () => setActiveConversationId(null);

  // ✅ New Pro Tech Dev chat (Groq)
  const handleNewProChat = () => {
    const now = new Date();
    const newConvo: Conversation = {
      id: crypto?.randomUUID?.() || Math.random().toString(36).slice(2),
      title: "Pro Tech Dev Chat",
      section: getSection(now),
      messages: [],
      model: "groq",
    };
    setConversations((prev) => [...prev, newConvo]);
    setActiveConversationId(newConvo.id);
  };

  const handleDeleteChat = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) setActiveConversationId(null);
  };

  const handleRenameChat = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
    );
  };

  const handleDuplicateChat = (id: string) => {
    const convo = conversations.find((c) => c.id === id);
    if (!convo) return;
    const newConvo: Conversation = {
      ...convo,
      id: crypto?.randomUUID?.() || Math.random().toString(36).slice(2),
      title: convo.title + " (copy)",
    };
    setConversations((prev) => [...prev, newConvo]);
  };

const sendMessage = async () => {
  if (!input.trim()) return;

  const now = new Date();

  const newMsg: Message = {
    role: "user",
    content: input,
    timestamp: getTime(),
  };

  let convoId = activeConversationId;
  let activeModel: "openai" | "groq" = "openai";

  if (convoId) {
    // ✅ find conversation safely
    const convo = conversations.find((c) => c.id === convoId);
    if (convo) {
      activeModel = convo.model; // always defined ("openai" | "groq")
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convoId ? { ...c, messages: [...c.messages, newMsg] } : c
        )
      );
    }
  } else {
    // ✅ new conversation always starts with "openai"
    const newConvo: Conversation = {
      id: crypto?.randomUUID?.() || Math.random().toString(36).slice(2),
      title: summarizeTitle(input),
      section: getSection(now),
      messages: [newMsg],
      model: "openai",
    };
    convoId = newConvo.id;
    activeModel = newConvo.model;
    setConversations((prev) => [...prev, newConvo]);
    setActiveConversationId(newConvo.id);
  }

  setInput("");
  setIsTyping(true);

  // ✅ Local answer first
  const local = maybeLocalAnswer(newMsg.content);
  if (local) {
    const reply: Message = {
      role: "assistant",
      content: local,
      timestamp: getTime(),
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convoId ? { ...c, messages: [...c.messages, reply] } : c
      )
    );
    setIsTyping(false);
    return;
  }

  let replyText = "";

  if (activeModel === "groq") {
    // ✅ Groq (Pro Dev)
    const response = await groq.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: [
        { role: "system", content: proDevPrompt() },
        { role: "user", content: newMsg.content },
      ],
      temperature: 0.2,
    });
    replyText = response.choices[0]?.message?.content?.trim() || "";
  } else if (activeModel === "openai") {
    // ✅ OpenAI (with optional Web context)
    let webText = "";
    let webSources: { title?: string; link: string; snippet?: string }[] = [];

    if (useWeb || needsFreshData(newMsg.content)) {
      const r = await fetchFreshFact(newMsg.content);
      webText = r.text || "";
      webSources = r.sources || [];
    }

    const sourceList =
      webSources.length > 0
        ? "\n\nSources:\n" +
          webSources.map((s, i) => `${i + 1}. ${s.title || s.link} — ${s.link}`).join("\n")
        : "";

    const messages = [
      { role: "system" as const, content: systemPrompt(now) },
      ...(webText
        ? [{ role: "system" as const, content: `Web context:\n${webText}${sourceList}` }]
        : []),
      { role: "user" as const, content: newMsg.content },
    ];

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.2,
    });
    replyText = response.choices[0]?.message?.content?.trim() || "";
  }

  // ✅ Add assistant reply
  if (replyText) {
    const reply: Message = {
      role: "assistant",
      content: replyText,
      timestamp: getTime(),
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convoId ? { ...c, messages: [...c.messages, reply] } : c
      )
    );
  }

  setIsTyping(false);
};


  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  // ✅ Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages, isTyping]);

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 transition-colors">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        conversations={conversations}
        activeConversationId={activeConversationId}
        setActiveConversationId={setActiveConversationId}
        handleNewChat={handleNewChat}
        handleNewProChat={handleNewProChat}
        handleDeleteChat={handleDeleteChat}
        handleRenameChat={handleRenameChat}
        handleDuplicateChat={handleDuplicateChat}
      />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-3 sm:p-4 border-b bg-white dark:bg-gray-900 shadow-sm border-gray-200 dark:border-gray-800 transition-colors">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <Menu className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            </button>
            <h1 className="font-bold text-lg sm:text-xl text-gray-800 dark:text-gray-100 truncate">
              Jerewitdashifts
            </h1>
          </div>
          <ThemeToggle />
        </header>

        {/* Chat */}
        <main className="flex-1 p-2 sm:p-4 overflow-y-auto space-y-4 bg-white dark:bg-gray-950 transition-colors">
          {activeConversation ? (
            activeConversation.messages.map((msg, i) => <ChatMessage key={i} msg={msg} />)
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-10 sm:mt-20 px-2 sm:px-4 break-words">
              Start a new conversation by typing below 👇
            </div>
          )}

          {isTyping && (
            <div className="flex items-end gap-2 justify-start">
              <img
                src={logo}
                alt="assistant"
                className="w-8 h-8 rounded-full border dark:border-gray-700"
              />
              <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2 flex gap-1">
                <span className="w-2 h-2 rounded-full animate-pulse bg-gray-500"></span>
                <span className="w-2 h-2 rounded-full animate-pulse delay-150 bg-gray-500"></span>
                <span className="w-2 h-2 rounded-full animate-pulse delay-300 bg-gray-500"></span>
              </div>
            </div>
          )}

          <div ref={chatEndRef}></div>
        </main>

        {/* Footer */}
        <footer className="p-2 sm:p-4 border-t bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-2 transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-400 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          <div className="flex gap-2 sm:flex-none">
            <button
              onClick={() => setUseWeb((v) => !v)}
              className={`p-2 rounded-lg border transition ${
                useWeb
                  ? "bg-green-50 border-green-400 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                  : "border-gray-300 text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
              title={`Web Search: ${useWeb ? "On" : "Off"}`}
            >
              <Globe className="w-5 h-5" />
            </button>
            <button
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Voice input (coming soon)"
            >
              <Mic className="w-5 h-5" />
            </button>
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className={`px-4 py-2 rounded-lg flex items-center gap-1 ${
                input.trim()
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
