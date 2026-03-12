import React, { useEffect, useRef } from "react";
import { ArrowLeft, X, Paperclip, ChevronRight, ImageIcon, FileText, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateForumPost, useForumHashtags, useForumPostById, useUpdateForumPost } from "../queries/useForum";
import { useSelector } from "react-redux";
import { selectForumSelectedPost } from "../stores/forum.store";
import type { CreatePostRequest, UpdatePostRequest } from "../types/forum.type";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";

const postSchema = z.object({
  title: z.string().min(1, "Vui lòng nhập tiêu đề").max(200, "Tiêu đề tối đa 200 ký tự"),
  content: z.string().min(1, "Vui lòng nhập nội dung"),
  tags: z.array(z.string()).max(10, "Tối đa 10 thẻ"),
  attachments: z.array(z.instanceof(File)).max(5, "Tối đa 5 tệp đính kèm"),
});

type PostFormValues = z.infer<typeof postSchema>;

const PostFormContent: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const postId = params.id ? Number(params.id) : null;
  const isEditMode = !!postId;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  const selectedPost = useSelector(selectForumSelectedPost);

  useForumHashtags();
  useForumPostById(postId!);

  const createPostMutation = useCreateForumPost();
  const updatePostMutation = useUpdateForumPost();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: { title: "", content: "", tags: [], attachments: [] },
  });

  const tags = watch("tags");
  const attachments = watch("attachments");

  useEffect(() => {
    if (isEditMode && selectedPost) {
      setValue("title", selectedPost.title);
      setValue("content", selectedPost.content);
      setValue(
        "tags",
        selectedPost.hashtags.map((h) => h.name),
      );
    }
  }, [isEditMode, selectedPost, setValue]);

  const addTag = (value: string) => {
    const trimmed = value.trim().replace(/^#/, "");
    if (!trimmed || tags.includes(trimmed) || tags.length >= 10) return;
    setValue("tags", [...tags, trimmed]);
    if (tagInputRef.current) tagInputRef.current.value = "";
  };

  const removeTag = (tag: string) =>
    setValue(
      "tags",
      tags.filter((t) => t !== tag),
    );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const existing = new Set(attachments.map((f) => f.name));
    const merged = [...attachments, ...files.filter((f) => !existing.has(f.name))].slice(0, 5);
    setValue("attachments", merged);
    e.target.value = "";
  };

  const removeAttachment = (name: string) =>
    setValue(
      "attachments",
      attachments.filter((f) => f.name !== name),
    );

  const getFileIcon = (file: File) =>
    file.type.startsWith("image/") ? (
      <ImageIcon className="w-4 h-4 text-blue-500" />
    ) : (
      <FileText className="w-4 h-4 text-gray-600" />
    );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const onSubmit = (values: PostFormValues) => {
    if (isEditMode && postId) {
      const postData: UpdatePostRequest = { title: values.title, content: values.content, tags: values.tags };
      updatePostMutation.mutate(
        { id: postId, data: postData, attachments: values.attachments },
        { onSuccess: () => navigate({ to: "/forum/my" }) },
      );
    } else {
      const postData: CreatePostRequest = { title: values.title, content: values.content, tags: values.tags };
      createPostMutation.mutate(
        { data: postData, attachments: values.attachments },
        { onSuccess: () => navigate({ to: "/forum" }) },
      );
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center bg-white min-h-screen">
      <div className="w-full max-w-6xl px-6 py-8">
        <div className="mb-10">
          <Button
            variant="outline"
            size="lg"
            className="gap-2 mb-2 border-gray-300 bg-white shadow-sm transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
            onClick={() => navigate({ to: "/forum" })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại diễn đàn
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {isEditMode ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
          </h1>
          <p className="text-gray-500 mt-1">Phác thảo ý tưởng và chia sẻ với cộng đồng bit learning.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-2">
            <label className="text-md font-bold uppercase tracking-widest text-gray-600">Tiêu đề bài viết</label>
            <input
              {...register("title")}
              className={`w-full h-14 bg-white border-x-0 border-t-0 border-b-2 px-0 text-2xl font-semibold outline-none transition-colors placeholder:text-gray-300 ${
                errors.title ? "border-red-400" : "border-gray-300 focus:border-blue-600"
              }`}
              placeholder="Nhập tiêu đề mô tả rõ ràng..."
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-md font-bold uppercase tracking-widest text-gray-600">Nội dung</label>
            <div
              className={`rounded-xl border overflow-hidden bg-white shadow-sm transition-colors ${
                errors.content ? "border-red-400" : "border-gray-300 focus-within:border-blue-400"
              }`}
            >
              <textarea
                {...register("content")}
                className="w-full min-h-64 bg-transparent outline-none p-6 text-base leading-relaxed text-gray-700 resize-none placeholder:text-gray-300"
                placeholder="Bắt đầu viết bài thảo luận của bạn tại đây..."
              />
            </div>
            {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-600">
                Thẻ liên quan
                <span className="ml-2 normal-case font-normal text-gray-300">{tags.length}/10</span>
              </label>
              <div
                className={`flex flex-wrap gap-2 min-h-12 p-3 bg-white border rounded-lg items-center transition-colors focus-within:border-blue-400 ${
                  errors.tags ? "border-red-400" : "border-gray-200"
                }`}
              >
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-sm font-medium"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {tags.length < 10 && (
                  <input
                    ref={tagInputRef}
                    className="bg-transparent outline-none text-sm flex-1 min-w-24 placeholder:text-gray-300"
                    placeholder="Thêm thẻ, nhấn Enter..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag(e.currentTarget.value);
                      }
                    }}
                    onBlur={(e) => addTag(e.currentTarget.value)}
                  />
                )}
              </div>
              {errors.tags && <p className="text-xs text-red-500">{errors.tags.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-600">
                Đính kèm
                <span className="ml-2 normal-case font-normal text-gray-300">{attachments.length}/5</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                className="cursor-pointer hidden"
                onChange={handleFileChange}
              />

              {attachments.length > 0 ? (
                <div className="space-y-2">
                  {attachments.map((file) => (
                    <div
                      key={file.name}
                      className="flex items-center gap-3 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg group"
                    >
                      {file.type.startsWith("image/") ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-8 h-8 rounded object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                        <p className="text-xs text-gray-600">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        type="button"
                        className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-500 transition-all"
                        onClick={() => removeAttachment(file.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {attachments.length < 5 && (
                    <button
                      type="button"
                      className="cursor-pointer w-full py-2 text-sm text-blue-600 border border-dashed border-blue-200 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      + Thêm tệp
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center gap-2 text-gray-600 text-sm hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="w-4 h-4" />
                  <span className="font-medium">Đính kèm tệp hoặc hình ảnh</span>
                </button>
              )}
              {errors.attachments && <p className="text-xs text-red-500">{errors.attachments.message}</p>}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-8 border-t border-gray-300">
            <button
              type="button"
              className="cursor-pointer border px-6 py-3 text-sm font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => navigate({ to: "/forum" })}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || createPostMutation.isPending || updatePostMutation.isPending}
              className="cursor-pointer flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold rounded-lg shadow-sm shadow-blue-600/20 transition-all"
            >
              {isEditMode ? "Cập nhật" : "Đăng bài"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Tip */}
        <div className="mt-12 flex items-start gap-4 p-5 bg-gray-50 border border-gray-100 rounded-xl">
          <span className="text-2xl shrink-0">✨</span>
          <div>
            <h4 className="font-bold text-gray-800 text-sm">Mẹo chất lượng học thuật</h4>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              Trích dẫn nguồn và sử dụng thẻ mô tả giúp bạn bè dễ dàng tìm kiếm và tương tác với nghiên cứu của bạn.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PostFormContent;
