import { useState } from "react";
import { XCircle, Send, AlertCircle, Plus, Trash2, Check } from "lucide-react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/Card";
import { useUpdateQuestion, useRequestPublish } from "../queries/useQuestion";
import { QuestionType, type QuestionResponse } from "../types/question.type";
import { cn } from "@workspace/ui/lib/utils";
import { toast } from "@/shared/components/Sonner";

interface EditOption {
	label: string;
	content: string;
	isCorrect: boolean;
	orderNo: number;
}

interface EditFormState {
	content: string;
	canonicalAnswer: string;
	options: EditOption[];
}

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

export function EditAndResubmitModal({
	question,
	onClose,
	onSuccess,
}: {
	question: QuestionResponse;
	onClose: () => void;
	onSuccess: () => void;
}) {
	const [form, setForm] = useState<EditFormState>({
		content: question.content,
		canonicalAnswer: question.canonicalAnswer || "",
		options:
			question.questionType === QuestionType.MCQ && question.options
				? question.options.map((o, i) => ({
						label: o.label || OPTION_LABELS[i] || String(i + 1),
						content: o.content,
						isCorrect: o.isCorrect,
						orderNo: o.orderNo ?? i,
					}))
				: [],
	});

	const updateQuestion = useUpdateQuestion();
	const requestPublish = useRequestPublish();
	const isBusy = updateQuestion.isPending || requestPublish.isPending;

	const handleOptionChange = (
		index: number,
		field: keyof EditOption,
		value: string | boolean,
	) => {
		setForm((prev) => ({
			...prev,
			options: prev.options.map((o, i) =>
				i === index ? { ...o, [field]: value } : o,
			),
		}));
	};

	const handleSetCorrect = (index: number) => {
		setForm((prev) => ({
			...prev,
			options: prev.options.map((o, i) => ({ ...o, isCorrect: i === index })),
		}));
	};

	const handleAddOption = () => {
		if (form.options.length >= 6) return;
		setForm((prev) => ({
			...prev,
			options: [
				...prev.options,
				{
					label:
						OPTION_LABELS[prev.options.length] ||
						String(prev.options.length + 1),
					content: "",
					isCorrect: false,
					orderNo: prev.options.length,
				},
			],
		}));
	};

	const handleRemoveOption = (index: number) => {
		if (form.options.length <= 2) {
			toast.error({ title: "Lỗi", description: "Phải có ít nhất 2 đáp án!" });
			return;
		}
		setForm((prev) => ({
			...prev,
			options: prev.options
				.filter((_, i) => i !== index)
				.map((o, i) => ({
					...o,
					label: OPTION_LABELS[i] || String(i + 1),
					orderNo: i,
				})),
		}));
	};

	const validate = (): string | null => {
		if (!form.content.trim()) return "Vui lòng nhập nội dung câu hỏi";
		if (question.questionType === QuestionType.MCQ) {
			if (form.options.some((o) => !o.content.trim()))
				return "Vui lòng nhập đầy đủ nội dung các đáp án";
			if (!form.options.some((o) => o.isCorrect))
				return "Phải chọn ít nhất 1 đáp án đúng";
		}
		if (
			question.questionType === QuestionType.ESSAY &&
			!form.canonicalAnswer.trim()
		)
			return "Vui lòng nhập đáp án cho câu tự luận";
		return null;
	};

	const handleSubmit = async () => {
		const error = validate();
		if (error) {
			toast.error({ title: "Lỗi", description: error });
			return;
		}
		try {
			await updateQuestion.mutateAsync({
				id: question.id,
				data: {
					content: form.content,
					canonicalAnswer: form.canonicalAnswer || undefined,
					questionType: question.questionType,
					questionLevel: question.questionLevel,
					subjectId: question.subject?.id,
					lessonId: question.lesson?.id,
					options:
						question.questionType === QuestionType.MCQ
							? form.options.map((o) => ({
									label: o.label,
									content: o.content,
									isCorrect: o.isCorrect,
									orderNo: o.orderNo,
								}))
							: undefined,
				},
			});
			await requestPublish.mutateAsync({ questionIds: [question.id] });
			onSuccess();
			onClose();
		} catch {}
	};

	const inputCls =
		"w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none";
	const labelCls =
		"block text-md font-semibold text-slate-700 dark:text-slate-300 mb-1.5";

	return (
		<div
			className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
			onClick={onClose}
		>
			<Card
				className="max-w-4xl w-full max-h-[90vh] overflow-y-auto"
				onClick={(e) => e.stopPropagation()}
			>
				<CardHeader className="border-b border-slate-200">
					<div className="flex items-start justify-between gap-4">
						<div className="flex-1">
							<CardTitle className="text-xl mb-1">
								Sửa & Gửi lại phê duyệt
							</CardTitle>
							<p className="text-md text-slate-500">
								Chỉnh sửa nội dung câu hỏi rồi gửi lại yêu cầu phê duyệt.
							</p>
							{(question as any).rejectionReason && (
								<div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
									<AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
									<div>
										<p className="text-md font-semibold text-red-700">
											Lý do từ chối
										</p>
										<p className="text-md text-red-600 mt-0.5">
											{(question as any).rejectionReason}
										</p>
									</div>
								</div>
							)}
						</div>
						<button
							className="cursor-pointer p-2 text-slate-600 hover:text-red-600 transition-colors"
							onClick={onClose}
						>
							<XCircle className="w-6 h-6" />
						</button>
					</div>
				</CardHeader>

				<CardContent className="px-6 py-2 space-y-4">
					<div>
						<label className={labelCls}>
							Nội dung câu hỏi <span className="text-red-500">*</span>
						</label>
						<textarea
							rows={4}
							className={inputCls}
							placeholder="Nhập nội dung câu hỏi..."
							value={form.content}
							onChange={(e) =>
								setForm((prev) => ({ ...prev, content: e.target.value }))
							}
						/>
					</div>

					<div>
						<label className={labelCls}>
							Đáp án / Hướng dẫn giải
							{question.questionType === QuestionType.ESSAY && (
								<span className="text-red-500"> *</span>
							)}
						</label>
						<textarea
							rows={3}
							className={inputCls}
							placeholder="Nhập đáp án chi tiết hoặc hướng dẫn giải..."
							value={form.canonicalAnswer}
							onChange={(e) =>
								setForm((prev) => ({
									...prev,
									canonicalAnswer: e.target.value,
								}))
							}
						/>
					</div>

					{question.questionType === QuestionType.MCQ && (
						<div>
							<div className="flex items-center justify-between mb-3">
								<label className={labelCls + " mb-0"}>
									Các đáp án <span className="text-red-500">*</span>
								</label>
								<button
									type="button"
									onClick={handleAddOption}
									disabled={form.options.length >= 6}
									className="flex items-center gap-1.5 text-md text-blue-600 hover:text-blue-800 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
								>
									<Plus className="h-4 w-4" /> Thêm đáp án
								</button>
							</div>
							<div className="flex items-start gap-2 p-3 mb-3 rounded-lg bg-blue-50 border border-blue-200">
								<AlertCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
								<p className="text-md text-blue-800">
									Tick vào checkbox để chọn <strong>1 đáp án đúng</strong>.
								</p>
							</div>
							<div className="space-y-2.5">
								{form.options.map((option, index) => (
									<div
										key={index}
										className={cn(
											"flex items-center gap-3 px-4 py-3 rounded-lg border transition-all",
											option.isCorrect
												? "border-green-400 bg-green-50 dark:bg-green-900/20 dark:border-green-700"
												: "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900",
										)}
									>
										<input
											type="checkbox"
											checked={option.isCorrect}
											onChange={() => handleSetCorrect(index)}
											className="h-5 w-5 rounded border-slate-300 text-green-600 focus:ring-green-500 cursor-pointer shrink-0"
										/>
										<span
											className={cn(
												"text-md font-bold w-5 shrink-0",
												option.isCorrect ? "text-green-700" : "text-slate-500",
											)}
										>
											{option.label}
										</span>
										<input
											type="text"
											value={option.content}
											onChange={(e) =>
												handleOptionChange(index, "content", e.target.value)
											}
											placeholder={`Nhập nội dung đáp án ${option.label}...`}
											className={cn(
												"flex-1 px-3 py-2 rounded-md border text-base outline-none transition-all",
												option.isCorrect
													? "border-green-300 bg-green-50 dark:bg-green-900/10 focus:ring-2 focus:ring-green-400"
													: "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500",
											)}
										/>
										{option.isCorrect && (
											<span className="flex items-center gap-1 text-xs font-bold text-green-700 shrink-0">
												<Check className="h-3.5 w-3.5" /> Đúng
											</span>
										)}
										<button
											type="button"
											onClick={() => handleRemoveOption(index)}
											disabled={form.options.length <= 2}
											className="text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-1 shrink-0"
										>
											<Trash2 className="h-4 w-4" />
										</button>
									</div>
								))}
							</div>
						</div>
					)}

					<div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
						<button
							type="button"
							onClick={onClose}
							className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-md font-medium hover:bg-slate-50 transition-colors"
						>
							Hủy
						</button>
						<button
							type="button"
							onClick={handleSubmit}
							disabled={isBusy}
							className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-md font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-blue-500/20"
						>
							{isBusy ? (
								<>
									<span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
									Đang xử lý...
								</>
							) : (
								<>
									<Send className="h-4 w-4" />
									Lưu & Gửi lại phê duyệt
								</>
							)}
						</button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
