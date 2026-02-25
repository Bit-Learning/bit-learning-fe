import React, { useEffect, useState } from "react";
import { ArrowLeft, X, Paperclip, CheckCircle2, ChevronDown } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Badge } from "@workspace/ui/components/Badge";
import { Label } from "@workspace/ui/components/label";
import { Input } from "@workspace/ui/components/Input";
import { Textarea } from "@workspace/ui/components/Textarea";
import { useCreateForumPost, useForumHashtags, useForumPostById, useUpdateForumPost } from "../queries/useForum";
import { useSelector } from "react-redux";
import { selectForumHashtags, selectForumSelectedPost } from "../stores/forum.store";
import type { CreatePostRequest, UpdatePostRequest } from "../types/forum.type";
import { useNavigate, useParams } from "@tanstack/react-router";

const PostFormContent: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const postId = params.id ? Number(params.id) : null;
  const isEditMode = !!postId;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);

  const hashtags = useSelector(selectForumHashtags);
  const selectedPost = useSelector(selectForumSelectedPost);

  useForumHashtags();

  if (isEditMode && postId) {
    useForumPostById(postId);
  }

  const createPostMutation = useCreateForumPost();
  const updatePostMutation = useUpdateForumPost();

  useEffect(() => {
    if (isEditMode && selectedPost) {
      setTitle(selectedPost.title);
      setContent(selectedPost.content);
      setSelectedTags(selectedPost.hashtags.map((h) => h.name));
    }
  }, [isEditMode, selectedPost]);

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  const addTag = () => {
    if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
      setSelectedTags([...selectedTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleSubmit = () => {
    if (isEditMode && postId) {
      const postData: UpdatePostRequest = {
        title,
        content,
        tags: selectedTags,
      };
      updatePostMutation.mutate(
        { id: postId, data: postData, attachments },
        {
          onSuccess: () => navigate({ to: "/forum/my" }),
        },
      );
    } else {
      const postData: CreatePostRequest = {
        title,
        content,
        tags: selectedTags,
      };
      createPostMutation.mutate(
        { data: postData, attachments },
        {
          onSuccess: () => navigate({ to: "/forum" }),
        },
      );
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center bg-white">
      <div className="w-full max-w-4xl px-6 py-12">
        <div className="flex flex-col gap-2 mb-10">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Button
              variant="ghost"
              className="hover:text-blue-600 transition-colors flex items-center gap-1 p-0 h-auto"
              onClick={() => navigate({ to: "/forum" })}
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại Diễn đàn
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mt-4 text-gray-900">
            {isEditMode ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
          </h1>
          <p className="text-gray-500 text-lg">
            Phác thảo ý tưởng của bạn và chia sẻ với cộng đồng học thuật bit learning.
          </p>
        </div>

        <div className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="post-title" className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Tiêu đề bài viết
            </Label>
            <Input
              id="post-title"
              className="w-full h-14 bg-white border-gray-200 rounded-lg px-0 text-2xl font-semibold focus:ring-0 border-x-0 border-t-0 border-b-2 focus:border-blue-600"
              placeholder="Nhập tiêu đề mô tả rõ ràng..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Nội dung</Label>
            <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
              <Textarea
                className="w-full min-h-100 bg-transparent border-none focus:ring-0 p-6 text-lg leading-relaxed text-gray-700 resize-none placeholder:text-gray-200"
                placeholder="Bắt đầu viết bài thảo luận của bạn tại đây..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Thẻ liên quan</Label>
              <div className="flex flex-wrap gap-2 min-h-12 p-3 bg-white border border-gray-200 rounded-lg items-center focus-within:border-blue-600">
                {selectedTags.map((tag, index) => (
                  <Badge
                    key={index}
                    className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium border border-gray-200"
                  >
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                <Input
                  className="bg-transparent border-none focus:ring-0 text-sm flex-1 min-w-30 p-0 h-auto"
                  placeholder="Thêm thẻ..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-widest text-gray-400">Tài liệu tham khảo</Label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-3 h-12 flex items-center justify-center bg-gray-50 hover:bg-white hover:border-blue-600 hover:text-blue-600 cursor-pointer transition-all group">
                <div className="flex items-center gap-2 text-gray-400 text-sm group-hover:text-blue-600">
                  <Paperclip className="w-5 h-5" />
                  <span className="font-medium">Đính kèm tệp hoặc hình ảnh</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-100">
            <div className="flex items-center gap-2 text-gray-400 text-sm italic">
              <CheckCircle2 className="w-4 h-4" />
              Đã tự động lưu lúc 12:45 CH
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Button
                variant="ghost"
                className="flex-1 sm:flex-none px-8 py-3 font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                onClick={() => navigate({ to: "/forum" })}
              >
                Hủy
              </Button>
              <Button
                className="flex-1 sm:flex-none px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/10 gap-2"
                onClick={handleSubmit}
                isDisabled={!title.trim() || !content.trim()}
              >
                {isEditMode ? "Cập nhật" : "Đăng bài"}
                <ChevronDown className="w-5 h-5 -rotate-90" />
              </Button>
            </div>
          </div>
        </div>

        <Card className="mt-12 bg-gray-50 border-gray-100">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="text-blue-600 mt-0.5">
              <span className="text-2xl">✨</span>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 text-sm">Mẹo chất lượng học thuật</h4>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                Trích dẫn nguồn và sử dụng thẻ mô tả giúp bạn bè dễ dàng tìm kiếm và tương tác với nghiên cứu của bạn
                hiệu quả hơn tại bit learning.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default PostFormContent;
