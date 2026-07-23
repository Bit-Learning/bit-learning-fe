import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
	X,
	Loader2,
	Save,
	Plus,
	Trash2,
	TestTube2,
	FileText,
	Code2,
	CheckSquare,
	AlertCircle,
	Pencil,
	Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";
import {
	useProblemDetail,
	useAllTestCases,
	useCodeTemplates,
	useBulkCreateTestCases,
	useUpdateTestCase,
	useDeleteTestCase,
	useGenerateCodeTemplates,
} from "@/features/problems/queries/useProblem";
import { useUpdateContestProblem } from "../queries/useContest";
import {
	Difficulty,
	ParamType,
	ParamTypeInfo,
} from "@/features/problems/types/problem.type";
import type {
	CodeTemplateResponse,
	TestCaseResponse,
	UpdateTestCaseRequest,
} from "@/features/problems/types/problem.type";
import { DIFFICULTY_OPTIONS, toSlug } from "../utils/contest.util";
import ConfirmModal from "./ConfirmModal";

type Tab = "info" | "testcases" | "templates";

const problemSchema = z.object({
	title: z.string().min(1, "Tiêu đề không được để trống"),
	slug: z
		.string()
		.min(1, "Slug không được để trống")
		.regex(/^[a-z0-9-]+$/, "Slug chỉ chứa chữ thường, số và dấu gạch ngang"),
	description: z.string().min(1, "Mô tả không được để trống"),
	constraints: z.string().optional(),
	difficulty: z.nativeEnum(Difficulty),
	classLevel: z.number().min(6).max(12),
	timeLimitMs: z
		.number()
		.min(100, "Tối thiểu 100ms")
		.max(30000, "Tối đa 30000ms"),
	memoryLimitMb: z.number().min(8, "Tối thiểu 8MB").max(512, "Tối đa 512MB"),
	isPublic: z.boolean().optional(),
});

type ProblemFormData = z.infer<typeof problemSchema>;

const generateSchema = z.object({
	functionName: z
		.string()
		.min(1, "Tên hàm không được để trống")
		.regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "Tên hàm không hợp lệ"),
	returnType: z.nativeEnum(ParamType),
	parameters: z
		.array(
			z.object({
				name: z.string().min(1, "Không được để trống"),
				type: z.nativeEnum(ParamType),
			}),
		)
		.min(1, "Cần ít nhất 1 tham số"),
});

type GenerateFormData = z.infer<typeof generateSchema>;

interface EditContestProblemModalProps {
	contestId: string;
	contestProblemId: string;
	problemId: string;
	problemTitle: string;
	onClose: () => void;
}

const EditContestProblemModal: React.FC<EditContestProblemModalProps> = ({
	contestId,
	contestProblemId,
	problemId,
	problemTitle,
	onClose,
}) => {
	const [activeTab, setActiveTab] = useState<Tab>("info");
	const [newTCs, setNewTCs] = useState<
		{ input: string; expectedOutput: string; isSample: boolean }[]
	>([]);
	const [editingTCId, setEditingTCId] = useState<string | null>(null);
	const [editingTCData, setEditingTCData] =
		useState<UpdateTestCaseRequest | null>(null);
	const [deletingTCId, setDeletingTCId] = useState<string | null>(null);

	const { data: detail, isLoading: loadingDetail } =
		useProblemDetail(problemId);
	const { data: allTestCases, isLoading: loadingTC } =
		useAllTestCases(problemId);
	const { data: codeTemplates, isLoading: loadingTemplates } =
		useCodeTemplates(problemId);

	const updateProblem = useUpdateContestProblem();
	const bulkCreateTC = useBulkCreateTestCases();
	const updateTC = useUpdateTestCase();
	const deleteTC = useDeleteTestCase();
	const generateTemplates = useGenerateCodeTemplates();

	const form = useForm<ProblemFormData>({
		resolver: zodResolver(problemSchema),
	});

	useEffect(() => {
		if (detail) {
			form.reset({
				title: detail.title,
				slug: detail.slug,
				description: detail.description,
				constraints: detail.constraints ?? "",
				difficulty: detail.difficulty,
				classLevel: detail.classLevel,
				timeLimitMs: detail.timeLimitMs,
				memoryLimitMb: detail.memoryLimitMb,
				isPublic: detail.isPublic,
			});
		}
	}, [detail]);

	const onSaveInfo = async (data: ProblemFormData) => {
		await updateProblem.mutateAsync({
			contestId,
			contestProblemId,
			request: data,
		});
		onClose();
	};

	const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value;
		form.setValue("title", val);
		form.setValue("slug", toSlug(val));
	};

	const addNewTC = () =>
		setNewTCs((prev) => [
			...prev,
			{ input: "", expectedOutput: "", isSample: true },
		]);

	const removeNewTC = (i: number) =>
		setNewTCs((prev) => prev.filter((_, idx) => idx !== i));

	const updateNewTC = (
		i: number,
		field: "input" | "expectedOutput" | "isSample",
		value: string | boolean,
	) =>
		setNewTCs((prev) =>
			prev.map((tc, idx) => (idx === i ? { ...tc, [field]: value } : tc)),
		);

	const saveBulkTC = async () => {
		const valid = newTCs.filter(
			(t) => t.input.trim() && t.expectedOutput.trim(),
		);
		if (!valid.length) {
			toast.error("Cần ít nhất 1 test case hợp lệ.");
			return;
		}
		await bulkCreateTC.mutateAsync({
			problemId,
			data: { testCases: valid, replaceExisting: false },
		});
		setNewTCs([]);
	};

	const startEditTC = (tc: TestCaseResponse) => {
		setEditingTCId(tc.id);
		setEditingTCData({
			input: tc.input,
			expectedOutput: tc.expectedOutput,
			isSample: tc.isSample,
		});
	};

	const saveEditTC = async (tcId: string) => {
		if (!editingTCData) return;
		await updateTC.mutateAsync({
			problemId,
			testCaseId: tcId,
			data: editingTCData,
		});
		setEditingTCId(null);
		setEditingTCData(null);
	};

	const handleDeleteTC = async () => {
		if (!deletingTCId) return;
		await deleteTC.mutateAsync({ problemId, testCaseId: deletingTCId });
		setDeletingTCId(null);
	};

	const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
		{
			id: "info",
			label: "Thông tin bài toán",
			icon: <FileText className="w-3.5 h-3.5" />,
		},
		{
			id: "testcases",
			label: `Test Cases (${allTestCases?.length ?? "…"})`,
			icon: <TestTube2 className="w-3.5 h-3.5" />,
		},
		{
			id: "templates",
			label: `Code Templates (${codeTemplates?.length ?? "…"})`,
			icon: <Code2 className="w-3.5 h-3.5" />,
		},
	];

	return (
		<>
			<ConfirmModal
				open={!!deletingTCId}
				variant="danger"
				title="Xóa test case"
				description="Bạn có chắc chắn muốn xóa test case này? Hành động không thể hoàn tác."
				confirmLabel="Xóa"
				onConfirm={handleDeleteTC}
				onCancel={() => setDeletingTCId(null)}
			/>
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
				<div
					className="absolute inset-0 bg-black/40 backdrop-blur-sm"
					onClick={onClose}
				/>
				<div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
					<div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
						<div>
							<h2 className="text-base font-bold text-gray-900">
								Chỉnh sửa bài toán
							</h2>
							<p className="text-xs text-gray-400 mt-0.5 truncate max-w-lg">
								{problemTitle}
							</p>
						</div>
						<button
							onClick={onClose}
							className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
						>
							<X className="w-5 h-5" />
						</button>
					</div>

					<div className="flex border-b border-gray-200 shrink-0 overflow-x-auto">
						{tabs.map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={cn(
									"flex items-center gap-1.5 py-3 px-5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap",
									activeTab === tab.id
										? "text-blue-600 border-blue-600"
										: "text-gray-500 border-transparent hover:text-gray-700",
								)}
							>
								{tab.icon}
								{tab.label}
							</button>
						))}
					</div>

					<div className="flex-1 overflow-y-auto p-6">
						{activeTab === "info" && (
							<>
								{loadingDetail ? (
									<div className="flex justify-center py-12">
										<Loader2 className="w-8 h-8 animate-spin text-blue-600" />
									</div>
								) : (
									<div className="space-y-5">
										<FieldGroup
											label="Tiêu đề"
											required
											error={form.formState.errors.title?.message}
										>
											<Input
												{...form.register("title")}
												onChange={handleTitleChange}
												className="border-gray-300 focus:border-blue-500"
											/>
										</FieldGroup>

										<FieldGroup
											label="Slug"
											required
											error={form.formState.errors.slug?.message}
										>
											<Input
												{...form.register("slug")}
												className="border-gray-300 focus:border-blue-500 font-mono text-sm"
											/>
										</FieldGroup>

										<FieldGroup
											label="Mô tả đề bài"
											required
											error={form.formState.errors.description?.message}
										>
											<Textarea
												{...form.register("description")}
												rows={7}
												className="border-gray-300 focus:border-blue-500 resize-none text-sm"
											/>
										</FieldGroup>

										<FieldGroup label="Ràng buộc">
											<Textarea
												{...form.register("constraints")}
												rows={3}
												placeholder="1 ≤ n ≤ 10^5"
												className="border-gray-300 focus:border-blue-500 font-mono text-sm resize-none"
											/>
										</FieldGroup>

										<div className="grid grid-cols-2 gap-4">
											<FieldGroup label="Độ khó" required>
												<div className="flex gap-2">
													{DIFFICULTY_OPTIONS.map((opt) => (
														<button
															key={opt.value}
															type="button"
															onClick={() =>
																form.setValue("difficulty", opt.value)
															}
															className={cn(
																"flex-1 py-2 text-xs font-bold rounded-lg border-2 transition-all",
																form.watch("difficulty") === opt.value
																	? opt.color + " border-current"
																	: "text-gray-500 bg-white border-gray-200 hover:border-gray-300",
															)}
														>
															{opt.label}
														</button>
													))}
												</div>
											</FieldGroup>

											<FieldGroup
												label="Khối lớp"
												error={form.formState.errors.classLevel?.message}
											>
												<select
													{...form.register("classLevel", {
														valueAsNumber: true,
													})}
													className="h-10 w-full rounded-md border-2 border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none"
												>
													{[6, 7, 8, 9, 10, 11, 12].map((lvl) => (
														<option key={lvl} value={lvl}>
															Lớp {lvl}
														</option>
													))}
												</select>
											</FieldGroup>

											<FieldGroup
												label="Giới hạn thời gian (ms)"
												required
												error={form.formState.errors.timeLimitMs?.message}
											>
												<Input
													type="number"
													{...form.register("timeLimitMs", {
														valueAsNumber: true,
													})}
													className="border-gray-300 focus:border-blue-500"
												/>
											</FieldGroup>

											<FieldGroup
												label="Giới hạn bộ nhớ (MB)"
												required
												error={form.formState.errors.memoryLimitMb?.message}
											>
												<Input
													type="number"
													{...form.register("memoryLimitMb", {
														valueAsNumber: true,
													})}
													className="border-gray-300 focus:border-blue-500"
												/>
											</FieldGroup>
										</div>

										<div className="flex items-center gap-3">
											<input
												type="checkbox"
												id="isPublic"
												{...form.register("isPublic")}
												className="w-4 h-4 accent-blue-600"
											/>
											<label
												htmlFor="isPublic"
												className="text-sm font-medium text-gray-700 cursor-pointer"
											>
												Công khai bài toán này
											</label>
										</div>
									</div>
								)}
							</>
						)}

						{activeTab === "testcases" && (
							<div className="space-y-6">
								<div className="flex items-center justify-between">
									<p className="text-sm font-bold text-gray-800">
										Test cases hiện có
									</p>
									<div className="flex items-center gap-2">
										<button
											onClick={addNewTC}
											className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
										>
											<Plus className="w-3.5 h-3.5" />
											Thêm mới
										</button>
									</div>
								</div>

								{loadingTC ? (
									<div className="flex justify-center py-8">
										<Loader2 className="w-6 h-6 animate-spin text-blue-600" />
									</div>
								) : !allTestCases?.length ? (
									<div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
										<p className="text-sm text-gray-400">
											Chưa có test case nào.
										</p>
									</div>
								) : (
									<div className="space-y-2">
										{allTestCases.map((tc, idx) => (
											<div
												key={tc.id}
												className="rounded-xl border border-gray-200 overflow-hidden"
											>
												{editingTCId === tc.id && editingTCData ? (
													<div className="p-4 space-y-3 bg-blue-50/30">
														<div className="flex items-center justify-between mb-2">
															<span className="text-xs font-bold text-blue-600">
																Đang chỉnh sửa #{idx + 1}
															</span>
															<label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
																<input
																	type="checkbox"
																	checked={editingTCData.isSample}
																	onChange={(e) =>
																		setEditingTCData((d) =>
																			d
																				? { ...d, isSample: e.target.checked }
																				: d,
																		)
																	}
																	className="w-3.5 h-3.5 accent-blue-600"
																/>
																Mẫu
															</label>
														</div>
														<div className="grid grid-cols-2 gap-3">
															<div>
																<p className="text-xs font-bold text-gray-500 uppercase mb-1.5">
																	Đầu vào
																</p>
																<Textarea
																	value={editingTCData.input}
																	onChange={(e) =>
																		setEditingTCData((d) =>
																			d ? { ...d, input: e.target.value } : d,
																		)
																	}
																	rows={4}
																	className="text-xs font-mono border-blue-200 focus:border-blue-500 resize-none"
																/>
															</div>
															<div>
																<p className="text-xs font-bold text-gray-500 uppercase mb-1.5">
																	Kết quả mong đợi
																</p>
																<Textarea
																	value={editingTCData.expectedOutput}
																	onChange={(e) =>
																		setEditingTCData((d) =>
																			d
																				? {
																						...d,
																						expectedOutput: e.target.value,
																					}
																				: d,
																		)
																	}
																	rows={4}
																	className="text-xs font-mono border-blue-200 focus:border-blue-500 resize-none"
																/>
															</div>
														</div>
														<div className="flex gap-2 justify-end">
															<button
																onClick={() => {
																	setEditingTCId(null);
																	setEditingTCData(null);
																}}
																className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
															>
																Hủy
															</button>
															<button
																onClick={() => void saveEditTC(tc.id)}
																disabled={updateTC.isPending}
																className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
															>
																{updateTC.isPending ? (
																	<Loader2 className="w-3 h-3 animate-spin" />
																) : (
																	<Check className="w-3 h-3" />
																)}
																Lưu
															</button>
														</div>
													</div>
												) : (
													<>
														<div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
															<div className="flex items-center gap-2">
																<span className="text-xs font-bold text-gray-600">
																	#{idx + 1}
																</span>
																{tc.isSample ? (
																	<Badge
																		variant="outline"
																		className="text-[10px] font-bold text-green-700 border-green-200 bg-green-50 px-1.5 py-0"
																	>
																		<CheckSquare className="w-2.5 h-2.5 mr-0.5" />
																		Mẫu
																	</Badge>
																) : (
																	<Badge
																		variant="outline"
																		className="text-[10px] text-gray-500 border-gray-200 px-1.5 py-0"
																	>
																		Ẩn
																	</Badge>
																)}
															</div>
															<div className="flex items-center gap-1">
																<button
																	onClick={() => startEditTC(tc)}
																	className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"
																>
																	<Pencil className="w-3.5 h-3.5" />
																</button>
																<button
																	onClick={() => setDeletingTCId(tc.id)}
																	className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
																>
																	<Trash2 className="w-3.5 h-3.5" />
																</button>
															</div>
														</div>
														<div className="grid grid-cols-2 divide-x divide-gray-200">
															<div className="p-3">
																<p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
																	Đầu vào
																</p>
																<pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap break-all">
																	{tc.input}
																</pre>
															</div>
															<div className="p-3">
																<p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
																	Kết quả
																</p>
																<pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap break-all">
																	{tc.expectedOutput}
																</pre>
															</div>
														</div>
													</>
												)}
											</div>
										))}
									</div>
								)}

								{newTCs.length > 0 && (
									<div className="border-t border-gray-100 pt-4 space-y-3">
										<p className="text-xs font-bold text-gray-600">
											Test cases mới ({newTCs.length})
										</p>
										{newTCs.map((tc, i) => (
											<div
												key={i}
												className="rounded-xl border-2 border-blue-200 bg-blue-50/30 overflow-hidden"
											>
												<div className="flex items-center justify-between px-4 py-2 bg-blue-50 border-b border-blue-200">
													<div className="flex items-center gap-3">
														<span className="text-xs font-bold text-blue-600">
															Mới #{i + 1}
														</span>
														<label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
															<input
																type="checkbox"
																checked={tc.isSample}
																onChange={(e) =>
																	updateNewTC(i, "isSample", e.target.checked)
																}
																className="w-3.5 h-3.5 accent-blue-600"
															/>
															Mẫu
														</label>
													</div>
													<button
														onClick={() => removeNewTC(i)}
														className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
													>
														<Trash2 className="w-3.5 h-3.5" />
													</button>
												</div>
												<div className="grid grid-cols-2 gap-3 p-3">
													<div>
														<p className="text-[10px] font-bold text-gray-500 uppercase mb-1.5">
															Đầu vào
														</p>
														<Textarea
															value={tc.input}
															onChange={(e) =>
																updateNewTC(i, "input", e.target.value)
															}
															rows={3}
															className="text-xs font-mono resize-none border-gray-300"
															placeholder="Nhập đầu vào..."
														/>
													</div>
													<div>
														<p className="text-[10px] font-bold text-gray-500 uppercase mb-1.5">
															Kết quả mong đợi
														</p>
														<Textarea
															value={tc.expectedOutput}
															onChange={(e) =>
																updateNewTC(i, "expectedOutput", e.target.value)
															}
															rows={3}
															className="text-xs font-mono resize-none border-gray-300"
															placeholder="Nhập kết quả mong đợi..."
														/>
													</div>
												</div>
											</div>
										))}
										<Button
											onClick={() => void saveBulkTC()}
											disabled={bulkCreateTC.isPending}
											className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
										>
											{bulkCreateTC.isPending ? (
												<Loader2 className="w-4 h-4 animate-spin" />
											) : (
												<Save className="w-4 h-4" />
											)}
											Lưu {newTCs.length} test case mới
										</Button>
									</div>
								)}
							</div>
						)}

						{activeTab === "templates" && (
							<TemplatesTab
								problemId={problemId}
								codeTemplates={codeTemplates ?? []}
								isLoading={loadingTemplates}
								generateTemplates={generateTemplates}
							/>
						)}
					</div>

					{activeTab === "info" && (
						<div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
							<Button
								variant="outline"
								onClick={onClose}
								className="border-gray-200 text-gray-600 hover:bg-gray-100"
							>
								Hủy
							</Button>
							<Button
								onClick={form.handleSubmit(onSaveInfo)}
								disabled={updateProblem.isPending}
								className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
							>
								{updateProblem.isPending ? (
									<Loader2 className="w-4 h-4 animate-spin" />
								) : (
									<Save className="w-4 h-4" />
								)}
								Lưu thay đổi
							</Button>
						</div>
					)}
				</div>
			</div>
		</>
	);
};

const TemplatesTab: React.FC<{
	problemId: string;
	codeTemplates: CodeTemplateResponse[];
	isLoading: boolean;
	generateTemplates: ReturnType<typeof useGenerateCodeTemplates>;
}> = ({ problemId, isLoading, generateTemplates }) => {
	const genForm = useForm<GenerateFormData>({
		resolver: zodResolver(generateSchema),
		defaultValues: {
			functionName: "",
			returnType: ParamType.INT,
			parameters: [{ name: "", type: ParamType.INT }],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control: genForm.control,
		name: "parameters",
	});

	const handleGenerate = async (data: GenerateFormData) => {
		await generateTemplates.mutateAsync({ problemId, data });
		genForm.reset({
			functionName: "",
			returnType: ParamType.INT,
			parameters: [{ name: "", type: ParamType.INT }],
		});
	};

	if (isLoading) {
		return (
			<div className="flex justify-center py-8">
				<Loader2 className="w-6 h-6 animate-spin text-blue-600" />
			</div>
		);
	}

	return (
		<div className="space-y-5">
			<div>
				<p className="text-sm font-bold text-gray-800 mb-0.5">
					Tạo lại Code Templates
				</p>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-1.5">
					<Label className="text-sm font-semibold text-gray-800">
						Tên hàm <span className="text-red-500">*</span>
					</Label>
					<Input
						{...genForm.register("functionName")}
						placeholder="vd: twoSum"
						className="border-gray-300 focus:border-blue-500 font-mono"
					/>
					{genForm.formState.errors.functionName && (
						<p className="text-xs text-red-500 flex items-center gap-1">
							<AlertCircle className="w-3 h-3 shrink-0" />
							{genForm.formState.errors.functionName.message}
						</p>
					)}
				</div>
				<div className="space-y-1.5">
					<Label className="text-sm font-semibold text-gray-800">
						Kiểu trả về <span className="text-red-500">*</span>
					</Label>
					<select
						{...genForm.register("returnType")}
						className="h-10 w-full rounded-md border-2 border-gray-300 px-3 text-sm focus:border-blue-500 focus:outline-none"
					>
						{Object.values(ParamType).map((t) => (
							<option key={t} value={t}>
								{ParamTypeInfo[t].displayName} ({ParamTypeInfo[t].javaType})
							</option>
						))}
					</select>
				</div>
			</div>

			<div>
				<div className="flex items-center justify-between mb-2.5">
					<Label className="text-sm font-semibold text-gray-800">
						Tham số đầu vào <span className="text-red-500">*</span>
					</Label>
					<button
						type="button"
						onClick={() => append({ name: "", type: ParamType.INT })}
						className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
					>
						<Plus className="w-3 h-3" />
						Thêm tham số
					</button>
				</div>
				<div className="space-y-2">
					{fields.map((field, idx) => (
						<div key={field.id} className="flex gap-2 items-center">
							<Input
								{...genForm.register(`parameters.${idx}.name`)}
								placeholder="vd: nums, target"
								className="border-gray-300 focus:border-blue-500 font-mono text-sm flex-1"
							/>
							<select
								{...genForm.register(`parameters.${idx}.type`)}
								className="h-10 rounded-md border-2 border-gray-300 px-2 text-sm focus:border-blue-500 focus:outline-none flex-1"
							>
								{Object.values(ParamType).map((t) => (
									<option key={t} value={t}>
										{ParamTypeInfo[t].displayName}
									</option>
								))}
							</select>
							<button
								type="button"
								onClick={() => remove(idx)}
								disabled={fields.length === 1}
								className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
							>
								<Trash2 className="w-3.5 h-3.5" />
							</button>
						</div>
					))}
				</div>
				{genForm.formState.errors.parameters && (
					<p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
						<AlertCircle className="w-3 h-3 shrink-0" />
						{genForm.formState.errors.parameters.message}
					</p>
				)}
			</div>

			<Button
				onClick={genForm.handleSubmit(handleGenerate)}
				disabled={generateTemplates.isPending}
				className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
			>
				{generateTemplates.isPending ? (
					<Loader2 className="w-4 h-4 animate-spin" />
				) : (
					""
				)}
				Tạo templates mới
			</Button>
		</div>
	);
};

const FieldGroup: React.FC<{
	label: string;
	required?: boolean;
	error?: string;
	children: React.ReactNode;
}> = ({ label, required, error, children }) => (
	<div className="space-y-1.5">
		<Label className="text-sm font-semibold text-gray-800">
			{label} {required && <span className="text-red-500">*</span>}
		</Label>
		{children}
		{error && (
			<p className="text-xs text-red-500 flex items-center gap-1">
				<AlertCircle className="w-3 h-3 shrink-0" />
				{error}
			</p>
		)}
	</div>
);

export default EditContestProblemModal;
