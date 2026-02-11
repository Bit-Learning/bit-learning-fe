import React from "react";
import { TrendingUp, Hash, Star } from "lucide-react";
import { Badge } from "@workspace/ui/components/Badge";
import { Card } from "@workspace/ui/components/Card";
import { useForumHashtags } from "../queries/useForum";
import { useDispatch, useSelector } from "react-redux";
import { toggleTagAction, selectForumSelectedTags } from "../stores/forum.store";

const ForumSidebar: React.FC = () => {
  const dispatch = useDispatch();
  const { data: hashtagsData } = useForumHashtags();
  const selectedTags = useSelector(selectForumSelectedTags);

  const hashtags = hashtagsData?.data || [];

  const handleTagClick = (tagName: string) => {
    dispatch(toggleTagAction(tagName));
  };

  const isTagSelected = (tagName: string) => {
    return selectedTags.includes(tagName);
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="px-4 py-3 bg-linear-to-r from-blue-50 to-indigo-50 border-b">
          <h3 className="font-bold text-gray-900 flex items-center">
            <TrendingUp size={18} className="mr-2 text-blue-600" />
            Xu hướng
          </h3>
        </div>
        <div className="p-4 space-y-3">
          {[
            { tag: "ReactJS", posts: 234 },
            { tag: "TypeScript", posts: 189 },
            { tag: "NodeJS", posts: 156 },
            { tag: "NextJS", posts: 142 },
            { tag: "TailwindCSS", posts: 98 },
          ].map((item) => (
            <div
              key={item.tag}
              className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg cursor-pointer transition-colors"
              onClick={() => handleTagClick(item.tag)}
            >
              <div className="flex items-center space-x-2">
                <Hash size={16} className="text-blue-500" />
                <span className="font-medium text-gray-700">{item.tag}</span>
              </div>
              <span className="text-xs text-gray-500">{item.posts} bài viết</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="px-4 py-3 bg-linear-to-r from-purple-50 to-pink-50 border-b">
          <h3 className="font-bold text-gray-900 flex items-center">
            <Hash size={18} className="mr-2 text-purple-600" />
            Thẻ phổ biến
          </h3>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-2">
            {hashtags.slice(0, 15).map((tag) => (
              <Badge
                key={tag.id}
                variant={isTagSelected(tag.name) ? "default" : "secondary"}
                className="cursor-pointer hover:scale-105 transition-transform"
                onClick={() => handleTagClick(tag.name)}
              >
                #{tag.name}
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="px-4 py-3 bg-linear-to-r from-green-50 to-emerald-50 border-b">
          <h3 className="font-bold text-gray-900 flex items-center">
            <Star size={18} className="mr-2 text-green-600" />
            Người đóng góp nhiều
          </h3>
        </div>
        <div className="p-4 space-y-3">
          {[
            { name: "Nguyễn Văn A", avatar: "/avatar1.jpg", posts: 45 },
            { name: "Trần Thị B", avatar: "/avatar2.jpg", posts: 38 },
            { name: "Lê Văn C", avatar: "/avatar3.jpg", posts: 32 },
            { name: "Phạm Thị D", avatar: "/avatar4.jpg", posts: 28 },
            { name: "Hoàng Văn E", avatar: "/avatar5.jpg", posts: 24 },
          ].map((user, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-lg cursor-pointer transition-colors group"
            >
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-blue-200 transition-all"
                  onError={(e) => {
                    e.currentTarget.src = "/default-avatar.png";
                  }}
                />
                <span className="absolute -top-1 -right-1 bg-linear-to-br from-green-400 to-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                  {index + 1}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500">{user.posts} bài viết</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="bg-linear-to-br from-blue-50 to-indigo-50 border-blue-100">
        <div className="p-4">
          <h4 className="font-bold text-gray-900 mb-3 flex items-center">📋 Quy tắc diễn đàn</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">✓</span>
              <span>Tôn trọng ý kiến của người khác</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">✓</span>
              <span>Không spam hoặc quảng cáo</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">✓</span>
              <span>Sử dụng ngôn từ lịch sự</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">✓</span>
              <span>Chia sẻ kiến thức hữu ích</span>
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default ForumSidebar;
