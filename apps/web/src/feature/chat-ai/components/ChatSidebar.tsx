import React from "react";
import { Plus, MessageSquare, PanelLeft, Search, Trash2, Bot, MessagesSquare } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useDeleteConversation } from "../queries/useChat";
import type { Conversation } from "../types/chat.type";

interface ChatSidebarProps {
  conversations: Conversation[];
  currentConversationId?: string;
  onNewChat: () => void;
  onSelectConversation: (conversation: Conversation) => void;
  onToggleCollapse: () => void;
  onOpenSearch: () => void;
}

function getRelativeTime(isoString: string): string {
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);

  if (diffMin < 1) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffHour < 48) return "Hôm qua";
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

function groupConversations(conversations: Conversation[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);

  const groups: { label: string; items: Conversation[] }[] = [
    { label: "Hôm nay", items: [] },
    { label: "Hôm qua", items: [] },
    { label: "7 ngày qua", items: [] },
    { label: "Cũ hơn", items: [] },
  ];

  for (const conv of conversations) {
    const d = new Date(conv.updatedAt || conv.createdAt);
    if (d >= today) groups[0].items.push(conv);
    else if (d >= yesterday) groups[1].items.push(conv);
    else if (d >= weekAgo) groups[2].items.push(conv);
    else groups[3].items.push(conv);
  }

  return groups.filter((g) => g.items.length > 0);
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  currentConversationId,
  onNewChat,
  onSelectConversation,
  onToggleCollapse,
  onOpenSearch,
}) => {
  const navigate = useNavigate();
  const deleteConversation = useDeleteConversation();
  const groups = groupConversations(conversations);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteConversation.mutateAsync(id);
    if (currentConversationId === id) {
      navigate({ to: "/chat-ai/" });
    }
  };

  return (
    <aside className="w-72 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center shadow-sm">
            <Bot size={17} className="text-white" />
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-100 text-[15px]">Bit AI</span>
        </div>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="Thu gọn sidebar"
        >
          <PanelLeft size={17} />
        </button>
      </div>

      {/* New Chat + Search */}
      <div className="px-3 pb-3 flex flex-col gap-2">
        <button
          type="button"
          onClick={onNewChat}
          className="cursor-pointer w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-medium shadow-sm transition-colors"
        >
          <Plus size={16} />
          Cuộc trò chuyện mới
        </button>

        <button
          type="button"
          onClick={onOpenSearch}
          className="cursor-pointer flex w-full items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <Search size={14} />
          <span>Tìm kiếm...</span>
          <kbd className="ml-auto text-[10px] bg-slate-200 dark:bg-slate-600 text-slate-400 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono">
            /
          </kbd>
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <MessagesSquare size={22} className="text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Chưa có cuộc trò chuyện</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Bắt đầu chat để lưu lịch sử</p>
            </div>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.label} className="mb-1">
              <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((conv) => {
                  const isActive = currentConversationId === conv.id;
                  return (
                    <div key={conv.id} className="group relative">
                      <button
                        type="button"
                        onClick={() => onSelectConversation(conv)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 pr-8 rounded-xl transition-all text-left ${
                          isActive
                            ? "bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20"
                            : "hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-transparent"
                        }`}
                      >
                        {/* Active indicator */}
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-500 rounded-r-full" />
                        )}

                        <MessageSquare
                          size={15}
                          className={`shrink-0 ${isActive ? "text-blue-500" : "text-slate-400 dark:text-slate-500"}`}
                        />

                        <div className="flex-1 min-w-0">
                          <p
                            className={`truncate text-sm ${
                              isActive
                                ? "font-semibold text-blue-700 dark:text-blue-300"
                                : "font-medium text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {conv.title}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                            {getRelativeTime(conv.updatedAt || conv.createdAt)}
                          </p>
                        </div>
                      </button>

                      {/* Delete button — hiện khi hover hoặc focus-within */}
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, conv.id)}
                        disabled={deleteConversation.isPending}
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 focus:opacity-100 transition-all disabled:cursor-not-allowed"
                        title="Xoá cuộc trò chuyện"
                        tabIndex={0}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default ChatSidebar;
