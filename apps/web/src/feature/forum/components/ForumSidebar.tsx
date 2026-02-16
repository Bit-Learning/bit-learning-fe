import React from "react";
import { Hash, Star, TrendingUp, Users, MessageSquare, FileText } from "lucide-react";
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
    <div className="space-y-4">
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
        <div className="px-4 py-3 bg-linear-to-r from-blue-500 to-indigo-600 border-b">
          <h3 className="font-bold text-white flex items-center">
            <TrendingUp size={18} className="mr-2" />
            Thống kê diễn đàn
          </h3>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <FileText size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Tổng bài viết</p>
                <p className="text-lg font-bold text-gray-900">1,234</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <Users size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Thành viên</p>
                <p className="text-lg font-bold text-gray-900">567</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <MessageSquare size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Bình luận</p>
                <p className="text-lg font-bold text-gray-900">8,901</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
        <div className="px-4 py-3 bg-linear-to-r from-purple-500 to-pink-600 border-b">
          <h3 className="font-bold text-white flex items-center">
            <Hash size={18} className="mr-2" />
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

      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
        <div className="px-4 py-3 bg-linear-to-r from-green-500 to-emerald-600 border-b">
          <h3 className="font-bold text-white flex items-center">
            <Star size={18} className="mr-2" />
            Top đóng góp
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
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-green-200 transition-all"
                  onError={(e) => {
                    e.currentTarget.src = "/default-avatar.png";
                  }}
                />
                <span className="absolute -top-1 -right-1 bg-linear-to-br from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                  {index + 1}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate group-hover:text-green-600 transition-colors text-sm">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500">{user.posts} bài viết</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden border-0 shadow-md bg-linear-to-br from-orange-50 to-yellow-50">
        <div className="p-4">
          <h4 className="font-bold text-gray-900 mb-3 flex items-center">
            <span className="text-xl mr-2">📋</span>
            Quy tắc diễn đàn
          </h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">✓</span>
              <span>Tôn trọng ý kiến của người khác</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">✓</span>
              <span>Không spam hoặc quảng cáo</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">✓</span>
              <span>Sử dụng ngôn từ lịch sự</span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">✓</span>
              <span>Chia sẻ kiến thức hữu ích</span>
            </li>
          </ul>
        </div>
      </Card>

      <Card className="overflow-hidden border-0 shadow-md bg-linear-to-br from-blue-50 to-cyan-50">
        <div className="p-4">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center">
            <span className="text-xl mr-2">💡</span>
            Mẹo hữu ích
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start p-2 rounded-lg hover:bg-white/50 transition-colors">
              <span className="text-blue-500 mr-2 shrink-0">✓</span>
              <span>Sử dụng hashtag để bài viết dễ tìm kiếm hơn</span>
            </li>
            <li className="flex items-start p-2 rounded-lg hover:bg-white/50 transition-colors">
              <span className="text-blue-500 mr-2 shrink-0">✓</span>
              <span>Đính kèm code/ảnh minh họa khi cần</span>
            </li>
            <li className="flex items-start p-2 rounded-lg hover:bg-white/50 transition-colors">
              <span className="text-blue-500 mr-2 shrink-0">✓</span>
              <span>Tương tác tích cực với cộng đồng</span>
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default ForumSidebar;
