import type React from "react";
import { useEffect, useMemo, useState } from "react";
import {
	AlertCircle,
	BookOpen,
	CheckCircle2,
	Eye,
	ExternalLink,
	FileEdit,
	Layers3,
	Lightbulb,
	Loader2,
	PanelRightOpen,
	Sparkles,
	Wand2,
	X,
} from "lucide-react";
import { CurriculumChapterPicker } from "@/feature/matrix/components/CurriculumChapterPicker";
import { toast } from "@/shared/components/Sonner";
import { useGenerateSlide } from "../queries/useSlide";
import { useTemplates } from "../queries/useTemplate";
import type { SlideRequest } from "../types/slide.type";

type GenerateMode = "topic" | "lesson";

type FieldErrors = {
	lesson?: string;
	slideCount?: string;
	template?: string;
	topic?: string;
};

export const CreateSlideTabV2: React.FC = () => {
	const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
		null,
	);
	const [mode, setMode] = useState<GenerateMode>("topic");
	const [topic, setTopic] = useState("");
	const [curriculumId, setCurriculumId] = useState<number | null>(null);
	const [subjectId, setSubjectId] = useState<number | null>(null);
	const [chapterId, setChapterId] = useState<number | null>(null);
	const [lessonId, setLessonId] = useState<number | null>(null);
	const [lessonLabel, setLessonLabel] = useState<string | null>(null);
	const [slideCount, setSlideCount] = useState(10);
	const [includeExamples, setIncludeExamples] = useState(true);
	const [includeExercises, setIncludeExercises] = useState(false);
	const [showPreviewModal, setShowPreviewModal] = useState(false);
	const [previewTemplateId, setPreviewTemplateId] = useState<number | null>(
		null,
	);
	const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

	const { data: templatesData, isLoading: templatesLoading } = useTemplates();
	const generateSlide = useGenerateSlide();

	const templates = templatesData?.data || [];

	useEffect(() => {
		if (templates.length > 0 && !selectedTemplateId) {
			setSelectedTemplateId(templates[0]?.id ?? null);
		}
	}, [templates, selectedTemplateId]);

	const selectedTemplate = useMemo(
		() =>
			templates.find((template) => template.id === selectedTemplateId) ?? null,
		[templates, selectedTemplateId],
	);

	const currentTemplate =
		templates.find((template) => template.id === previewTemplateId) ?? null;

	const resetFieldError = (field: keyof FieldErrors) => {
		setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
	};

	const openPreviewModal = (templateId: number) => {
		setPreviewTemplateId(templateId);
		setShowPreviewModal(true);
	};

	const closePreviewModal = () => {
		setShowPreviewModal(false);
	};

	const handleModeChange = (nextMode: GenerateMode) => {
		setMode(nextMode);
		setFieldErrors({});

		if (nextMode === "topic") {
			setCurriculumId(null);
			setSubjectId(null);
			setChapterId(null);
			setLessonId(null);
			setLessonLabel(null);
			return;
		}

		setTopic("");
	};

	const validateForm = () => {
		const nextErrors: FieldErrors = {};

		if (mode === "topic" && !topic.trim()) {
			nextErrors.topic = "Vui lòng nhập chủ đề bài giảng.";
		}

		if (mode === "lesson" && !lessonId) {
			nextErrors.lesson = "Vui lòng chọn bài học trước khi tạo slide.";
		}

		if (!selectedTemplateId) {
			nextErrors.template = "Vui lòng chọn template trước khi tạo slide.";
		}

		if (slideCount < 1 || slideCount > 15) {
			nextErrors.slideCount = "Số lượng slide phải từ 1 đến 15.";
		}

		setFieldErrors(nextErrors);
		return Object.keys(nextErrors).length === 0;
	};

	const handleGenerate = () => {
		if (!validateForm()) {
			toast.error({
				title: "Thiếu thông tin",
				description: "Hãy hoàn thiện các trường bắt buộc trước khi tạo slide.",
			});
			return;
		}

		const sharedFields = {
			template_id: selectedTemplateId as number,
			slide_count: slideCount,
			include_examples: includeExamples,
			include_exercises: includeExercises,
		};
		const request: SlideRequest =
			mode === "topic"
				? { topic: topic.trim(), ...sharedFields }
				: {
						lesson_id: lessonId as number,
						name: lessonLabel ?? undefined,
						...sharedFields,
					};

		generateSlide.mutate(request);
	};

	if (templatesLoading) {
		return (
			<div className="flex items-center justify-center py-16">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<span className="ml-3 text-slate-600">Đang tải templates...</span>
			</div>
		);
	}

	return (
		<>
			<div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.7fr)_380px]">
				<div className="space-y-6">
					<section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
						<div className="border-b border-slate-100 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.12),_transparent_42%),linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-6 py-6 md:px-8">
							<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
								<div className="max-w-2xl">
									<div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
										<Sparkles size={14} />
										Studio tạo slide AI
									</div>
									<h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
										Tạo bộ slide rõ cấu trúc ngay từ một màn hình
									</h2>
								</div>
							</div>
						</div>

						<div className="space-y-8 px-6 py-6 md:px-8">
							<div className="flex flex-wrap gap-3">
								<button
									type="button"
									onClick={() => handleModeChange("topic")}
									className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
										mode === "topic"
											? "border-blue-600 bg-blue-50 text-blue-700"
											: "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700"
									}`}
								>
									Nhập chủ đề
								</button>
								<button
									type="button"
									onClick={() => handleModeChange("lesson")}
									className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
										mode === "lesson"
											? "border-blue-600 bg-blue-50 text-blue-700"
											: "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700"
									}`}
								>
									Chọn bài học
								</button>
							</div>

							{mode === "topic" ? (
								<div>
									<label
										htmlFor="slide-v2-topic-input"
										className="mb-2 block text-sm font-semibold text-slate-800"
									>
										Chủ đề bài giảng
									</label>
									<input
										id="slide-v2-topic-input"
										className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 text-slate-900 outline-none transition-all ${
											fieldErrors.topic
												? "border-red-300 ring-2 ring-red-100"
												: "border-slate-200 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
										} disabled:opacity-50`}
										placeholder="Ví dụ: Mảng một chiều trong Pascal, thuật toán sắp xếp..."
										type="text"
										value={topic}
										onChange={(event) => {
											setTopic(event.target.value);
											if (fieldErrors.topic) {
												resetFieldError("topic");
											}
										}}
										disabled={generateSlide.isPending}
									/>
									{fieldErrors.topic && (
										<p className="mt-2 text-sm text-red-600">
											{fieldErrors.topic}
										</p>
									)}
								</div>
							) : (
								<CurriculumChapterPicker
									curriculumId={curriculumId}
									subjectId={subjectId}
									chapterId={chapterId}
									lessonId={lessonId}
									onCurriculumChange={setCurriculumId}
									onSubjectChange={setSubjectId}
									onChapterChange={(value) => {
										setChapterId(value);
									}}
									onLessonLabelChange={setLessonLabel}
									onLessonChange={(value) => {
										setLessonId(value);
										if (fieldErrors.lesson) {
											resetFieldError("lesson");
										}
									}}
									error={fieldErrors.lesson}
									disabled={generateSlide.isPending}
								/>
							)}

							<div className="grid grid-cols-1 gap-4 rounded-3xl border border-slate-200 bg-slate-50/70 p-4 md:grid-cols-3 md:p-5">
								<div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
									<label
										htmlFor="slide-v2-count-input"
										className="mb-2 block text-sm font-semibold text-slate-800"
									>
										Số lượng slide
									</label>
									<input
										id="slide-v2-count-input"
										className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
										max="15"
										min="1"
										type="number"
										value={slideCount}
										onChange={(event) => {
											setSlideCount(Number(event.target.value));
											if (fieldErrors.slideCount) {
												resetFieldError("slideCount");
											}
										}}
										disabled={generateSlide.isPending}
									/>
									{fieldErrors.slideCount && (
										<p className="mt-2 text-sm text-red-600">
											{fieldErrors.slideCount}
										</p>
									)}
								</div>

								<label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
									<div className="pr-3">
										<div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
											<Lightbulb className="text-amber-500" size={18} />
											Thêm ví dụ minh họa
										</div>
										<p className="mt-1 text-sm text-slate-500">
											Phù hợp khi muốn bài giảng dễ đọc hơn với học sinh.
										</p>
									</div>
									<input
										checked={includeExamples}
										className="h-5 w-5 accent-blue-600"
										type="checkbox"
										onChange={(event) =>
											setIncludeExamples(event.target.checked)
										}
										disabled={generateSlide.isPending}
									/>
								</label>

								<label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
									<div className="pr-3">
										<div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
											<FileEdit className="text-emerald-600" size={18} />
											Thêm bài tập
										</div>
										<p className="mt-1 text-sm text-slate-500">
											Hữu ích cho phần luyện tập hoặc slide cuối tiết.
										</p>
									</div>
									<input
										checked={includeExercises}
										className="h-5 w-5 accent-blue-600"
										type="checkbox"
										onChange={(event) =>
											setIncludeExercises(event.target.checked)
										}
										disabled={generateSlide.isPending}
									/>
								</label>
							</div>

							<div>
								<div className="mb-3 flex items-center justify-between gap-3">
									<div>
										<div className="block text-sm font-semibold text-slate-800">
											Chọn template trình bày
										</div>
										<p className="mt-1 text-sm text-slate-500">
											Template sẽ quyết định nhịp trình bày và cảm giác thị
											giác.
										</p>
									</div>
									<div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">
										<PanelRightOpen size={14} />
										{templates.length} mẫu sẵn sàng
									</div>
								</div>

								{fieldErrors.template && (
									<p className="mb-3 text-sm text-red-600">
										{fieldErrors.template}
									</p>
								)}

								<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
									{templates.map((template) => {
										const isSelected = selectedTemplateId === template.id;

										return (
											<button
												key={template.id}
												type="button"
												onClick={() => {
													setSelectedTemplateId(template.id);
													if (fieldErrors.template) {
														resetFieldError("template");
													}
												}}
												disabled={generateSlide.isPending}
												className={`group relative overflow-hidden rounded-3xl border text-left transition-all ${
													isSelected
														? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10"
														: "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
												} disabled:opacity-60`}
											>
												<div className="relative h-40 overflow-hidden">
													{template.thumbnailUrl ? (
														<img
															src={template.thumbnailUrl}
															alt={template.name}
															className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
														/>
													) : (
														<div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#2563eb,#0f172a)]">
															<div className="space-y-2 text-center text-white/90">
																<Layers3 className="mx-auto" size={26} />
																<p className="text-sm font-medium">
																	Template preview
																</p>
															</div>
														</div>
													)}

													<div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/75 to-transparent" />

													<div className="absolute right-3 top-3 flex items-center gap-2">
														<span
															className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
																isSelected
																	? "bg-blue-600 text-white"
																	: "bg-white/90 text-slate-700"
															}`}
														>
															<CheckCircle2 size={13} />
															{isSelected ? "Đang chọn" : "Chọn mẫu"}
														</span>
													</div>

													<button
														className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/92 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-white"
														onClick={(event) => {
															event.stopPropagation();
															openPreviewModal(template.id);
														}}
														type="button"
													>
														<Eye size={14} />
														Xem trước
													</button>
												</div>

												<div className="space-y-2 p-4">
													<h4 className="text-base font-semibold text-slate-900">
														{template.name}
													</h4>
													<p className="line-clamp-2 text-sm text-slate-500">
														{template.description ||
															"Mẫu trình bày dành cho bài giảng có cấu trúc rõ ràng."}
													</p>
												</div>
											</button>
										);
									})}
								</div>
							</div>
						</div>
					</section>
				</div>

				<aside className="space-y-6">
					<section className="sticky top-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
						<div className="border-b border-slate-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-6 py-5">
							<div className="flex items-center gap-3">
								<div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
									<Wand2 size={20} />
								</div>
								<div>
									<h3 className="text-lg font-semibold text-slate-900">
										Bản tóm tắt đầu ra
									</h3>
									<p className="text-sm text-slate-500">
										Kiểm tra nhanh cấu hình trước khi generate.
									</p>
								</div>
							</div>
						</div>

						<div className="space-y-5 px-6 py-6">
							<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
								<p className="text-xs uppercase tracking-[0.18em] text-slate-400">
									Nguồn nội dung
								</p>
								<p className="mt-2 text-base font-semibold text-slate-900">
									{mode === "topic"
										? topic.trim() || "Chưa nhập chủ đề"
										: lessonLabel
											? lessonLabel
											: "Chưa chọn bài học"}
								</p>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div className="rounded-2xl border border-slate-200 p-4">
									<p className="text-xs uppercase tracking-[0.18em] text-slate-400">
										Mode
									</p>
									<p className="mt-2 text-lg font-semibold text-slate-900">
										{mode === "topic" ? "Topic" : "Lesson"}
									</p>
								</div>
								<div className="rounded-2xl border border-slate-200 p-4">
									<p className="text-xs uppercase tracking-[0.18em] text-slate-400">
										Số slide
									</p>
									<p className="mt-2 text-lg font-semibold text-slate-900">
										{slideCount}
									</p>
								</div>
							</div>

							<div className="rounded-2xl border border-slate-200 p-4">
								<p className="text-xs uppercase tracking-[0.18em] text-slate-400">
									Template đã chọn
								</p>
								<p className="mt-2 text-base font-semibold text-slate-900">
									{selectedTemplate?.name || "Chưa chọn template"}
								</p>
								<p className="mt-1 text-sm text-slate-500">
									{selectedTemplate?.description ||
										"Template sẽ quyết định nhịp trình bày và cảm giác thị giác của bộ slide."}
								</p>
							</div>

							<div className="rounded-2xl border border-slate-200 p-4">
								<p className="text-xs uppercase tracking-[0.18em] text-slate-400">
									Thành phần nội dung
								</p>
								<div className="mt-3 space-y-2 text-sm">
									<div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
										<span className="text-slate-600">Ví dụ minh họa</span>
										<span
											className={
												includeExamples
													? "font-semibold text-emerald-600"
													: "text-slate-400"
											}
										>
											{includeExamples ? "Có" : "Không"}
										</span>
									</div>
									<div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
										<span className="text-slate-600">Bài tập</span>
										<span
											className={
												includeExercises
													? "font-semibold text-emerald-600"
													: "text-slate-400"
											}
										>
											{includeExercises ? "Có" : "Không"}
										</span>
									</div>
								</div>
							</div>

							<div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
								<div className="flex items-start gap-3">
									<BookOpen className="mt-0.5 text-blue-600" size={18} />
									<div>
										<p className="text-sm font-semibold text-blue-900">
											Gợi ý để ra slide tốt hơn
										</p>
										<p className="mt-1 text-sm leading-6 text-blue-800/80">
											Với chủ đề, nên ghi chủ đề đủ cụ thể. Với bài học, hãy
											chọn đúng bài từ chương trình thay vì nhập tay.
										</p>
									</div>
								</div>
							</div>

							<button
								type="button"
								className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
								onClick={handleGenerate}
								disabled={
									generateSlide.isPending ||
									(mode === "topic" ? !topic.trim() : !lessonId)
								}
							>
								{generateSlide.isPending ? (
									<>
										<Loader2 className="h-5 w-5 animate-spin" />
										AI đang xây dựng bộ slide...
									</>
								) : (
									<>
										<Sparkles className="h-5 w-5" />
										Tạo slide với AI
									</>
								)}
							</button>
						</div>
					</section>
				</aside>
			</div>

			{showPreviewModal && currentTemplate && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md md:p-6">
					<div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-200/20 bg-white shadow-2xl">
						<div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
							<div className="flex items-center gap-3">
								<span className="rounded-2xl bg-blue-50 p-2 text-blue-600">
									<Eye size={20} />
								</span>
								<div>
									<h2 className="text-base font-bold text-slate-900">
										{currentTemplate.name}
									</h2>
									{currentTemplate.description && (
										<p className="mt-0.5 text-sm text-slate-500">
											{currentTemplate.description}
										</p>
									)}
								</div>
							</div>
							<button
								type="button"
								className="group flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-all hover:bg-slate-100"
								onClick={closePreviewModal}
							>
								<X
									className="transition-transform group-hover:rotate-90"
									size={18}
								/>
							</button>
						</div>

						<div className="flex-1 overflow-hidden">
							{currentTemplate.previewPdfUrl ? (
								<iframe
									src={currentTemplate.previewPdfUrl}
									title={`Preview - ${currentTemplate.name}`}
									className="h-full w-full border-0"
								/>
							) : (
								<div className="flex h-full w-full flex-col items-center justify-center gap-3 text-slate-400">
									<AlertCircle size={40} className="opacity-40" />
									<p className="text-base">
										Không có file xem trước cho template này.
									</p>
								</div>
							)}
						</div>

						<div className="flex shrink-0 items-center justify-between border-t border-slate-100 px-6 py-4">
							<a
								href={currentTemplate.previewPdfUrl || currentTemplate.url}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-blue-600"
							>
								<ExternalLink size={15} />
								Mở trong tab mới
							</a>
							<div className="flex gap-3">
								<button
									type="button"
									className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50"
									onClick={closePreviewModal}
								>
									Đóng
								</button>
								<button
									type="button"
									className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700"
									onClick={() => {
										setSelectedTemplateId(previewTemplateId);
										resetFieldError("template");
										closePreviewModal();
									}}
								>
									<CheckCircle2 size={18} />
									Chọn template này
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
};
