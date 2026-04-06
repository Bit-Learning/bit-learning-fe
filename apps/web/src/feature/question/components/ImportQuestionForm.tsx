import { useState, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
	ArrowLeft,
	Download,
	Upload,
	FileText,
	CheckCircle,
	AlertCircle,
	FileSpreadsheet,
	Info,
	Eye,
	Edit2,
	Trash2,
	X,
	Save,
	AlertTriangle,
	RefreshCw,
} from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/Card";
import { Progress } from "@workspace/ui/components/Progress";
import { toast } from "@/shared/components/Sonner";
import {
	usePreviewImport,
	useUpdatePreviewQuestion,
	useDeletePreviewQuestion,
	useConfirmImport,
	useImportJobStatus,
} from "../queries/useImportJob";
import type {
	PreviewQuestionResponse,
	PreviewQuestionStatus,
} from "../types/import.type";

type ImportStep = "upload" | "preview" | "processing" | "completed";

const ImportQuestionForm: React.FC = () => {
	const navigate = useNavigate();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const previewImport = usePreviewImport();
	const updatePreviewQuestion = useUpdatePreviewQuestion();
	const deletePreviewQuestion = useDeletePreviewQuestion();
	const confirmImport = useConfirmImport();

	const [currentStep, setCurrentStep] = useState<ImportStep>("upload");
	const [uploadedFile, setUploadedFile] = useState<File | null>(null);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [importJobId, setImportJobId] = useState<number | null>(null);
	const [previewData, setPreviewData] = useState<{
		totalQuestions: number;
		duplicatedCount: number;
		errorCount: number;
		hasErrors: boolean;
		questions: PreviewQuestionResponse[];
	} | null>(null);
	const [editingQuestionId, setEditingQuestionId] = useState<number | null>(
		null,
	);
	const [editContent, setEditContent] = useState("");

	const { data: jobStatus } = useImportJobStatus(importJobId, {
		enabled: currentStep === "processing" && !!importJobId,
	});

	useEffect(() => {
		if (jobStatus) {
			if (jobStatus.status === "DONE") {
				setCurrentStep("completed");
				toast.success({
					title: "Hoàn thành",
					description: `Đã import thành công ${jobStatus.importedQuestions}/${jobStatus.totalQuestions} câu hỏi`,
				});
			} else if (jobStatus.status === "FAILED") {
				setCurrentStep("preview");
				toast.error({
					title: "Lỗi",
					description: jobStatus.errorMessage || "Import thất bại",
				});
			}
		}
	}, [jobStatus]);

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			if (file.size > 10 * 1024 * 1024) {
				toast.error({
					title: "Lỗi",
					description: "Kích thước file tối đa 10MB",
				});
				return;
			}
			setUploadedFile(file);
			setUploadProgress(0);
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		const file = e.dataTransfer.files?.[0];
		if (file && (file.name.endsWith(".docx") || file.name.endsWith(".doc"))) {
			if (file.size > 10 * 1024 * 1024) {
				toast.error({
					title: "Lỗi",
					description: "Kích thước file tối đa 10MB",
				});
				return;
			}
			setUploadedFile(file);
			setUploadProgress(0);
		} else {
			toast.error({
				title: "Lỗi",
				description: "Chỉ hỗ trợ file .docx và .doc",
			});
		}
	};

	const handleUploadAndPreview = async () => {
		if (!uploadedFile) return;

		setUploadProgress(0);
		const interval = setInterval(() => {
			setUploadProgress((prev) => {
				if (prev >= 90) {
					clearInterval(interval);
					return 90;
				}
				return prev + 10;
			});
		}, 200);

		try {
			const response = await previewImport.mutateAsync(uploadedFile);

			clearInterval(interval);
			setUploadProgress(100);

			setImportJobId(response.data.data?.importJobId!);
			setPreviewData({
				totalQuestions: response.data.data?.totalQuestions!,
				duplicatedCount: response.data.data?.duplicatedCount!,
				errorCount: response.data.data?.errorCount!,
				hasErrors: response.data.data?.hasErrors!,
				questions: response.data.data?.questions!,
			});
			setCurrentStep("preview");

			if (response.data.data?.hasErrors) {
				toast.warning({
					title: "Cảnh báo",
					description: `Có ${response.data.data?.errorCount} câu hỏi lỗi. Vui lòng kiểm tra và sửa trước khi import.`,
				});
			}
		} catch (error) {
			clearInterval(interval);
			setUploadProgress(0);
		}
	};

	const handleEditQuestion = async (questionId: number) => {
		if (!editContent.trim()) return;

		try {
			await updatePreviewQuestion.mutateAsync({
				questionId,
				data: {
					editedContent: editContent,
					status: "KEEP" as PreviewQuestionStatus,
				},
			});

			setPreviewData((prev) => {
				if (!prev) return prev;
				return {
					...prev,
					questions: prev.questions.map((q) =>
						q.id === questionId
							? {
									...q,
									editedContent: editContent,
									status: "KEEP" as PreviewQuestionStatus,
								}
							: q,
					),
				};
			});

			setEditingQuestionId(null);
			setEditContent("");
			toast.success({
				title: "Đã lưu",
				description: "Câu hỏi đã được chỉnh sửa",
			});
		} catch (error) {
			// Error handled by hook
		}
	};

	const handleToggleQuestionStatus = async (
		questionId: number,
		currentStatus: PreviewQuestionStatus,
	) => {
		const newStatus = currentStatus === "KEEP" ? "DELETE" : "KEEP";

		try {
			await updatePreviewQuestion.mutateAsync({
				questionId,
				data: {
					status: newStatus as PreviewQuestionStatus,
				},
			});

			setPreviewData((prev) => {
				if (!prev) return prev;
				return {
					...prev,
					questions: prev.questions.map((q) =>
						q.id === questionId
							? { ...q, status: newStatus as PreviewQuestionStatus }
							: q,
					),
				};
			});
		} catch (error) {
			// Error handled by hook
		}
	};

	const handleDeleteQuestion = async (questionId: number) => {
		try {
			await deletePreviewQuestion.mutateAsync(questionId);

			setPreviewData((prev) => {
				if (!prev) return prev;
				return {
					...prev,
					questions: prev.questions.map((q) =>
						q.id === questionId
							? { ...q, status: "DELETE" as PreviewQuestionStatus }
							: q,
					),
				};
			});

			toast.success({
				title: "Đã xóa",
				description: "Câu hỏi sẽ không được import",
			});
		} catch (error) {
			// Error handled by hook
		}
	};

	const handleConfirmImport = async () => {
		if (!importJobId) return;

		const keepQuestions =
			previewData?.questions.filter((q) => q.status === "KEEP") || [];
		const errorQuestions = keepQuestions.filter((q) => q.hasError);

		if (errorQuestions.length > 0) {
			toast.error({
				title: "Không thể import",
				description: `Còn ${errorQuestions.length} câu hỏi lỗi. Vui lòng sửa hoặc xóa các câu hỏi lỗi trước khi import.`,
			});
			return;
		}

		if (keepQuestions.length === 0) {
			toast.error({
				title: "Không thể import",
				description: "Không có câu hỏi nào được chọn để import",
			});
			return;
		}

		try {
			setCurrentStep("processing");

			await confirmImport.mutateAsync({ importJobId });

			toast.info({
				title: "Đang xử lý",
				description: "Hệ thống đang import câu hỏi vào database...",
			});
		} catch (error) {
			setCurrentStep("preview");
		}
	};

	const handleReset = () => {
		setUploadedFile(null);
		setUploadProgress(0);
		setImportJobId(null);
		setPreviewData(null);
		setCurrentStep("upload");
		setEditingQuestionId(null);
		setEditContent("");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleDownloadTemplate = () => {
		toast.info({
			title: "Tính năng đang phát triển",
			description: "Template sẽ sớm có sẵn để tải xuống",
		});
	};

	const getKeepCount = () =>
		previewData?.questions.filter((q) => q.status === "KEEP").length || 0;
	const getDeleteCount = () =>
		previewData?.questions.filter((q) => q.status === "DELETE").length || 0;
	const getErrorKeepCount = () =>
		previewData?.questions.filter((q) => q.status === "KEEP" && q.hasError)
			.length || 0;

	const renderUploadStep = () => (
		<>
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-lg font-semibold">Upload file</h2>
							<p className="text-sm text-muted-foreground mt-1">
								Chọn file Word chứa ngân hàng câu hỏi
							</p>
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={handleDownloadTemplate}
							className="gap-2"
						>
							<Download className="h-4 w-4" />
							Tải mẫu
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div
						className="relative rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary transition-colors cursor-pointer p-8"
						onClick={() => fileInputRef.current?.click()}
						onDragOver={handleDragOver}
						onDrop={handleDrop}
					>
						<input
							ref={fileInputRef}
							type="file"
							accept=".docx,.doc"
							onChange={handleFileSelect}
							className="hidden"
						/>

						{!uploadedFile ? (
							<div className="text-center">
								<div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
									<FileSpreadsheet className="h-6 w-6 text-primary" />
								</div>
								<p className="font-medium mb-2">
									Click để chọn file hoặc kéo thả vào đây
								</p>
								<p className="text-sm text-muted-foreground">
									Hỗ trợ: .docx, .doc (Tối đa 10MB)
								</p>
							</div>
						) : (
							<div className="text-center">
								<div className="mx-auto w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
									<FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
								</div>
								<p className="font-medium mb-1">{uploadedFile.name}</p>
								<p className="text-sm text-muted-foreground">
									{(uploadedFile.size / 1024).toFixed(2)} KB
								</p>
							</div>
						)}
					</div>

					{previewImport.isPending && (
						<div className="mt-4 space-y-2">
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">
									Đang xử lý file...
								</span>
								<span className="font-medium">{uploadProgress}%</span>
							</div>
							<Progress value={uploadProgress} className="h-2" />
						</div>
					)}

					{previewImport.isError && (
						<div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
							<AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
							<div>
								<p className="text-sm font-medium text-red-800 dark:text-red-200">
									Có lỗi xảy ra khi xử lý file
								</p>
								<p className="text-sm text-red-700 dark:text-red-300 mt-1">
									Vui lòng kiểm tra định dạng file và thử lại
								</p>
							</div>
						</div>
					)}

					<div className="flex gap-2 mt-6">
						<Button
							onClick={handleUploadAndPreview}
							isDisabled={!uploadedFile || previewImport.isPending}
							className="gap-2 flex-1"
						>
							<Eye className="h-4 w-4" />
							{previewImport.isPending ? "Đang xử lý..." : "Xem trước"}
						</Button>
						{uploadedFile && !previewImport.isPending && (
							<Button variant="outline" onClick={handleReset}>
								Chọn file khác
							</Button>
						)}
					</div>
				</CardContent>
			</Card>
		</>
	);

	const renderPreviewStep = () => (
		<>
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-lg font-semibold">Xem trước câu hỏi</h2>
							<div className="flex items-center gap-4 mt-2 text-sm">
								<div className="flex items-center gap-1">
									<span className="text-muted-foreground">Tổng:</span>
									<span className="font-semibold">
										{previewData?.totalQuestions}
									</span>
								</div>
								<div className="flex items-center gap-1">
									<span className="text-muted-foreground">Giữ lại:</span>
									<span className="font-semibold text-green-600">
										{getKeepCount()}
									</span>
								</div>
								<div className="flex items-center gap-1">
									<span className="text-muted-foreground">Xóa:</span>
									<span className="font-semibold text-red-600">
										{getDeleteCount()}
									</span>
								</div>
								{previewData?.duplicatedCount! > 0 && (
									<div className="flex items-center gap-1">
										<span className="text-muted-foreground">Trùng:</span>
										<span className="font-semibold text-yellow-600">
											{previewData?.duplicatedCount}
										</span>
									</div>
								)}
								{previewData?.errorCount! > 0 && (
									<div className="flex items-center gap-1">
										<AlertTriangle className="h-4 w-4 text-red-600" />
										<span className="text-muted-foreground">Lỗi:</span>
										<span className="font-semibold text-red-600">
											{getErrorKeepCount()}
										</span>
									</div>
								)}
							</div>
						</div>
						<Button variant="outline" size="sm" onClick={handleReset}>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Chọn file khác
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{previewData?.hasErrors && getErrorKeepCount() > 0 && (
						<div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
							<AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
							<div>
								<p className="text-sm font-medium text-red-800 dark:text-red-200">
									Có {getErrorKeepCount()} câu hỏi lỗi
								</p>
								<p className="text-sm text-red-700 dark:text-red-300 mt-1">
									Vui lòng sửa hoặc xóa các câu hỏi có lỗi trước khi import
								</p>
							</div>
						</div>
					)}

					<div className="space-y-3 max-h-150 overflow-y-auto pr-2">
						{previewData?.questions.map((question, index) => (
							<div
								key={question.id}
								className={`p-4 rounded-lg border transition-all ${
									question.status === "DELETE"
										? "bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 opacity-60"
										: question.hasError
											? "bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700"
											: question.reused
												? "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-300 dark:border-yellow-700"
												: question.duplicated
													? "bg-orange-50 dark:bg-orange-950/30 border-orange-300 dark:border-orange-700"
													: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
								}`}
							>
								<div className="flex items-start justify-between mb-3">
									<div className="flex items-center gap-2 flex-wrap">
										<span className="text-xs font-medium text-muted-foreground">
											#{index + 1}
										</span>
										<span
											className={`px-2 py-0.5 rounded text-xs font-medium ${
												question.questionType === "MCQ"
													? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
													: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
											}`}
										>
											{question.questionType}
										</span>
										<span
											className={`px-2 py-0.5 rounded text-xs font-medium ${
												question.questionLevel === "EASY"
													? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
													: question.questionLevel === "MEDIUM"
														? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
														: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
											}`}
										>
											{question.questionLevel}
										</span>
										{question.reused && (
											<span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
												Tái sử dụng
											</span>
										)}
										{question.duplicated && !question.reused && (
											<span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
												Trùng lặp
											</span>
										)}
										{question.hasError && (
											<span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 flex items-center gap-1">
												<AlertTriangle className="h-3 w-3" />
												Lỗi
											</span>
										)}
										{question.status === "DELETE" && (
											<span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
												Đã xóa
											</span>
										)}
									</div>
									<div className="flex items-center gap-1">
										{editingQuestionId !== question.id &&
											question.status !== "DELETE" && (
												<>
													<Button
														size="sm"
														variant="ghost"
														onClick={() => {
															setEditingQuestionId(question.id);
															setEditContent(
																question.editedContent ||
																	question.originalContent,
															);
														}}
														className="h-8 w-8 p-0"
													>
														<Edit2 className="h-4 w-4" />
													</Button>
													<Button
														size="sm"
														variant="ghost"
														onClick={() => handleDeleteQuestion(question.id)}
														className="h-8 w-8 p-0"
													>
														<Trash2 className="h-4 w-4 text-red-600" />
													</Button>
												</>
											)}
										{question.status === "DELETE" && (
											<Button
												size="sm"
												variant="ghost"
												onClick={() =>
													handleToggleQuestionStatus(
														question.id,
														question.status,
													)
												}
												className="h-8 w-8 p-0"
											>
												<RefreshCw className="h-4 w-4 text-green-600" />
											</Button>
										)}
									</div>
								</div>

								{question.hasError && question.errorMessage && (
									<div className="mb-3 flex items-start gap-2 p-2 rounded bg-red-100 dark:bg-red-900/30">
										<AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
										<p className="text-xs text-red-800 dark:text-red-200">
											{question.errorMessage}
										</p>
									</div>
								)}

								<div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
									<span>{question.subjectCode}</span>
									<span>•</span>
									<span>Lớp {question.classLevel}</span>
									<span>•</span>
									<span>{question.curriculumCode}</span>
									<span>•</span>
									<span>{question.lessonCode}</span>
								</div>

								{editingQuestionId === question.id ? (
									<div className="space-y-3">
										<textarea
											value={editContent}
											onChange={(e) => setEditContent(e.target.value)}
											className="w-full p-3 border rounded-lg min-h-30 bg-white dark:bg-gray-800 text-sm font-mono"
											placeholder="Nội dung câu hỏi..."
										/>
										<div className="flex gap-2">
											<Button
												size="sm"
												onClick={() => handleEditQuestion(question.id)}
												isDisabled={updatePreviewQuestion.isPending}
												className="gap-1"
											>
												<Save className="h-3 w-3" />
												Lưu
											</Button>
											<Button
												size="sm"
												variant="outline"
												onClick={() => {
													setEditingQuestionId(null);
													setEditContent("");
												}}
												className="gap-1"
											>
												<X className="h-3 w-3" />
												Hủy
											</Button>
										</div>
									</div>
								) : (
									<>
										<div className="prose prose-sm dark:prose-invert max-w-none">
											<p className="text-md text-black mb-3">
												{question.editedContent || question.originalContent}
											</p>
										</div>

										{question.questionType === "MCQ" &&
											question.options &&
											question.options.length > 0 && (
												<div className="mt-3 space-y-1.5">
													{question.options.map((option, idx) => (
														<div
															key={idx}
															className={`flex items-start gap-2 p-2 rounded text-xs ${
																option.isCorrect
																	? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
																	: "bg-gray-50 dark:bg-gray-800/50"
															}`}
														>
															<span className="font-semibold shrink-0">
																{option.label || String.fromCharCode(65 + idx)}.
															</span>
															<span className="flex-1">{option.content}</span>
															{option.isCorrect && (
																<CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400 shrink-0" />
															)}
														</div>
													))}
												</div>
											)}

										{question.questionType === "ESSAY" &&
											question.canonicalAnswer && (
												<div className="mt-3 p-3 rounded bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
													<p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1.5">
														Đáp án:
													</p>
													<p className="text-xs text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
														{question.canonicalAnswer}
													</p>
												</div>
											)}
									</>
								)}
							</div>
						))}
					</div>

					<div className="flex gap-2 mt-6">
						<Button
							onClick={handleConfirmImport}
							isDisabled={
								confirmImport.isPending ||
								getKeepCount() === 0 ||
								getErrorKeepCount() > 0
							}
							className="gap-2 flex-1"
						>
							<Upload className="h-4 w-4" />
							{confirmImport.isPending
								? "Đang xác nhận..."
								: `Xác nhận import (${getKeepCount()} câu hỏi)`}
						</Button>
						<Button variant="outline" onClick={handleReset}>
							Hủy
						</Button>
					</div>
				</CardContent>
			</Card>
		</>
	);

	const renderProcessingStep = () => (
		<Card>
			<CardContent className="pt-6">
				<div className="text-center py-12">
					<div className="mx-auto w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4 animate-pulse">
						<Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
					</div>
					<h3 className="text-lg font-semibold mb-2">Đang xử lý import...</h3>
					<p className="text-sm text-muted-foreground mb-4">
						Hệ thống đang import câu hỏi vào database. Vui lòng đợi...
					</p>
					{jobStatus && (
						<div className="max-w-md mx-auto space-y-2">
							<div className="flex justify-between text-sm">
								<span>Đã import:</span>
								<span className="font-semibold">
									{jobStatus.importedQuestions}/{jobStatus.totalQuestions}
								</span>
							</div>
							{jobStatus.failedQuestions > 0 && (
								<div className="flex justify-between text-sm text-red-600">
									<span>Lỗi:</span>
									<span className="font-semibold">
										{jobStatus.failedQuestions}
									</span>
								</div>
							)}
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);

	const renderCompletedStep = () => (
		<Card className="border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30">
			<CardContent className="pt-6">
				<div className="flex items-start gap-3">
					<div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
						<CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
					</div>
					<div className="flex-1">
						<h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
							Import thành công!
						</h3>
						<p className="text-sm text-green-800 dark:text-green-200 mb-4">
							{jobStatus
								? `Đã import thành công ${jobStatus.importedQuestions}/${jobStatus.totalQuestions} câu hỏi vào hệ thống.`
								: "Ngân hàng câu hỏi đã được nhập vào hệ thống."}
						</p>
						{jobStatus && jobStatus.failedQuestions > 0 && (
							<p className="text-sm text-red-600 dark:text-red-400 mb-4">
								Có {jobStatus.failedQuestions} câu hỏi import thất bại.
							</p>
						)}
						<div className="flex gap-2">
							<Button
								size="sm"
								onClick={() => navigate({ to: "/mentor/question/my" })}
							>
								Xem danh sách câu hỏi
							</Button>
							<Button size="sm" variant="outline" onClick={handleReset}>
								Import thêm file
							</Button>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);

	return (
		<div className="mx-auto p-6 min-h-screen bg-white dark:bg-slate-950">
			<div className="mb-6">
				<Button
					variant="outline"
					size="lg"
					className="gap-2 border-gray-300 bg-white shadow-sm transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
					onClick={() => navigate({ to: "/mentor/question/my" })}
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Quay lại
				</Button>
				<h1 className="text-3xl font-bold mt-4">Import ngân hàng câu hỏi</h1>
				<p className="text-muted-foreground mt-1">
					Nhập câu hỏi từ file Word (.docx) với định dạng chuẩn
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2 space-y-6">
					{currentStep === "upload" && renderUploadStep()}
					{currentStep === "preview" && renderPreviewStep()}
					{currentStep === "processing" && renderProcessingStep()}
					{currentStep === "completed" && renderCompletedStep()}
				</div>

				<div className="space-y-6">
					<Card>
						<CardHeader>
							<div className="flex items-center gap-2">
								<Info className="h-5 w-5 text-primary" />
								<h2 className="text-lg font-semibold">Hướng dẫn</h2>
							</div>
						</CardHeader>
						<CardContent className="space-y-3 text-sm">
							<div className="flex items-start gap-2">
								<div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
									<span className="text-xs font-semibold text-primary">1</span>
								</div>
								<p className="text-muted-foreground">
									Tải file mẫu Word để xem định dạng yêu cầu
								</p>
							</div>
							<div className="flex items-start gap-2">
								<div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
									<span className="text-xs font-semibold text-primary">2</span>
								</div>
								<p className="text-muted-foreground">
									Upload file và xem trước danh sách câu hỏi
								</p>
							</div>
							<div className="flex items-start gap-2">
								<div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
									<span className="text-xs font-semibold text-primary">3</span>
								</div>
								<p className="text-muted-foreground">
									Chỉnh sửa hoặc xóa các câu hỏi không mong muốn
								</p>
							</div>
							<div className="flex items-start gap-2">
								<div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
									<span className="text-xs font-semibold text-primary">4</span>
								</div>
								<p className="text-muted-foreground">
									Xác nhận và hệ thống sẽ tự động import
								</p>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<div className="flex items-center gap-2">
								<AlertCircle className="h-5 w-5 text-amber-600" />
								<h2 className="text-lg font-semibold">Lưu ý</h2>
							</div>
						</CardHeader>
						<CardContent className="space-y-2 text-sm text-muted-foreground">
							<p>• File phải theo đúng định dạng mẫu Word</p>
							<p>• Type: MCQ (trắc nghiệm) hoặc ESSAY (tự luận)</p>
							<p>• Level: EASY, MEDIUM, hoặc HARD</p>
							<p>• SubjectCode, LessonCode phải tồn tại</p>
							<p>• Kích thước file tối đa: 10MB</p>
							<p>• Câu hỏi trùng lặp sẽ được tái sử dụng</p>
							<p>• Câu hỏi có lỗi phải được sửa hoặc xóa</p>
						</CardContent>
					</Card>

					{currentStep === "preview" && previewData && (
						<Card>
							<CardHeader>
								<div className="flex items-center gap-2">
									<AlertTriangle className="h-5 w-5 text-blue-600" />
									<h2 className="text-lg font-semibold">Chú thích</h2>
								</div>
							</CardHeader>
							<CardContent className="space-y-2 text-xs">
								<div className="flex items-center gap-2">
									<div className="w-3 h-3 rounded bg-yellow-200 dark:bg-yellow-800"></div>
									<span>
										Tái sử dụng: Câu hỏi đã tồn tại, sẽ thêm vào câu hỏi của bạn
									</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-3 h-3 rounded bg-orange-200 dark:bg-orange-800"></div>
									<span>Trùng lặp: Phát hiện nội dung tương tự</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-3 h-3 rounded bg-red-200 dark:bg-red-800"></div>
									<span>Lỗi: Cần sửa hoặc xóa trước khi import</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-3 h-3 rounded bg-gray-200 dark:bg-gray-800"></div>
									<span>Đã xóa: Sẽ không được import</span>
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
};

export default ImportQuestionForm;
