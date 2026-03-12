import React from "react";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { MessageCircle, ThumbsUp } from "lucide-react";
import { ForumPostCardProps } from "../types";

const ForumPostCard: React.FC<ForumPostCardProps> = ({ avatar, author, time, tags, title, comments, likes }) => {
  return (
    <Card className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-[#137fec]/30 transition-all flex flex-col h-full">
      <CardContent className="p-0 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
            <img className="w-full h-full object-cover" alt={author} src={avatar} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">
              {author} <span className="font-normal text-slate-400">vừa hỏi</span>
            </p>
            <p className="text-[10px] text-slate-400">
              {time} • {tags}
            </p>
          </div>
        </div>
        <h4 className="text-lg font-bold text-slate-900 mb-4 hover:text-[#137fec] cursor-pointer line-clamp-2">
          {title}
        </h4>
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-slate-400 text-sm">
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" /> {comments}
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-4 h-4" /> {likes}
            </span>
          </div>
          <span className="text-[#137fec] font-bold">Xem thêm</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForumPostCard;
