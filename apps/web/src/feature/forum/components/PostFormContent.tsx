import type React from "react";
import { useEffect, useRef, useState } from "react";
import {
	ArrowLeft,
	X,
	Paperclip,
	ChevronRight,
	FileText,
	Trash2,
	ZoomIn,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
	useCreateForumPost,
	useForumCategories,
	useForumHashtags,
	useForumPostById,
	useUpdateForumPost,
} from "../queries/useForum";
import type {
	CreatePostRequest,
	UpdatePostRequest,
	Attachment,
} from "../types/forum.type";
import { useNavigate, useParams } from "@tanstack/react-router";

const postSchema = z.object({
	title: z
		.string()
		.min(1, "Vui lòng nhập tiêu đề")
		.max(200, "Tiêu đề tối đa 200 ký tự"),
	content: z.string().min(1, "Vui lòng nhập nội dung"),
	categorySlug: z.string().min(1, "Vui lòng chọn danh mục"),
	tags: z.array(z.string()).max(10, "Tối đa 10 thẻ"),
	attachments: z.array(z.instanceof(File)).max(5, "Tối đa 5 tệp đính kèm"),
});

type PostFormValues = z.infer<typeof postSchema>;

function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const notionFontFamily =
	'"NotionInter", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
const notionCardShadow =
	"rgba(0, 0, 0, 0.04) 0px 4px 18px, rgba(0, 0, 0, 0.027) 0px 2.025px 7.84688px, rgba(0, 0, 0, 0.02) 0px 0.8px 2.925px, rgba(0, 0, 0, 0.01) 0px 0.175px 1.04062px";
const notionModalShadow =
	"rgba(0, 0, 0, 0.01) 0px 1px 3px, rgba(0, 0, 0, 0.02) 0px 3px 7px, rgba(0, 0, 0, 0.02) 0px 7px 15px, rgba(0, 0, 0, 0.04) 0px 14px 28px, rgba(0, 0, 0, 0.05) 0px 23px 52px";
const baseFieldClass =
	"w-full rounded-xl border px-4 py-3 text-[15px] text-[#1f1c19] outline-none transition duration-200 placeholder:text-[#a39e98] focus:border-[#097fe8] focus:ring-4 focus:ring-[#0075de]/10";
const normalFieldClass = "border-black/10 bg-white";
const errorFieldClass =
	"border-[#dd5b00]/35 bg-[#fff8f3] ring-4 ring-[#dd5b00]/10";

const PostFormContent: React.FC = () => {
	const navigate = useNavigate();
	const params = useParams({ strict: false });
	const postId = params.id ? Number(params.id) : null;
	const isEditMode = !!postId;

	const fileInputRef = useRef<HTMLInputElement>(null);
	const tagInputRef = useRef<HTMLInputElement>(null);

	const [existingAttachments, setExistingAttachments] = useState<Attachment[]>(
		[],
	);
	const [deletedAttachmentIds, setDeletedAttachmentIds] = useState<number[]>(
		[],
	);
	const [previewImg, setPreviewImg] = useState<string | null>(null);
	const [attachmentPreviewUrls, setAttachmentPreviewUrls] = useState<
		Record<string, string>
	>({});

	useForumHashtags();
	const { data: categoriesResponse } = useForumCategories();

	const { data: postResponse, isLoading: isPostLoading } = useForumPostById(
		postId ?? 0,
	);
	const selectedPost = postResponse?.data ?? null;
	const categories = categoriesResponse?.data ?? [];

	const createPostMutation = useCreateForumPost();
	const updatePostMutation = useUpdateForumPost();

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		setError,
		clearErrors,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<PostFormValues>({
		resolver: zodResolver(postSchema),
		defaultValues: {
			title: "",
			content: "",
			categorySlug: "",
			tags: [],
			attachments: [],
		},
	});

	const tags = watch("tags");
	const attachments = watch("attachments");
	const titleValue = watch("title");
	const contentValue = watch("content");
	const categoryValue = watch("categorySlug");

	const titleLength = titleValue.length;
	const contentLength = contentValue.trim().length;
	const paragraphCount = contentValue
		.split(/\n\s*\n/)
		.map((segment) => segment.trim())
		.filter(Boolean).length;

	useEffect(() => {
		if (isEditMode && selectedPost) {
			reset({
				title: selectedPost.title,
				content: selectedPost.content,
				categorySlug: selectedPost.category?.slug ?? "general",
				tags: selectedPost.hashtags.map((h) => h.name),
				attachments: [],
			});
			setExistingAttachments(selectedPost.attachments ?? []);
			setDeletedAttachmentIds([]);
		}
	}, [isEditMode, selectedPost, reset]);

	useEffect(() => {
		const previews = attachments.reduce<Record<string, string>>((acc, file) => {
			if (file.type.startsWith("image/")) {
				acc[file.name] = URL.createObjectURL(file);
			}
			return acc;
		}, {});

		setAttachmentPreviewUrls(previews);

		return () => {
			Object.values(previews).forEach((url) => {
				URL.revokeObjectURL(url);
			});
		};
	}, [attachments]);

	const addTag = (value: string) => {
		const trimmed = value.trim().replace(/^#/, "");
		if (!trimmed || tags.includes(trimmed) || tags.length >= 10) return;
		setValue("tags", [...tags, trimmed], {
			shouldDirty: true,
			shouldValidate: true,
		});
		clearErrors("tags");
		if (tagInputRef.current) tagInputRef.current.value = "";
	};

	const removeTag = (tag: string) =>
		setValue(
			"tags",
			tags.filter((t) => t !== tag),
			{
				shouldDirty: true,
				shouldValidate: true,
			},
		);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files ?? []);
		const usedSlots = existingAttachments.length + attachments.length;
		const remaining = 5 - usedSlots;
		const existingNames = new Set(attachments.map((f) => f.name));
		const merged = [
			...attachments,
			...files.filter((f) => !existingNames.has(f.name)),
		].slice(0, attachments.length + remaining);
		setValue("attachments", merged, {
			shouldDirty: true,
			shouldValidate: true,
		});
		clearErrors("attachments");
		e.target.value = "";
	};

	const removeNewAttachment = (name: string) =>
		setValue(
			"attachments",
			attachments.filter((f) => f.name !== name),
			{
				shouldDirty: true,
				shouldValidate: true,
			},
		);

	const removeExistingAttachment = (id: number) => {
		setDeletedAttachmentIds((prev) => [...prev, id]);
		setExistingAttachments((prev) => prev.filter((a) => a.id !== id));
	};

	const totalCount = existingAttachments.length + attachments.length;
	const canAddMore = totalCount < 5;
	const writingChecklist = [
		{
			label: "Tiêu đề rõ nghĩa",
			description: "Nói ngay vấn đề hoặc góc nhìn bạn muốn chia sẻ.",
			ready: titleLength >= 12,
		},
		{
			label: "Danh mục đúng chủ đề",
			description: "Đưa bài viết vào đúng nơi để mọi người dễ tìm thấy.",
			ready: Boolean(categoryValue),
		},
		{
			label: "Thẻ mô tả được nội dung",
			description: "Dùng thẻ để bài viết xuất hiện đúng ngữ cảnh thảo luận.",
			ready: tags.length > 0,
		},
		{
			label: "Nội dung đủ bối cảnh",
			description: "Giải thích tình huống, câu hỏi hoặc insight cụ thể.",
			ready: contentLength >= 80,
		},
	];
	const completedItems = writingChecklist.filter((item) => item.ready).length;

	const onSubmit = (values: PostFormValues) => {
		if (!isEditMode && values.tags.length === 0) {
			setError("tags", {
				type: "manual",
				message: "Vui lòng thêm ít nhất 1 thẻ",
			});
			return;
		}

		if (isEditMode && postId) {
			const postData: UpdatePostRequest = {
				title: values.title,
				content: values.content,
				categorySlug: values.categorySlug,
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
				categorySlug: values.categorySlug,
				tags: values.tags,
			};
			createPostMutation.mutate(
				{ data: postData, attachments: values.attachments },
				{ onSuccess: () => navigate({ to: "/forum" }) },
			);
		}
	};

	const isPending =
		isSubmitting ||
		createPostMutation.isPending ||
		updatePostMutation.isPending;

	if (isPostLoading) {
		return (
			<div
				className="flex min-h-screen items-center justify-center bg-[#fbfaf8] px-4"
				style={{ fontFamily: notionFontFamily }}
			>
				<div className="text-center">
					<div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-[#0075de]/20 border-t-[#0075de]" />
					<p className="text-sm font-medium text-[#615d59]">
						Đang tải bài viết...
					</p>
					<p className="mt-1 text-xs text-[#a39e98]">
						Chuẩn bị không gian soạn thảo cho bạn.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div
			className="min-h-screen bg-[linear-gradient(180deg,#fbfaf8_0%,#f6f5f4_100%)]"
			style={{
				color: "rgba(0, 0, 0, 0.95)",
				fontFamily: notionFontFamily,
			}}
		>
			{previewImg && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
					role="dialog"
					aria-modal="true"
					aria-label="Xem trước ảnh đính kèm"
				>
					<button
						type="button"
						className="absolute inset-0"
						aria-label="Đóng xem trước ảnh"
						onClick={() => setPreviewImg(null)}
					/>
					<button
						type="button"
						className="absolute right-4 top-4 z-10 rounded-full p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
						onClick={() => setPreviewImg(null)}
					>
						<X className="w-6 h-6" />
					</button>
					<div className="relative z-10">
						<img
							src={previewImg}
							alt=""
							className="max-h-full max-w-full rounded-2xl object-contain"
							style={{ boxShadow: notionModalShadow }}
						/>
					</div>
				</div>
			)}
			<div className="sticky top-0 z-30 border-b border-black/10 bg-[rgba(251,250,248,0.88)] backdrop-blur-xl">
				<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
					<button
						type="button"
						className="flex items-center gap-2 text-sm font-semibold text-[#615d59] transition-colors hover:text-[#0075de]"
						onClick={() =>
							navigate({ to: isEditMode ? "/forum/my" : "/forum" })
						}
					>
						<ArrowLeft className="w-4 h-4" />
						Quay lại diễn đàn
					</button>
					<span className="inline-flex rounded-full border border-[#097fe8]/15 bg-[#f2f9ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#097fe8]">
						{isEditMode ? "Chỉnh sửa" : "Bản nháp mới"}
					</span>
				</div>
			</div>

			<div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
				<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
					<div>
						<section
							className="overflow-hidden rounded-[1.5rem] border border-black/10 bg-white"
							style={{ boxShadow: notionCardShadow }}
						>
							<div className="border-b border-black/10 bg-[linear-gradient(135deg,rgba(242,249,255,0.92)_0%,rgba(255,255,255,0.98)_50%,rgba(246,245,244,0.96)_100%)] px-5 py-6 sm:px-7 sm:py-7">
								<span className="inline-flex rounded-full border border-[#097fe8]/15 bg-[#f2f9ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#097fe8]">
									{isEditMode ? "Tinh chỉnh bài viết" : "Không gian soạn thảo"}
								</span>
								<h1 className="mt-4 text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.04] tracking-[-0.04em] [font-feature-settings:'lnum'_'locl']">
									{isEditMode ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
								</h1>
								<p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#615d59]">
									Một trang viết tối giản, ấm và tập trung để bạn chia sẻ suy
									nghĩ rõ hơn với cộng đồng Bit Learning.
								</p>
							</div>

							<form
								onSubmit={handleSubmit(onSubmit)}
								className="space-y-5 px-4 py-5 sm:px-7 sm:py-7"
							>
								<div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(240px,0.7fr)]">
									<section className="rounded-[1.25rem] border border-black/10 bg-[#fcfbfa] p-4 sm:p-5">
										<div className="mb-3 flex items-start justify-between gap-3">
											<div>
												<label
													htmlFor="post-title"
													className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#615d59]"
												>
													Tiêu đề
												</label>
												<p className="mt-1 text-sm text-[#615d59]">
													Một câu ngắn, rõ ý và đủ ngữ cảnh để người đọc muốn mở
													bài viết.
												</p>
											</div>
											<span className="rounded-full border border-black/10 bg-white px-3 py-1 text-[11px] font-medium text-[#615d59]">
												{titleLength}/200
											</span>
										</div>
										<input
											id="post-title"
											{...register("title")}
											className={`${baseFieldClass} ${
												errors.title ? errorFieldClass : normalFieldClass
											} text-base font-semibold placeholder:font-normal`}
											placeholder="Ví dụ: Cách mình ghi chú để học frontend nhanh hơn"
										/>
										{errors.title && (
											<p className="mt-2 text-xs text-[#dd5b00]">
												{errors.title.message}
											</p>
										)}
									</section>

									<section className="rounded-[1.25rem] border border-black/10 bg-[#fcfbfa] p-4 sm:p-5">
										<div className="mb-3">
											<label
												htmlFor="post-category"
												className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#615d59]"
											>
												Danh mục
											</label>
											<p className="mt-1 text-sm text-[#615d59]">
												Chọn đúng chủ đề để bài viết đi tới đúng người đọc.
											</p>
										</div>
										<select
											id="post-category"
											{...register("categorySlug")}
											className={`${baseFieldClass} ${
												errors.categorySlug ? errorFieldClass : normalFieldClass
											} font-medium`}
										>
											<option value="">Chọn danh mục bài viết</option>
											{categories.map((category) => (
												<option key={category.id} value={category.slug}>
													{category.name}
												</option>
											))}
										</select>
										{errors.categorySlug && (
											<p className="mt-2 text-xs text-[#dd5b00]">
												{errors.categorySlug.message}
											</p>
										)}
									</section>
								</div>

								<section className="rounded-[1.25rem] border border-black/10 bg-[#fcfbfa] p-4 sm:p-5">
									<div className="mb-3 flex flex-wrap items-start justify-between gap-3">
										<div>
											<label
												htmlFor="post-content"
												className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#615d59]"
											>
												Nội dung
											</label>
											<p className="mt-1 text-sm text-[#615d59]">
												Viết theo nhịp tự nhiên. Mỗi đoạn nên xoay quanh một ý
												chính để dễ đọc hơn.
											</p>
										</div>
										<div className="flex flex-wrap items-center gap-2">
											<span className="rounded-full border border-black/10 bg-white px-3 py-1 text-[11px] font-medium text-[#615d59]">
												{contentLength} ký tự
											</span>
											<span className="rounded-full border border-black/10 bg-white px-3 py-1 text-[11px] font-medium text-[#615d59]">
												{paragraphCount} đoạn
											</span>
										</div>
									</div>
									<div
										className={`rounded-[1rem] border px-4 py-4 transition duration-200 focus-within:border-[#097fe8] focus-within:ring-4 focus-within:ring-[#0075de]/10 ${
											errors.content
												? errorFieldClass
												: "border-black/10 bg-white"
										}`}
									>
										<textarea
											id="post-content"
											{...register("content")}
											className="min-h-[420px] w-full resize-y bg-transparent text-[15px] leading-7 text-[#1f1c19] outline-none placeholder:text-[#a39e98]"
											placeholder="Mở đầu bằng bối cảnh hoặc câu hỏi bạn đang quan tâm, sau đó phát triển từng ý theo từng đoạn ngắn..."
										/>
									</div>
									{errors.content && (
										<p className="mt-2 text-xs text-[#dd5b00]">
											{errors.content.message}
										</p>
									)}
								</section>

								<section className="rounded-[1.25rem] border border-black/10 bg-[#fcfbfa] p-4 sm:p-5">
									<div className="mb-3 flex flex-wrap items-start justify-between gap-3">
										<div>
											<label
												htmlFor="post-tags"
												className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#615d59]"
											>
												Thẻ liên quan
											</label>
											<p className="mt-1 text-sm text-[#615d59]">
												Thêm từ khóa ngắn để bài viết dễ được khám phá hơn.
											</p>
										</div>
										<div className="flex flex-wrap items-center gap-2">
											<span className="rounded-full border border-black/10 bg-white px-3 py-1 text-[11px] font-medium text-[#615d59]">
												{tags.length}/10 thẻ
											</span>
											{!isEditMode && (
												<span className="rounded-full border border-[#dd5b00]/15 bg-[#fff5ec] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#dd5b00]">
													Bắt buộc tối thiểu 1 thẻ
												</span>
											)}
										</div>
									</div>
									<div
										className={`flex min-h-14 flex-wrap items-center gap-2 rounded-[1rem] border px-3 py-3 transition duration-200 focus-within:border-[#097fe8] focus-within:ring-4 focus-within:ring-[#0075de]/10 ${
											errors.tags ? errorFieldClass : "border-black/10 bg-white"
										}`}
									>
										{tags.map((tag) => (
											<span
												key={tag}
												className="inline-flex items-center gap-1 rounded-full border border-[#097fe8]/15 bg-[#f2f9ff] px-3 py-1.5 text-xs font-semibold text-[#097fe8]"
											>
												#{tag}
												<button
													type="button"
													onClick={() => removeTag(tag)}
													className="transition-colors hover:text-[#dd5b00]"
												>
													<X className="h-3.5 w-3.5" />
												</button>
											</span>
										))}
										{tags.length < 10 && (
											<input
												id="post-tags"
												ref={tagInputRef}
												className="min-w-[140px] flex-1 bg-transparent text-sm text-[#1f1c19] outline-none placeholder:text-[#a39e98]"
												placeholder={
													tags.length === 0
														? "Gõ thẻ rồi nhấn Enter"
														: "Thêm thẻ khác"
												}
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
									{errors.tags && (
										<p className="mt-2 text-xs text-[#dd5b00]">
											{errors.tags.message}
										</p>
									)}
								</section>

								<section className="rounded-[1.25rem] border border-black/10 bg-[#fcfbfa] p-4 sm:p-5">
									<div className="mb-4 flex flex-wrap items-start justify-between gap-3">
										<div>
											<label
												htmlFor="post-attachments"
												className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#615d59]"
											>
												Tệp đính kèm
											</label>
											<p className="mt-1 text-sm text-[#615d59]">
												Đính kèm khi hình ảnh hoặc tài liệu giúp làm rõ nội
												dung.
											</p>
										</div>
										<span className="rounded-full border border-black/10 bg-white px-3 py-1 text-[11px] font-medium text-[#615d59]">
											{totalCount}/5 tệp
										</span>
									</div>

									<input
										id="post-attachments"
										ref={fileInputRef}
										type="file"
										multiple
										accept="image/*,.pdf,.doc,.docx"
										className="hidden"
										onChange={handleFileChange}
									/>

									<div className="space-y-3">
										{existingAttachments.length > 0 && (
											<div className="space-y-2">
												<p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#615d59]">
													Tệp hiện có
												</p>
												{existingAttachments.map((file) => (
													<div
														key={file.id}
														className="group flex items-center gap-3 rounded-[1rem] border border-black/10 bg-white px-4 py-3"
													>
														{file.type === "IMAGE" ? (
															<button
																type="button"
																className="group/thumb relative h-12 w-12 shrink-0 cursor-pointer overflow-hidden rounded-xl"
																onClick={() => setPreviewImg(file.url)}
															>
																<img
																	src={file.url}
																	alt=""
																	className="h-full w-full object-cover"
																/>
																<div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover/thumb:bg-black/30">
																	<ZoomIn className="h-3.5 w-3.5 text-white opacity-0 transition-opacity group-hover/thumb:opacity-100" />
																</div>
															</button>
														) : (
															<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-[#f6f5f4]">
																<FileText className="h-4 w-4 text-[#615d59]" />
															</div>
														)}
														<div className="min-w-0 flex-1">
															<p className="truncate text-sm font-medium text-[#1f1c19]">
																{file.type === "IMAGE"
																	? "Hình ảnh đã tải lên"
																	: "Tài liệu đã tải lên"}
															</p>
															<a
																href={file.url}
																target="_blank"
																rel="noopener noreferrer"
																className="text-xs text-[#0075de] transition-colors hover:text-[#005bab] hover:underline"
															>
																Mở tệp
															</a>
														</div>
														<button
															type="button"
															className="rounded-full p-2 text-[#a39e98] transition-colors hover:bg-[#fff5ec] hover:text-[#dd5b00]"
															onClick={() => removeExistingAttachment(file.id)}
														>
															<Trash2 className="h-4 w-4" />
														</button>
													</div>
												))}
											</div>
										)}

										{attachments.length > 0 && (
											<div className="space-y-2">
												<p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#615d59]">
													{existingAttachments.length > 0
														? "Tệp mới"
														: "Tệp đã chọn"}
												</p>
												{attachments.map((file) => (
													<div
														key={file.name}
														className="group flex items-center gap-3 rounded-[1rem] border border-[#097fe8]/15 bg-[#f8fbff] px-4 py-3"
													>
														{file.type.startsWith("image/") ? (
															<button
																type="button"
																className="relative h-12 w-12 shrink-0 cursor-pointer overflow-hidden rounded-xl"
																onClick={() =>
																	setPreviewImg(
																		attachmentPreviewUrls[file.name] ?? null,
																	)
																}
															>
																<img
																	src={attachmentPreviewUrls[file.name]}
																	alt={file.name}
																	className="h-full w-full object-cover"
																/>
															</button>
														) : (
															<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#097fe8]/10 bg-white">
																<FileText className="h-4 w-4 text-[#097fe8]" />
															</div>
														)}
														<div className="min-w-0 flex-1">
															<p className="truncate text-sm font-medium text-[#1f1c19]">
																{file.name}
															</p>
															<p className="text-xs text-[#615d59]">
																{formatFileSize(file.size)}
															</p>
														</div>
														<button
															type="button"
															className="rounded-full p-2 text-[#a39e98] transition-colors hover:bg-[#fff5ec] hover:text-[#dd5b00]"
															onClick={() => removeNewAttachment(file.name)}
														>
															<Trash2 className="h-4 w-4" />
														</button>
													</div>
												))}
											</div>
										)}

										{canAddMore && (
											<button
												type="button"
												className="flex w-full items-center justify-center gap-2 rounded-[1rem] border border-dashed border-black/15 bg-white px-4 py-4 text-sm font-medium text-[#615d59] transition duration-200 hover:border-[#097fe8]/40 hover:bg-[#f8fbff] hover:text-[#097fe8]"
												onClick={() => fileInputRef.current?.click()}
											>
												<Paperclip className="h-4 w-4" />
												{totalCount === 0
													? "Đính kèm hình ảnh hoặc tài liệu"
													: "Thêm tệp đính kèm"}
											</button>
										)}

										<p className="text-xs leading-5 text-[#a39e98]">
											Hỗ trợ ảnh, PDF, DOC và DOCX. Tối đa 5 tệp cho mỗi bài
											viết.
										</p>
									</div>

									{errors.attachments && (
										<p className="mt-2 text-xs text-[#dd5b00]">
											{errors.attachments.message}
										</p>
									)}
								</section>

								<div className="flex flex-col gap-4 border-t border-black/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
									<p className="text-sm leading-6 text-[#615d59]">
										{isEditMode
											? "Kiểm tra lại nội dung trước khi cập nhật để tránh làm mất ngữ cảnh thảo luận."
											: "Bài viết sẽ được đăng ngay khi bạn hoàn tất. Hãy đọc lại một lần để câu chữ gọn và rõ."}
									</p>
									<div className="flex items-center justify-end gap-3">
										<button
											type="button"
											className="rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-[#615d59] transition duration-200 hover:border-black/15 hover:bg-[#f6f5f4] hover:text-[#1f1c19]"
											onClick={() =>
												navigate({ to: isEditMode ? "/forum/my" : "/forum" })
											}
										>
											Hủy
										</button>
										<button
											type="submit"
											disabled={isPending}
											className="flex items-center gap-2 rounded-xl bg-[#0075de] px-6 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-[#005bab] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#62aef0]"
										>
											{isPending ? (
												<>
													<svg
														className="h-4 w-4 animate-spin"
														viewBox="0 0 24 24"
														fill="none"
													>
														<circle
															className="opacity-25"
															cx="12"
															cy="12"
															r="10"
															stroke="currentColor"
															strokeWidth="4"
														/>
														<path
															className="opacity-75"
															fill="currentColor"
															d="M4 12a8 8 0 018-8v8z"
														/>
													</svg>
													Đang xử lý...
												</>
											) : (
												<>
													{isEditMode ? "Cập nhật bài viết" : "Đăng"}
													<ChevronRight className="h-4 w-4" />
												</>
											)}
										</button>
									</div>
								</div>
							</form>
						</section>
					</div>

					<aside className="space-y-4 lg:sticky lg:top-24">
						<section
							className="rounded-[1.25rem] border border-black/10 bg-white/90 p-5 backdrop-blur"
							style={{ boxShadow: notionCardShadow }}
						>
							<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#615d59]">
								Tiến độ bài viết
							</p>
							<div className="mt-4 flex items-end justify-between gap-3">
								<div>
									<p className="text-3xl font-bold leading-none tracking-[-0.04em] [font-feature-settings:'lnum'_'locl']">
										{completedItems}/{writingChecklist.length}
									</p>
									<p className="mt-2 text-sm text-[#615d59]">
										Mỗi mục hoàn tất giúp bài viết rõ và dễ đọc hơn.
									</p>
								</div>
								<span className="rounded-full border border-[#097fe8]/15 bg-[#f2f9ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#097fe8]">
									{completedItems === writingChecklist.length
										? "Sẵn sàng"
										: "Đang hoàn thiện"}
								</span>
							</div>
							<div className="mt-5 space-y-3">
								{writingChecklist.map((item) => (
									<div
										key={item.label}
										className="rounded-[1rem] border border-black/10 bg-[#fcfbfa] px-4 py-3"
									>
										<div className="flex items-start justify-between gap-3">
											<div>
												<p className="text-sm font-semibold text-[#1f1c19]">
													{item.label}
												</p>
												<p className="mt-1 text-xs leading-5 text-[#615d59]">
													{item.description}
												</p>
											</div>
											<span
												className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${
													item.ready ? "bg-[#2a9d99]" : "bg-[#d7d2cc]"
												}`}
											/>
										</div>
									</div>
								))}
							</div>
						</section>

						<section
							className="rounded-[1.25rem] border border-black/10 bg-white/90 p-5 backdrop-blur"
							style={{ boxShadow: notionCardShadow }}
						>
							<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#615d59]">
								Nhịp viết hiện tại
							</p>
							<div className="mt-4 grid grid-cols-2 gap-3">
								<div className="rounded-[1rem] border border-black/10 bg-[#fcfbfa] p-4">
									<p className="text-[11px] uppercase tracking-[0.14em] text-[#a39e98]">
										Tiêu đề
									</p>
									<p className="mt-2 text-2xl font-bold tracking-[-0.03em]">
										{titleLength}
									</p>
									<p className="mt-1 text-xs text-[#615d59]">ký tự</p>
								</div>
								<div className="rounded-[1rem] border border-black/10 bg-[#fcfbfa] p-4">
									<p className="text-[11px] uppercase tracking-[0.14em] text-[#a39e98]">
										Nội dung
									</p>
									<p className="mt-2 text-2xl font-bold tracking-[-0.03em]">
										{contentLength}
									</p>
									<p className="mt-1 text-xs text-[#615d59]">ký tự</p>
								</div>
								<div className="rounded-[1rem] border border-black/10 bg-[#fcfbfa] p-4">
									<p className="text-[11px] uppercase tracking-[0.14em] text-[#a39e98]">
										Thẻ
									</p>
									<p className="mt-2 text-2xl font-bold tracking-[-0.03em]">
										{tags.length}
									</p>
									<p className="mt-1 text-xs text-[#615d59]">đã thêm</p>
								</div>
								<div className="rounded-[1rem] border border-black/10 bg-[#fcfbfa] p-4">
									<p className="text-[11px] uppercase tracking-[0.14em] text-[#a39e98]">
										Tệp
									</p>
									<p className="mt-2 text-2xl font-bold tracking-[-0.03em]">
										{totalCount}
									</p>
									<p className="mt-1 text-xs text-[#615d59]">đính kèm</p>
								</div>
							</div>
							<div className="mt-4 rounded-[1rem] border border-[#097fe8]/15 bg-[#f2f9ff] px-4 py-3">
								<p className="text-sm font-semibold text-[#1f1c19]">
									Gợi ý trải nghiệm viết
								</p>
								<p className="mt-1 text-sm leading-6 text-[#615d59]">
									Ưu tiên tiêu đề cụ thể, mở bài có bối cảnh và dùng mỗi đoạn
									cho một ý chính để người đọc theo dõi nhanh hơn.
								</p>
							</div>
						</section>
					</aside>
				</div>
			</div>
		</div>
	);
};

export default PostFormContent;
