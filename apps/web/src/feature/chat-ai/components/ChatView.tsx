import React, { useRef, useEffect } from "react";
import { Bot, Copy, ThumbsUp, ThumbsDown, FileText, Paperclip, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSelector } from "react-redux";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import type { Message } from "../types/chat.type";

interface ChatViewProps {
  messages: Message[];
  isTyping?: boolean;
}

const ChatView: React.FC<ChatViewProps> = ({ messages, isTyping }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { userInfo } = useSelector(selectAuthStateInfo);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:px-12 space-y-6 min-h-0">
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
              {message.role === "assistant" ? (
                <div className="text-sm leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
                      h1: ({ children }) => <h1 className="text-lg font-semibold mt-3 mb-1">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-base font-semibold mt-3 mb-1">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-semibold mt-3 mb-1">{children}</h3>,
                      h4: ({ children }) => <h4 className="text-sm font-semibold mt-2 mb-1">{children}</h4>,
                      ul: ({ children }) => <ul className="my-1 ml-4 list-disc space-y-0.5">{children}</ul>,
                      ol: ({ children }) => <ol className="my-1 ml-4 list-decimal space-y-0.5">{children}</ol>,
                      li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                      code: ({ children, className }) => {
                        const isBlock = !!className;
                        return isBlock ? (
                          <code className="block bg-slate-200 dark:bg-slate-700 rounded-lg p-3 text-[13px] overflow-x-auto font-mono">{children}</code>
                        ) : (
                          <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-[13px] font-mono">{children}</code>
                        );
                      },
                      pre: ({ children }) => <pre className="my-2 overflow-x-auto rounded-lg">{children}</pre>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-blue-400 pl-3 italic opacity-75 my-2">{children}</blockquote>
                      ),
                      a: ({ children, href }) => (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
              )}

              {message.role === "user" && message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {message.attachments.map((att, i) => {
                    const isImage = att.fileType?.startsWith("image/");
                    return isImage ? (
                      <a key={att.id ?? i} href={att.fileUrl || undefined} target="_blank" rel="noopener noreferrer">
                        <img
                          src={att.fileUrl}
                          alt={att.fileName}
                          className="max-h-40 max-w-xs rounded-md border border-blue-400/30 object-cover shadow-sm"
                        />
                      </a>
                    ) : (
                      <a
                        key={att.id ?? i}
                        href={att.fileUrl || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 bg-blue-400/30 px-2 py-1 rounded-md text-[11px] hover:bg-blue-400/50 transition-colors"
                      >
                        <Paperclip size={12} />
                        {att.fileName}
                        {att.fileSize > 0 && <span className="opacity-70">({(att.fileSize / 1024).toFixed(1)} KB)</span>}
                      </a>
                    );
                  })}
                </div>
              )}

              {message.role === "assistant" && message.sources && message.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(message.sources[0] || {}).map(([bookName, pageInfo]) => (
                      <span
                        key={bookName}
                        className="flex items-center gap-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-1 rounded-md text-[10px] text-slate-500 dark:text-slate-300"
                      >
                        <FileText size={12} />
                        {bookName} — {pageInfo}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {message.role === "assistant" && message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {message.attachments.map((att, i) => {
                    const isImage = att.fileType?.startsWith("image/");
                    return isImage ? (
                      <a key={att.id ?? i} href={att.fileUrl || undefined} target="_blank" rel="noopener noreferrer">
                        <img
                          src={att.fileUrl}
                          alt={att.fileName}
                          className="max-h-40 max-w-xs rounded-md border border-slate-200 dark:border-slate-600 object-cover shadow-sm hover:opacity-90 transition-opacity"
                        />
                      </a>
                    ) : (
                      <a
                        key={att.id ?? i}
                        href={att.fileUrl || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-md text-[11px] hover:underline"
                      >
                        <Paperclip size={12} />
                        {att.fileName}
                      </a>
                    );
                  })}
                </div>
              )}

              {message.role === "assistant" && (message.totalToken || message.model) && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-4">
                    {message.model && <span>{message.model}</span>}
                    {message.totalToken && (
                      <span className="flex items-center gap-1">
                        <FileText size={12} /> {message.totalToken} tokens
                        {/* {message.promptToken ? ` (${message.promptToken}+${message.completionToken})` : ""} */}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="hover:text-blue-500 transition-colors">
                      <Copy size={14} />
                    </button>
                    <button className="hover:text-green-500 transition-colors">
                      <ThumbsUp size={14} />
                    </button>
                    <button className="hover:text-red-500 transition-colors">
                      <ThumbsDown size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-400 px-1">
              <span>{formatTime(message.createdAt)}</span>
            </div>
          </div>

          {message.role === "user" && (
            <div className="shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
              {userInfo?.avatar ? (
                <img
                  alt={userInfo.firstName || "User"}
                  className="w-full h-full object-cover"
                  src={userInfo.avatar}
                />
              ) : (
                <User size={18} className="text-slate-500 dark:text-slate-400" />
              )}
            </div>
          )}
        </div>
      ))}
      {isTyping && (
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg">
            <Bot size={20} />
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatView;
