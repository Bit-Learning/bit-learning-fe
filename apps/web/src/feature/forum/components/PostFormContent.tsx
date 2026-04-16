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
import { toast } from "@/shared/components/Sonner";
import { getAccessToken } from "@/shared/lib/cookies";
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

const MAX_ATTACHMENTS = 5;
const SAFE_IMAGE_EXTENSIONS = new Set([
	"jpg",
	"jpeg",
	"png",
	"webp",
	"gif",
	"avif",
]);
const SAFE_FILE_EXTENSIONS = new Set([
	"pdf",
	"txt",
	"doc",
	"docx",
	"xls",
	"xlsx",
	"ppt",
	"pptx",
]);
const SAFE_IMAGE_ACCEPT = ".jpg,.jpeg,.png,.webp,.gif,.avif";
const SAFE_FILE_ACCEPT = ".pdf,.txt,.doc,.docx,.xls,.xlsx,.ppt,.pptx";

const postSchema = z.object({
	title: z
		.string()
		.min(1, "Vui lòng nhập tiêu đề")
		.max(200, "Tiêu đề tối đa 200 ký tự"),
	content: z.string().min(1, "Vui lòng nhập nội dung"),
	categorySlug: z.string().min(1, "Vui lòng chọn danh mục"),
	tags: z.array(z.string()).max(10, "Tối đa 10 thẻ"),
	attachments: z
		.array(z.instanceof(File))
		.max(MAX_ATTACHMENTS, `Tối đa ${MAX_ATTACHMENTS} tệp đính kèm`),
});

type PostFormValues = z.infer<typeof postSchema>;

function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExtension(fileName: string): string {
	const parts = fileName.split(".");
	return parts.length > 1 ? (parts.at(-1)?.toLowerCase() ?? "") : "";
}

function isSafeImage(file: File): boolean {
	const extension = getFileExtension(file.name);
	return (
		SAFE_IMAGE_EXTENSIONS.has(extension) &&
		(file.type === "" || file.type.startsWith("image/"))
	);
}

function isSafeDocument(file: File): boolean {
	const extension = getFileExtension(file.name);
	return SAFE_FILE_EXTENSIONS.has(extension);
}

function buildThumbnailKeyForFile(file: File): string {
	return `new:${file.name}:${file.size}:${file.lastModified}`;
}

function buildThumbnailKeyForAttachment(attachment: Attachment): string {
	return `existing:${attachment.id}`;
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
	const isAuthenticated = Boolean(getAccessToken());

	const imageInputRef = useRef<HTMLInputElement>(null);
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
	const [selectedThumbnailKey, setSelectedThumbnailKey] = useState<
		string | null
	>(null);

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

	const existingImageAttachments = existingAttachments.filter(
		(attachment) => attachment.type === "IMAGE",
	);
	const existingFileAttachments = existingAttachments.filter(
		(attachment) => attachment.type !== "IMAGE",
	);
	const imageFiles = attachments.filter((file) => isSafeImage(file));
	const documentFiles = attachments.filter((file) => !isSafeImage(file));
	const totalImageCount = existingImageAttachments.length + imageFiles.length;
	const totalCount = existingAttachments.length + attachments.length;
	const canAddMore = totalCount < MAX_ATTACHMENTS;
	const selectedNewThumbnailFile =
		imageFiles.find(
			(file) => buildThumbnailKeyForFile(file) === selectedThumbnailKey,
		) ?? null;
	const selectedExistingThumbnail =
		existingImageAttachments.find(
			(attachment) =>
				buildThumbnailKeyForAttachment(attachment) === selectedThumbnailKey,
		) ?? null;
	const canSelectThumbnail =
		!isEditMode || existingImageAttachments.length === 0;

	useEffect(() => {
		if (!isAuthenticated) {
			toast.error({
				title: "Bạn cần đăng nhập để tạo bài viết trên diễn đàn",
			});
			navigate({ to: "/forum" });
		}
	}, [isAuthenticated, navigate]);

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
			const firstExistingImage = (selectedPost.attachments ?? []).find(
				(attachment) => attachment.type === "IMAGE",
			);
			setSelectedThumbnailKey(
				firstExistingImage
					? buildThumbnailKeyForAttachment(firstExistingImage)
					: null,
			);
		}
	}, [isEditMode, selectedPost, reset]);

	useEffect(() => {
		const firstImageFile = imageFiles[0];
		if (!isEditMode && selectedThumbnailKey == null && firstImageFile) {
			setSelectedThumbnailKey(buildThumbnailKeyForFile(firstImageFile));
		}
	}, [imageFiles, isEditMode, selectedThumbnailKey]);

	useEffect(() => {
		const stillExists =
			existingImageAttachments.some(
				(attachment) =>
					buildThumbnailKeyForAttachment(attachment) === selectedThumbnailKey,
			) ||
			imageFiles.some(
				(file) => buildThumbnailKeyForFile(file) === selectedThumbnailKey,
			);

		if (selectedThumbnailKey && !stillExists) {
			const fallbackExisting = existingImageAttachments[0];
			const fallbackNew = imageFiles[0];
			setSelectedThumbnailKey(
				fallbackExisting
					? buildThumbnailKeyForAttachment(fallbackExisting)
					: fallbackNew
						? buildThumbnailKeyForFile(fallbackNew)
						: null,
			);
		}
	}, [existingImageAttachments, imageFiles, selectedThumbnailKey]);

	useEffect(() => {
		const previews = attachments.reduce<Record<string, string>>((acc, file) => {
			if (file.type.startsWith("image/")) {
				acc[buildThumbnailKeyForFile(file)] = URL.createObjectURL(file);
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

	const mergeAttachments = (incomingFiles: File[]) => {
		const usedSlots = existingAttachments.length + attachments.length;
		const remaining = MAX_ATTACHMENTS - usedSlots;
		if (remaining <= 0) {
			setError("attachments", {
				type: "manual",
				message: `Chỉ có thể đính kèm tối đa ${MAX_ATTACHMENTS} tệp.`,
			});
			return;
		}

		const existingKeys = new Set(
			attachments.map(
				(file) => `${file.name}:${file.size}:${file.lastModified}`,
			),
		);
		const deduped = incomingFiles.filter(
			(file) =>
				!existingKeys.has(`${file.name}:${file.size}:${file.lastModified}`),
		);
		const limitedFiles = deduped.slice(0, remaining);
		const merged = [...attachments, ...limitedFiles];
		setValue("attachments", merged, {
			shouldDirty: true,
			shouldValidate: true,
		});
		clearErrors("attachments");

		if (selectedThumbnailKey == null) {
			const firstNewImage = limitedFiles.find((file) => isSafeImage(file));
			if (firstNewImage) {
				setSelectedThumbnailKey(buildThumbnailKeyForFile(firstNewImage));
			}
		}

		if (deduped.length > limitedFiles.length) {
			toast.error({
				title: `Chỉ có thể thêm tối đa ${MAX_ATTACHMENTS} tệp cho mỗi bài viết`,
			});
		}
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files ?? []);
		if (files.length === 0) return;

		const invalidFiles = files.filter((file) => !isSafeImage(file));
		if (invalidFiles.length > 0) {
			setError("attachments", {
				type: "manual",
				message:
					"Chỉ chấp nhận ảnh JPG, JPEG, PNG, WEBP, GIF hoặc AVIF. Không hỗ trợ SVG.",
			});
			e.target.value = "";
			return;
		}

		mergeAttachments(files);
		e.target.value = "";
	};

	const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files ?? []);
		if (files.length === 0) return;

		const invalidFiles = files.filter((file) => !isSafeDocument(file));
		if (invalidFiles.length > 0) {
			setError("attachments", {
				type: "manual",
				message:
					"Chỉ chấp nhận tệp an toàn: PDF, TXT, DOC, DOCX, XLS, XLSX, PPT, PPTX.",
			});
			e.target.value = "";
			return;
		}

		mergeAttachments(files);
		e.target.value = "";
	};

	const removeNewAttachment = (fileKey: string) =>
		setValue(
			"attachments",
			attachments.filter((file) => buildThumbnailKeyForFile(file) !== fileKey),
			{
				shouldDirty: true,
				shouldValidate: true,
			},
		);

	const removeExistingAttachment = (id: number) => {
		setDeletedAttachmentIds((prev) => [...prev, id]);
		setExistingAttachments((prev) => prev.filter((a) => a.id !== id));
	};
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
		{
			label: "Có ít nhất một ảnh",
			description:
				"Ảnh là bắt buộc để card bài viết luôn có thumbnail và giữ bố cục đẹp.",
			ready: totalImageCount > 0,
		},
	];
	const completedItems = writingChecklist.filter((item) => item.ready).length;

	const onSubmit = (values: PostFormValues) => {
		const selectedThumbnail =
			imageFiles.find(
				(file) => buildThumbnailKeyForFile(file) === selectedThumbnailKey,
			) ?? imageFiles[0];
		const orderedAttachments = [
			...(selectedThumbnail ? [selectedThumbnail] : []),
			...imageFiles.filter((file) => file !== selectedThumbnail),
			...documentFiles,
		];

		if (!isEditMode && values.tags.length === 0) {
			setError("tags", {
				type: "manual",
				message: "Vui lòng thêm ít nhất 1 thẻ",
			});
			return;
		}

		if (totalImageCount === 0) {
			setError("attachments", {
				type: "manual",
				message:
					"Bài viết phải có ít nhất 1 ảnh để hiển thị thumbnail trên diễn đàn.",
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
				{ id: postId, data: postData, attachments: orderedAttachments },
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
				{ data: postData, attachments: orderedAttachments },
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

	if (!isAuthenticated) {
		return null;
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
												htmlFor="post-images"
												className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#615d59]"
											>
												Ảnh và tệp đính kèm
											</label>
											<p className="mt-1 text-sm text-[#615d59]">
												Bài viết bắt buộc có ít nhất một ảnh. Bạn vẫn có thể
												đính kèm thêm tài liệu an toàn để bổ sung nội dung.
											</p>
										</div>
										<span className="rounded-full border border-black/10 bg-white px-3 py-1 text-[11px] font-medium text-[#615d59]">
											{totalCount}/{MAX_ATTACHMENTS} tệp
										</span>
									</div>

									<input
										id="post-images"
										ref={imageInputRef}
										type="file"
										multiple
										accept={SAFE_IMAGE_ACCEPT}
										className="hidden"
										onChange={handleImageChange}
									/>
									<input
										id="post-attachments"
										ref={fileInputRef}
										type="file"
										multiple
										accept={SAFE_FILE_ACCEPT}
										className="hidden"
										onChange={handleDocumentChange}
									/>

									<div className="space-y-3">
										{existingImageAttachments.length > 0 && (
											<div className="space-y-2">
												<p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#615d59]">
													Ảnh hiện có
												</p>
												{existingImageAttachments.map((file) => (
													<div
														key={file.id}
														className="group flex items-center gap-3 rounded-[1rem] border border-black/10 bg-white px-4 py-3"
													>
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
														<div className="min-w-0 flex-1">
															<p className="truncate text-sm font-medium text-[#1f1c19]">
																Hình ảnh đã tải lên
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
														{selectedThumbnailKey ===
														buildThumbnailKeyForAttachment(file) ? (
															<span className="rounded-full border border-[#097fe8]/20 bg-[#f2f9ff] px-3 py-1 text-[11px] font-semibold text-[#097fe8]">
																Thumbnail hiện tại
															</span>
														) : null}
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

										{imageFiles.length > 0 && (
											<div className="space-y-2">
												<p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#615d59]">
													{existingImageAttachments.length > 0
														? "Ảnh mới"
														: "Ảnh đã chọn"}
												</p>
												{imageFiles.map((file) => (
													// Keep selected thumbnail visible even when multiple images are attached.
													<div
														key={buildThumbnailKeyForFile(file)}
														className="group flex items-center gap-3 rounded-[1rem] border border-[#097fe8]/15 bg-[#f8fbff] px-4 py-3"
													>
														<button
															type="button"
															className="relative h-12 w-12 shrink-0 cursor-pointer overflow-hidden rounded-xl"
															onClick={() =>
																setPreviewImg(
																	attachmentPreviewUrls[
																		buildThumbnailKeyForFile(file)
																	] ?? null,
																)
															}
														>
															<img
																src={
																	attachmentPreviewUrls[
																		buildThumbnailKeyForFile(file)
																	]
																}
																alt={file.name}
																className="h-full w-full object-cover"
															/>
														</button>
														<div className="min-w-0 flex-1">
															<p className="truncate text-sm font-medium text-[#1f1c19]">
																{file.name}
															</p>
															<p className="text-xs text-[#615d59]">
																{formatFileSize(file.size)}
															</p>
														</div>
														{canSelectThumbnail ? (
															<button
																type="button"
																className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
																	selectedThumbnailKey ===
																	buildThumbnailKeyForFile(file)
																		? "border-[#097fe8]/20 bg-white text-[#097fe8]"
																		: "border-[#097fe8]/10 bg-white text-[#615d59] hover:border-[#097fe8]/20 hover:text-[#097fe8]"
																}`}
																onClick={() =>
																	setSelectedThumbnailKey(
																		buildThumbnailKeyForFile(file),
																	)
																}
															>
																{selectedThumbnailKey ===
																buildThumbnailKeyForFile(file)
																	? "Đang là thumbnail"
																	: "Chọn làm thumbnail"}
															</button>
														) : (
															<span className="rounded-full border border-black/10 bg-white px-3 py-1 text-[11px] font-semibold text-[#615d59]">
																Ảnh bổ sung
															</span>
														)}
														<button
															type="button"
															className="rounded-full p-2 text-[#a39e98] transition-colors hover:bg-[#fff5ec] hover:text-[#dd5b00]"
															onClick={() =>
																removeNewAttachment(
																	buildThumbnailKeyForFile(file),
																)
															}
														>
															<Trash2 className="h-4 w-4" />
														</button>
													</div>
												))}
											</div>
										)}

										{existingFileAttachments.length > 0 && (
											<div className="space-y-2">
												<p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#615d59]">
													Tệp hiện có
												</p>
												{existingFileAttachments.map((file) => (
													<div
														key={file.id}
														className="group flex items-center gap-3 rounded-[1rem] border border-black/10 bg-white px-4 py-3"
													>
														<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-[#f6f5f4]">
															<FileText className="h-4 w-4 text-[#615d59]" />
														</div>
														<div className="min-w-0 flex-1">
															<p className="truncate text-sm font-medium text-[#1f1c19]">
																Tài liệu đã tải lên
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

										{documentFiles.length > 0 && (
											<div className="space-y-2">
												<p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#615d59]">
													Tệp mới
												</p>
												{documentFiles.map((file) => (
													<div
														key={buildThumbnailKeyForFile(file)}
														className="group flex items-center gap-3 rounded-[1rem] border border-[#097fe8]/15 bg-[#f8fbff] px-4 py-3"
													>
														<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#097fe8]/10 bg-white">
															<FileText className="h-4 w-4 text-[#097fe8]" />
														</div>
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
															onClick={() =>
																removeNewAttachment(
																	buildThumbnailKeyForFile(file),
																)
															}
														>
															<Trash2 className="h-4 w-4" />
														</button>
													</div>
												))}
											</div>
										)}

										{canAddMore && (
											<div className="grid gap-3 sm:grid-cols-2">
												<button
													type="button"
													className="flex w-full items-center justify-center gap-2 rounded-[1rem] border border-dashed border-[#097fe8]/30 bg-white px-4 py-4 text-sm font-medium text-[#097fe8] transition duration-200 hover:border-[#097fe8]/50 hover:bg-[#f8fbff]"
													onClick={() => imageInputRef.current?.click()}
												>
													<Paperclip className="h-4 w-4" />
													{totalImageCount === 0
														? "Tải ảnh bắt buộc"
														: "Thêm ảnh"}
												</button>
												<button
													type="button"
													className="flex w-full items-center justify-center gap-2 rounded-[1rem] border border-dashed border-black/15 bg-white px-4 py-4 text-sm font-medium text-[#615d59] transition duration-200 hover:border-[#097fe8]/40 hover:bg-[#f8fbff] hover:text-[#097fe8]"
													onClick={() => fileInputRef.current?.click()}
												>
													<FileText className="h-4 w-4" />
													Thêm tài liệu an toàn
												</button>
											</div>
										)}

										<div className="rounded-[1rem] border border-[#097fe8]/15 bg-[#f2f9ff] px-4 py-3 text-xs leading-5 text-[#615d59]">
											<p className="font-semibold text-[#1f1c19]">
												Quy tắc upload
											</p>
											<p className="mt-1">
												Bài viết phải có ít nhất 1 ảnh. Ảnh được hỗ trợ: JPG,
												JPEG, PNG, WEBP, GIF, AVIF. Tệp bổ sung chỉ chấp nhận
												các định dạng an toàn: PDF, TXT, DOC, DOCX, XLS, XLSX,
												PPT, PPTX.
											</p>
											{!canSelectThumbnail ? (
												<p className="mt-2">
													Bài viết này đã có ảnh cũ nên thumbnail hiện tại vẫn
													theo ảnh đầu tiên đang lưu. Nếu muốn đổi thumbnail,
													hãy xóa ảnh thumbnail cũ rồi tải lại ảnh mới.
												</p>
											) : null}
											{selectedNewThumbnailFile || selectedExistingThumbnail ? (
												<p className="mt-2">
													Thumbnail hiện chọn:{" "}
													<span className="font-semibold text-[#097fe8]">
														{selectedNewThumbnailFile?.name ??
															(selectedExistingThumbnail ? "Ảnh hiện có" : "")}
													</span>
												</p>
											) : null}
										</div>
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
