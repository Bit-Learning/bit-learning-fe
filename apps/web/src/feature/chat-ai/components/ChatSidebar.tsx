import React from "react";
import { Plus, MessageSquare, Settings, HelpCircle } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import type { Conversation } from "../types/chat.type";

interface ChatSidebarProps {
  conversations: Conversation[];
  onNewChat: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ conversations, onNewChat }) => {
  const today = new Date().toDateString();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toDateString();

  const todayConversations = conversations.filter((c) => new Date(c.createdAt).toDateString() === today);
  const lastWeekConversations = conversations.filter((c) => {
    const date = new Date(c.createdAt).toDateString();
    return date !== today && new Date(c.createdAt) > new Date(weekAgo);
  });

  return (
    <aside className="w-72 bg-slate-800 text-slate-300 flex flex-col border-r border-slate-700/50">
      <div className="p-4">
        <Button
          onClick={onNewChat}
          className="cursor-pointer w-full flex items-center justify-center gap-2 py-5 px-4 rounded-lg bg-blue-800 border-2 border-blue-500 hover:border-white transition-all text-sm font-semibold text-white shadow-sm"
        >
          <Plus size={20} />
          Cuộc trò chuyện mới
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {todayConversations.length > 0 && (
          <>
            <div className="px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hôm nay</div>
            <div className="space-y-1">
              {todayConversations.map((conv) => (
                <div
                  key={conv.id}
                  className="group flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors text-slate-300 hover:text-white"
                >
                  <MessageSquare size={18} className="text-slate-400" />
                  <span className="truncate text-sm font-medium">{conv.title}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {lastWeekConversations.length > 0 && (
          <>
            <div className="px-4 py-3 mt-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Tuần trước
            </div>
            <div className="space-y-1">
              {lastWeekConversations.map((conv) => (
                <div
                  key={conv.id}
                  className="group flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors text-slate-300 hover:text-white"
                >
                  <MessageSquare size={18} className="text-slate-400" />
                  <span className="truncate text-sm font-medium">{conv.title}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-4 space-y-1 border-t border-slate-700/30">
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-700/50 cursor-pointer text-slate-300 hover:text-white transition-colors">
          <Settings size={20} />
          <span className="text-sm font-medium">Cài đặt</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-700/50 cursor-pointer text-slate-300 hover:text-white transition-colors">
          <HelpCircle size={20} />
          <span className="text-sm font-medium">Trợ giúp & Phản hồi</span>
        </div>
      </div>
    </aside>
  );
};

export default ChatSidebar;
