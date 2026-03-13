import { AlertCircle, CheckCircle, Edit, Eye, Lock, Trash2 } from "lucide-react";
import { Post } from "../types/forum.type";

interface PostRowProps {
  post: Post;
  formatDate: (d: string) => string;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

export const PostRow: React.FC<PostRowProps> = ({ post, formatDate, onEdit, onDelete, onView }) => {
  const imageAttachment = post.attachments.find((a) => a.type === "IMAGE");

  return (
    <div
      className={`bg-white rounded-xl border transition-all group overflow-hidden ${
        post.isBanned
          ? "border-red-100 bg-red-50/30"
          : "border-gray-200 hover:border-blue-200 hover:shadow-md hover:shadow-blue-50"
      }`}
    >
      <div className="flex">
        <div className="w-40 shrink-0 hidden sm:block">
          {imageAttachment ? (
            <img src={imageAttachment.url} alt={post.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full min-h-27.5 bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
              <span className="text-3xl opacity-40">📄</span>
            </div>
          )}
        </div>

        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                {post.isBanned ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                    <Lock className="w-2.5 h-2.5" /> Bị khóa
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-2.5 h-2.5" /> Đã đăng
                  </span>
                )}
                {post.hashtags.slice(0, 2).map((tag) => (
                  <span
                    key={tag.id}
                    className="text-[11px] text-blue-500 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full font-medium"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>

              {!post.isBanned && (
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    onClick={onView}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    onClick={onEdit}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    onClick={onDelete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <h3
              className={`font-bold text-base leading-snug mb-1 line-clamp-1 transition-colors ${
                post.isBanned ? "text-gray-400 line-through" : "text-gray-800 group-hover:text-blue-700 cursor-pointer"
              }`}
              onClick={!post.isBanned ? onView : undefined}
            >
              {post.title}
            </h3>
            <p className={`text-sm line-clamp-1 ${post.isBanned ? "text-gray-400" : "text-gray-500"}`}>
              {post.content}
            </p>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {post.likes + post.dislikes} lượt xem
              </span>
              {!post.isBanned && <span>👍 {post.likes}</span>}
            </div>
            <span className="text-xs text-gray-400">
              {post.isBanned ? `Bị khóa ${formatDate(post.updatedAt)}` : `Đăng ${formatDate(post.createdAt)}`}
            </span>
          </div>

          {post.isBanned && (
            <div className="flex items-center gap-1.5 mt-2 text-red-400 text-xs font-semibold">
              <AlertCircle className="w-3.5 h-3.5" />
              Vi phạm tiêu chuẩn cộng đồng
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
