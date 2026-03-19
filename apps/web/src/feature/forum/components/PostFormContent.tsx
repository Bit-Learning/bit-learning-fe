import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, X, Paperclip, ChevronRight, FileText, Trash2, ZoomIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateForumPost, useForumHashtags, useForumPostById, useUpdateForumPost } from "../queries/useForum";
import type { CreatePostRequest, UpdatePostRequest, Attachment } from "../types/forum.type";
import { useNavigate, useParams } from "@tanstack/react-router";

const postSchema = z.object({
  title: z.string().min(1, "Vui lòng nhập tiêu đề").max(200, "Tiêu đề tối đa 200 ký tự"),
  content: z.string().min(1, "Vui lòng nhập nội dung"),
  tags: z.array(z.string()).max(10, "Tối đa 10 thẻ"),
  attachments: z.array(z.instanceof(File)).max(5, "Tối đa 5 tệp đính kèm"),
});

type PostFormValues = z.infer<typeof postSchema>;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const PostFormContent: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const postId = params.id ? Number(params.id) : null;
  const isEditMode = !!postId;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>([]);
  const [deletedAttachmentIds, setDeletedAttachmentIds] = useState<number[]>([]);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  useForumHashtags();

  const { data: postResponse, isLoading: isPostLoading } = useForumPostById(postId!);
  const selectedPost = postResponse?.data ?? null;

  const createPostMutation = useCreateForumPost();
  const updatePostMutation = useUpdateForumPost();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: { title: "", content: "", tags: [], attachments: [] },
  });

  const tags = watch("tags");
  const attachments = watch("attachments");

  useEffect(() => {
    if (isEditMode && selectedPost) {
      reset({
        title: selectedPost.title,
        content: selectedPost.content,
        tags: selectedPost.hashtags.map((h) => h.name),
        attachments: [],
      });
      setExistingAttachments(selectedPost.attachments ?? []);
      setDeletedAttachmentIds([]);
    }
  }, [isEditMode, selectedPost, reset]);

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
    const usedSlots = existingAttachments.length + attachments.length;
    const remaining = 5 - usedSlots;
    const existingNames = new Set(attachments.map((f) => f.name));
    const merged = [...attachments, ...files.filter((f) => !existingNames.has(f.name))].slice(
      0,
      attachments.length + remaining,
    );
    setValue("attachments", merged);
    e.target.value = "";
  };

  const removeNewAttachment = (name: string) =>
    setValue(
      "attachments",
      attachments.filter((f) => f.name !== name),
    );

  const removeExistingAttachment = (id: number) => {
    setDeletedAttachmentIds((prev) => [...prev, id]);
    setExistingAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const totalCount = existingAttachments.length + attachments.length;
  const canAddMore = totalCount < 5;

  const onSubmit = (values: PostFormValues) => {
    if (isEditMode && postId) {
      const postData: UpdatePostRequest = {
        title: values.title,
        content: values.content,
        tags: values.tags,
        deletedAttachmentIds: deletedAttachmentIds,
      };
      updatePostMutation.mutate(
        { id: postId, data: postData, attachments: values.attachments },
        { onSuccess: () => navigate({ to: "/forum/my" }) },
      );
    } else {
      const postData: CreatePostRequest = {
        title: values.title,
        content: values.content,
        tags: values.tags,
      };
      createPostMutation.mutate(
        { data: postData, attachments: values.attachments },
        { onSuccess: () => navigate({ to: "/forum" }) },
      );
    }
  };

  const isPending = isSubmitting || createPostMutation.isPending || updatePostMutation.isPending;

  if (isPostLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-blue-600 dark:text-slate-200 font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {previewImg && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImg(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/60 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors"
            onClick={() => setPreviewImg(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={previewImg}
            alt=""
            className="max-w-full max-h-full rounded-sm object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      <div className="bg-white border-b border-gray-400 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-12 flex items-center">
          <button
            className="cursor-pointer flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors"
            onClick={() => navigate({ to: isEditMode ? "/forum/my" : "/forum" })}
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại diễn đàn
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-7">
          <h1 className="text-2xl font-extrabold text-gray-900">
            {isEditMode ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
          </h1>
          <p className="text-sm text-gray-600 mt-1">Chia sẻ ý tưởng với cộng đồng bit learning</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold uppercase tracking-widest text-gray-600">Tiêu đề</label>
            <input
              {...register("title")}
              className={`w-full bg-white border rounded-sm px-4 py-3 text-base font-semibold outline-none transition-all placeholder:text-gray-300 placeholder:font-normal shadow-sm ${
                errors.title
                  ? "border-red-300 ring-2 ring-red-100"
                  : "border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              }`}
              placeholder="Nhập tiêu đề mô tả rõ ràng..."
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold uppercase tracking-widest text-gray-600">Nội dung</label>
            <textarea
              {...register("content")}
              className={`w-full min-h-52 bg-white border rounded-sm px-4 py-3 text-sm leading-relaxed text-gray-700 resize-none outline-none transition-all placeholder:text-gray-300 shadow-sm ${
                errors.content
                  ? "border-red-300 ring-2 ring-red-100"
                  : "border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              }`}
              placeholder="Bắt đầu viết bài thảo luận của bạn tại đây..."
            />
            {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold uppercase tracking-widest text-gray-600">
              Thẻ liên quan
              <span className="ml-2 normal-case font-normal text-gray-400">({tags.length})</span>
            </label>
            <div
              className={`flex flex-wrap gap-2 min-h-11 px-3 py-2.5 bg-white border rounded-sm items-center shadow-sm transition-all focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 ${
                errors.tags ? "border-red-300 ring-2 ring-red-100" : "border-gray-200"
              }`}
            >
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-semibold"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-500 transition-colors ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {tags.length < 10 && (
                <input
                  ref={tagInputRef}
                  className="bg-transparent outline-none text-sm flex-1 min-w-24 placeholder:text-gray-300"
                  placeholder={tags.length === 0 ? "Thêm thẻ, nhấn Enter..." : ""}
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

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold uppercase tracking-widest text-gray-600">Tệp đính kèm</label>
              <span className="text-xs text-gray-600">{totalCount}</span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              className="hidden"
              onChange={handleFileChange}
            />

            {existingAttachments.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-600">Tệp hiện có</p>
                {existingAttachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 px-3 py-2.5 bg-white border border-gray-200 rounded-sm shadow-sm group"
                  >
                    {file.type === "IMAGE" ? (
                      <div
                        className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 cursor-pointer group/thumb"
                        onClick={() => setPreviewImg(file.url)}
                      >
                        <img src={file.url} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/30 transition-colors flex items-center justify-center">
                          <ZoomIn className="w-3.5 h-3.5 text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-blue-50 rounded-sm flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-blue-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {file.type === "IMAGE" ? "Hình ảnh" : "Tài liệu"}
                      </p>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        Xem tệp
                      </a>
                    </div>
                    <button
                      type="button"
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      onClick={() => removeExistingAttachment(file.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {attachments.length > 0 && (
              <div className="space-y-2">
                {existingAttachments.length > 0 && <p className="text-xs font-semibold text-gray-600">Tệp mới</p>}
                {attachments.map((file) => (
                  <div
                    key={file.name}
                    className="flex items-center gap-3 px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-sm group"
                  >
                    {file.type.startsWith("image/") ? (
                      <div
                        className="w-10 h-10 rounded-lg overflow-hidden shrink-0 cursor-pointer"
                        onClick={() => setPreviewImg(URL.createObjectURL(file))}
                      >
                        <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-white rounded-sm flex items-center justify-center shrink-0 border border-blue-100">
                        <FileText className="w-4 h-4 text-blue-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                      <p className="text-xs text-gray-600">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                      type="button"
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      onClick={() => removeNewAttachment(file.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {canAddMore && (
              <button
                type="button"
                className="cursor-pointer w-full border-2 border-dashed border-gray-200 bg-white rounded-sm py-4 flex items-center justify-center gap-2 text-gray-600 text-sm hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/40 transition-all shadow-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="w-4 h-4" />
                {totalCount === 0 ? "Đính kèm tệp hoặc hình ảnh" : `+ Thêm tệp `}
              </button>
            )}

            {errors.attachments && <p className="text-xs text-red-500">{errors.attachments.message}</p>}
          </div>

          <div className="border-t border-gray-200 pt-2" />

          <div className="flex items-center justify-end gap-3 pb-8">
            <button
              type="button"
              className="cursor-pointer px-5 py-3 text-sm font-semibold text-gray-500 hover:text-gray-800 hover:bg-white rounded-sm transition-colors border border-transparent hover:border-gray-200"
              onClick={() => navigate({ to: "/forum" })}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="cursor-pointer flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-sm font-bold rounded-sm shadow-sm transition-all"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                <>
                  {isEditMode ? "Cập nhật bài viết" : "Đăng bài"}
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostFormContent;
