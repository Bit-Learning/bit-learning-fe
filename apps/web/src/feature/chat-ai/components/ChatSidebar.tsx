import React from "react";
import { Plus, MessageSquare, Settings, HelpCircle, PanelLeft, Search } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import type { Conversation } from "../types/chat.type";

interface ChatSidebarProps {
  conversations: Conversation[];
  currentConversationId?: string;
  onNewChat: () => void;
  onSelectConversation: (conversation: Conversation) => void;
  onToggleCollapse: () => void;
  onOpenSearch: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  currentConversationId,
  onNewChat,
  onSelectConversation,
  onToggleCollapse,
  onOpenSearch,
}) => {
  const today = new Date().toDateString();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toDateString();

  const todayConversations = conversations.filter((c) => new Date(c.createdAt).toDateString() === today);
  const lastWeekConversations = conversations.filter((c) => {
    const date = new Date(c.createdAt).toDateString();
    return date !== today && new Date(c.createdAt) > new Date(weekAgo);
  });

  return (
    <aside className="w-72 flex flex-col border-r border-slate-200 bg-white text-slate-900 dark:border-slate-700/50 dark:bg-slate-800 dark:text-slate-200">
      <div className="p-4 flex flex-col gap-3">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="cursor-pointer inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <PanelLeft size={18} className="rotate-180" />
        </button>
        <Button
          onClick={onNewChat}
          className="cursor-pointer w-full flex items-center justify-start gap-2 py-5 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-md font-medium text-white shadow-sm"
        >
          <Plus size={18} />
          <span>Cuộc trò chuyện mới</span>
        </Button>
      </div>

      <div className="px-4 pb-2">
        <button
          type="button"
          onClick={onOpenSearch}
          className="cursor-pointer flex w-full items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-md font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <Search size={16} className="text-slate-400" />
          <span>Tìm kiếm cuộc trò chuyện</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {todayConversations.length > 0 && (
          <>
            <div className="px-4 py-3 text-sm font-bold text-slate-700 uppercase tracking-wider">Hôm nay</div>
            <div className="space-y-1">
              {todayConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv)}
                  className={`group flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    currentConversationId === conv.id
                      ? "bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/50 dark:hover:text-white"
                  }`}
                >
                  <MessageSquare size={20} className="text-slate-400" />
                  <span className="truncate text-md font-medium">{conv.title}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {lastWeekConversations.length > 0 && (
          <>
            <div className="px-4 py-3 mt-4 text-sm font-bold text-slate-700 uppercase tracking-wider">Tuần trước</div>
            <div className="space-y-1">
              {lastWeekConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv)}
                  className={`group flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    currentConversationId === conv.id
                      ? "bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/50 dark:hover:text-white"
                  }`}
                >
                  <MessageSquare size={20} className="text-slate-400" />
                  <span className="truncate text-md font-medium">{conv.title}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-4 space-y-1 border-t border-slate-700/30">
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors dark:text-slate-300 dark:hover:bg-slate-700/50 dark:hover:text-white">
          <Settings size={20} />
          <span className="text-md font-medium">Cài đặt</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors dark:text-slate-300 dark:hover:bg-slate-700/50 dark:hover:text-white">
          <HelpCircle size={20} />
          <span className="text-md font-medium">Trợ giúp & Phản hồi</span>
        </div>
      </div>
    </aside>
  );
};

export default ChatSidebar;
