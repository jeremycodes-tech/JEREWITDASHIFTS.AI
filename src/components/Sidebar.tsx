import { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  ChevronDown,
  ChevronRight,
  X,
  Plus,
  MoreVertical,
  Pencil,
  Copy,
  Trash2,
  Book,
  Sparkles,
  PlayCircle,
  LayoutDashboard,
  Settings,
  User,
} from "lucide-react";
import logo from "../assets/logo.png";
import { Conversation, Section } from "../types";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: React.Dispatch<React.SetStateAction<string | null>>;
  handleNewChat: () => void;
  handleNewProChat: () => void; // 🔹 added
  handleDeleteChat: (id: string) => void;
  handleRenameChat: (id: string, newTitle: string) => void;
  handleDuplicateChat: (id: string) => void;
}

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  conversations,
  activeConversationId,
  setActiveConversationId,
  handleNewChat,
  handleNewProChat, // 🔹 added
  handleDeleteChat,
  handleRenameChat,
  handleDuplicateChat,
}: SidebarProps) {
  const [search, setSearch] = useState("");
  const [openSections, setOpenSections] = useState<Record<Section, boolean>>({
    today: true,
    yesterday: false,
    lastWeek: false,
  });

  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(
    null
  );

  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        menuOpen &&
        !buttonRefs.current[menuOpen]?.contains(e.target as Node)
      ) {
        setMenuOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const grouped: Record<Section, Conversation[]> = {
    today: conversations.filter((c) => c.section === "today"),
    yesterday: conversations.filter((c) => c.section === "yesterday"),
    lastWeek: conversations.filter((c) => c.section === "lastWeek"),
  };

  const toggleSection = (section: Section) =>
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));

  return (
    <aside
      className={`fixed inset-y-0 left-0 w-64 
        bg-white dark:bg-gray-900 
        border-r border-gray-200 dark:border-gray-700 
        shadow-md transform transition-transform duration-300 z-40 
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:static flex flex-col`}
    >
      {/* Top bar with search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
        <img src={logo} className="w-8 h-8 shrink-0" />
        <input
          id="chat-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search chats..."
          className="flex-1 px-2 py-1 rounded border 
                     border-gray-300 dark:border-gray-600 
                     bg-gray-50 dark:bg-gray-800 
                     text-sm text-gray-800 dark:text-gray-200 
                     placeholder-gray-400 dark:placeholder-gray-500
                     min-w-0"
        />
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* New Chat button */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-2">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 
                     bg-blue-500 hover:bg-blue-600 
                     text-white rounded-lg transition text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 shrink-0" /> New Chat
        </button>

        {/* 🔹 PRO TECH DEV button now creates Claude-powered chat */}
        <button
          onClick={handleNewProChat}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 
                     bg-purple-500 hover:bg-purple-600 
                     text-white rounded-lg transition text-sm sm:text-base"
        >
          <Book className="w-4 h-4 shrink-0" /> PRO TECH DEV
        </button>
      </div>

      {/* Quick Links */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 space-y-1">
        <button className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
          <Sparkles className="w-4 h-4" /> GPTs
        </button>
        <button className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
          <PlayCircle className="w-4 h-4" /> Sora
        </button>
        <button className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
          <LayoutDashboard className="w-4 h-4" /> Projects
        </button>
      </div>

      {/* Conversations list */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {Object.entries(grouped).map(([section, convos]) => {
          const sec = section as Section;
          return (
            <div key={section}>
              <button
                onClick={() => toggleSection(sec)}
                className="w-full flex justify-between items-center 
                           px-2 py-2 font-semibold rounded-lg 
                           text-gray-700 dark:text-gray-200 
                           hover:bg-gray-100 dark:hover:bg-gray-800 text-sm sm:text-base"
              >
                <span className="capitalize">{section}</span>
                {openSections[sec] ? (
                  <ChevronDown className="w-4 h-4 shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 shrink-0" />
                )}
              </button>

              {openSections[sec] && (
                <div className="pl-4 mt-1 space-y-1">
                  {convos
                    .filter((c) =>
                      c.title.toLowerCase().includes(search.toLowerCase())
                    )
                    .map((c) => (
                      <div
                        key={c.id}
                        className={`flex items-center justify-between px-2 py-1 rounded text-sm truncate transition relative ${
                          activeConversationId === c.id
                            ? "bg-blue-100 dark:bg-blue-900 font-semibold text-blue-700 dark:text-blue-300"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                      >
                        <button
                          onClick={() => setActiveConversationId(c.id)}
                          className="flex-1 text-left truncate"
                        >
                          {c.title}
                        </button>

                        <button
                          ref={(el) => (buttonRefs.current[c.id] = el)}
                          onClick={(e) => {
                            const rect = (
                              e.currentTarget as HTMLElement
                            ).getBoundingClientRect();
                            setMenuPos({ top: rect.bottom, left: rect.right });
                            setMenuOpen(menuOpen === c.id ? null : c.id);
                          }}
                          className="ml-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {menuOpen === c.id &&
                          menuPos &&
                          ReactDOM.createPortal(
                            <div
                              style={{
                                position: "absolute",
                                top: menuPos.top,
                                left: menuPos.left - 128,
                                width: "8rem",
                                zIndex: 9999,
                              }}
                              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg"
                            >
                              <button
                                onClick={() => {
                                  const newTitle = prompt(
                                    "Rename chat:",
                                    c.title
                                  );
                                  if (newTitle) {
                                    handleRenameChat(c.id, newTitle);
                                  }
                                  setMenuOpen(null);
                                }}
                                className="flex items-center gap-2 px-3 py-2 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <Pencil className="w-4 h-4" /> Rename
                              </button>
                              <button
                                onClick={() => {
                                  handleDuplicateChat(c.id);
                                  setMenuOpen(null);
                                }}
                                className="flex items-center gap-2 px-3 py-2 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <Copy className="w-4 h-4" /> Duplicate
                              </button>
                              <button
                                onClick={() => {
                                  handleDeleteChat(c.id);
                                  setMenuOpen(null);
                                }}
                                className="flex items-center gap-2 px-3 py-2 w-full text-left text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900"
                              >
                                <Trash2 className="w-4 h-4" /> Delete
                              </button>
                            </div>,
                            document.body
                          )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Settings / Account */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
        <button className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
          <Settings className="w-4 h-4" /> Settings
        </button>
        <button className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
          <User className="w-4 h-4" /> Account
        </button>
      </div>
    </aside>
  );
}
