import React, { useRef, useEffect } from "react";
import { Bot, Copy, ThumbsUp, ThumbsDown, Clock, FileText } from "lucide-react";
import type { Message } from "../types/chat.type";

interface ChatViewProps {
  messages: Message[];
}

const ChatView: React.FC<ChatViewProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:px-12 lg:px-24 space-y-6">
      {messages.map((message) => (
        <div key={message.id} className={`flex items-start gap-4 ${message.role === "user" ? "justify-end" : ""}`}>
          {message.role === "assistant" && (
            <div className="shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg">
              <Bot size={20} />
            </div>
          )}

          <div className={`flex flex-col space-y-2 max-w-[85%] ${message.role === "user" ? "items-end" : ""}`}>
            <div
              className={`p-4 rounded-2xl shadow-sm ${
                message.role === "user"
                  ? "bg-blue-500 text-white rounded-tr-none"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none"
              }`}
            >
              <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>

              {message.role === "assistant" && message.sources && message.sources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {Object.entries(message.sources[0] || {}).map(([key, value]) => (
                      <span
                        key={key}
                        className="flex items-center gap-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-1 rounded-md text-[10px] text-slate-500 dark:text-slate-300"
                      >
                        <FileText size={14} />
                        {value}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <div className="flex items-center gap-4">
                      {message.totalToken && (
                        <span className="flex items-center gap-1">
                          <FileText size={14} /> Tokens: {message.totalToken}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock size={14} /> {formatTime(message.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="hover:text-blue-500 transition-colors">
                        <Copy size={16} />
                      </button>
                      <button className="hover:text-green-500 transition-colors">
                        <ThumbsUp size={16} />
                      </button>
                      <button className="hover:text-red-500 transition-colors">
                        <ThumbsDown size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-400 px-1">
              <span>{formatTime(message.createdAt)}</span>
            </div>
          </div>

          {message.role === "user" && (
            <div className="shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <img
                alt="User"
                className="w-full h-full object-cover"
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=User"
              />
            </div>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatView;
