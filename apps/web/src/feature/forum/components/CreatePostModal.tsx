// src/features/forum/components/CreatePostModal.tsx

import React, { useState } from "react";
import { X, Image, FileText, Hash } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Badge } from "@workspace/ui/components/Badge";
import { Input } from "@workspace/ui/components/Input";
import { Label } from "@workspace/ui/components/label";
import { Card } from "@workspace/ui/components/Card";
import { useCreateForumPost } from "../queries/useForum";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const createForumPost = useCreateForumPost();

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments([...attachments, ...files]);

    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrls((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
    setPreviewUrls(previewUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;

    await createForumPost.mutateAsync({
      data: { title, content, tags },
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    setTitle("");
    setContent("");
    setTags([]);
    setAttachments([]);
    setPreviewUrls([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-900">Tạo bài viết mới</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X size={20} />
          </Button>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">
              Tiêu đề <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề bài viết..."
              maxLength={150}
              className="text-base"
            />
            <p className="text-xs text-gray-500 text-right">{title.length}/150 ký tự</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">
              Nội dung <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Bạn đang nghĩ gì?"
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">
              <Hash className="inline-block mr-1" size={16} />
              Thẻ tag
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                placeholder="Nhập tag và nhấn Enter"
                className="flex-1"
              />
              <Button onClick={handleAddTag} size="sm">
                Thêm
              </Button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-blue-100 transition-colors">
                    #{tag}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTag(tag)}
                      className="h-4 w-4 p-0 ml-2 hover:bg-transparent"
                    >
                      <X size={12} />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {previewUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveAttachment(index)}
                    className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 pt-3 border-t">
            <Label
              htmlFor="image-upload"
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors border border-gray-200"
            >
              <Image size={18} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Thêm ảnh</span>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </Label>

            <Label
              htmlFor="file-upload"
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors border border-gray-200"
            >
              <FileText size={18} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Thêm file</span>
              <input id="file-upload" type="file" multiple onChange={handleFileSelect} className="hidden" />
            </Label>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t rounded-b-lg">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} isDisabled={!title.trim() || !content.trim() || createForumPost.isPending}>
            {createForumPost.isPending ? "Đang đăng..." : "Đăng bài"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CreatePostModal;
