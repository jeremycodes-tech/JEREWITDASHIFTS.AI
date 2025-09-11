import ReactMarkdown from "react-markdown";
import logo from "../assets/logo.png";
import { Message } from "../types";

export default function ChatMessage({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";

  return (
    <div
      className={`flex flex-col gap-1 ${
        isUser ? "items-end" : "items-start"
      }`}
    >
      <div className="flex items-end gap-2 max-w-full">
        {/* Avatar */}
        {!isUser && (
          <img
            src={logo}
            alt="assistant"
            className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 shrink-0"
          />
        )}
        {isUser && (
          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shrink-0">
            U
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`px-3 sm:px-4 py-2 rounded-2xl max-w-[85%] sm:max-w-[70%] break-words overflow-hidden
            ${
              isUser
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
            }`}
        >
          {/* ✅ Instead of className on ReactMarkdown, wrap it in a div */}
          <div className="prose prose-sm sm:prose-base dark:prose-invert break-words">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Timestamp */}
      <span
        className={`text-xs mt-0.5 ${
          isUser
            ? "text-gray-400 dark:text-gray-500 pr-10"
            : "text-gray-500 dark:text-gray-400 pl-10"
        }`}
      >
        {msg.timestamp}
      </span>
    </div>
  );
}
