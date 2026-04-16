import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
	ArrowLeft,
	BookOpen,
	ChevronDown,
	ChevronUp,
	LayoutGrid,
	Loader2,
	PlusCircle,
	Save,
	Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type {
	MatchingPairDto,
	MatchingStageConfigDto,
	MatchingStageDto,
} from "../api/admin-matching-game.api";
import {
	useDeleteMatchingGame,
	useMatchingGameDetail,
	useUpsertMatchingGame,
} from "../queries/useAdminMatchingGame";

const TOPIC_TITLES_PRIMARY: Record<string, string> = {
	A: "MÁY TÍNH VÀ EM",
	B: "MẠNG MÁY TÍNH VÀ INTERNET",
	C: "TỔ CHỨC LƯU TRỮ, TÌM KIẾM VÀ TRAO ĐỔI THÔNG TIN",
	D: "ĐẠO ĐỨC, PHÁP LUẬT VỀ VĂN HÓA TRONG MÔI TRƯỜNG SỐ",
	E: "ỨNG DỤNG TIN HỌC",
	F: "GIẢI QUYẾT VẤN ĐỀ VỚI SỰ TRỢ GIÚP CỦA MÁY TÍNH",
};

const KNOWN_TOPIC_CODES = Object.keys(TOPIC_TITLES_PRIMARY);

interface PairForm {
	id?: string;
	leftType: "text" | "image" | "audio";
	leftValue: string;
	rightType: "text" | "image" | "audio";
	rightValue: string;
	hint?: string;
}

interface StageForm {
	id?: string;
	title: string;
	description?: string;
	layoutType: "match" | "media-quiz";
	shuffle: boolean;
	timeLimit?: number | null;
	maxMistakes?: number | null;
	showHints: boolean;
	pairs: PairForm[];
}

interface GameForm {
	grade: number;
	topicCode: string;
	topicName: string;
	metaVersion: string;
	metaLanguage: string;
	stages: StageForm[];
}

const buildTitle = (grade: number, topicCode: string, topicName: string) =>
	`Lớp ${grade} - ${topicCode}: ${topicName}`;

const parseTopicName = (
	title: string,
	grade: number,
	topicCode: string,
): string => {
	const prefix = `Lớp ${grade} - ${topicCode}: `;
	return title.startsWith(prefix) ? title.slice(prefix.length) : title;
};

const defaultPair = (): PairForm => ({
	leftType: "text",
	leftValue: "",
	rightType: "text",
	rightValue: "",
	hint: "",
});

const defaultStage = (): StageForm => ({
	title: "",
	description: "",
	layoutType: "match",
	shuffle: true,
	showHints: true,
	timeLimit: null,
	maxMistakes: null,
	pairs: [defaultPair()],
});

const defaultForm = (): GameForm => ({
	grade: 3,
	topicCode: "A",
	topicName: "",
	metaVersion: "1.0.0",
	metaLanguage: "vi",
	stages: [defaultStage()],
});

const apiToForm = (
	grade: number,
	topicCode: string,
	data: {
		meta?: {
			title?: string;
			version?: string;
			language?: string;
		};
		stages?: MatchingStageDto[];
	},
): GameForm => {
	const rawTitle = data?.meta?.title ?? "";
	return {
		grade,
		topicCode,
		topicName: parseTopicName(rawTitle, grade, topicCode),
		metaVersion: data?.meta?.version ?? "1.0.0",
		metaLanguage: data?.meta?.language ?? "vi",
		stages: (data?.stages ?? []).map((stage) => ({
			id: stage.id,
			title: stage.title,
			description: stage.description ?? "",
			layoutType: (stage.config?.layoutType ?? "match") as
				| "match"
				| "media-quiz",
			shuffle: stage.config?.shuffle ?? true,
			showHints: stage.config?.showHints ?? true,
			timeLimit: stage.config?.timeLimit ?? null,
			maxMistakes: stage.config?.maxMistakes ?? null,
			pairs: (stage.pairs ?? []).map((pair) => ({
				id: pair.id,
				leftType: (pair.left?.type ?? "text") as PairForm["leftType"],
				leftValue: pair.left?.value ?? "",
				rightType: (pair.right?.type ?? "text") as PairForm["rightType"],
				rightValue: pair.right?.value ?? "",
				hint: pair.hint ?? "",
			})),
		})),
	};
};

const formToStages = (stages: StageForm[]): MatchingStageDto[] =>
	stages.map((stage) => {
		const config: MatchingStageConfigDto = {
			shuffle: stage.shuffle,
			showHints: stage.showHints,
			layoutType: stage.layoutType,
			timeLimit: stage.timeLimit ?? null,
			maxMistakes: stage.maxMistakes ?? null,
		};

		const pairs: MatchingPairDto[] = stage.pairs.map((pair) => ({
			id: pair.id,
			left: { type: pair.leftType, value: pair.leftValue },
			right: { type: pair.rightType, value: pair.rightValue },
			hint: pair.hint || undefined,
		}));

		return {
			id: stage.id,
			title: stage.title,
			description: stage.description || undefined,
			config,
			pairs,
		};
	});

const getErrorMessage = (error: unknown, fallback: string) => {
	if (error instanceof Error && error.message) {
		return error.message;
	}
	if (
		typeof error === "object" &&
		error !== null &&
		"response" in error &&
		typeof error.response === "object" &&
		error.response !== null &&
		"data" in error.response &&
		typeof error.response.data === "object" &&
		error.response.data !== null &&
		"message" in error.response.data &&
		typeof error.response.data.message === "string"
	) {
		return error.response.data.message;
	}
	return fallback;
};

interface PairEditorProps {
	pair: PairForm;
	index: number;
	onUpdate: (pair: PairForm) => void;
	onRemove: () => void;
	canRemove: boolean;
}

const PairEditor = ({
	pair,
	index,
	onUpdate,
	onRemove,
	canRemove,
}: PairEditorProps) => {
	const itemTypeOptions = (
		<>
			<SelectItem value="text">Văn bản</SelectItem>
			<SelectItem value="image">Hình ảnh (URL)</SelectItem>
			<SelectItem value="audio">Âm thanh (URL)</SelectItem>
		</>
	);

	return (
		<div className="space-y-3 rounded-xl border bg-muted/30 p-4">
			<div className="flex items-center justify-between">
				<span className="text-xs font-semibold text-muted-foreground">
					Cặp ghép #{index + 1}
				</span>
				{canRemove ? (
					<Button
						type="button"
						size="icon"
						variant="ghost"
						className="h-7 w-7 text-destructive"
						onClick={onRemove}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				) : null}
			</div>

			<div className="grid gap-3 md:grid-cols-2">
				<div className="space-y-2">
					<Label className="text-xs">Nội dung bên trái</Label>
					<Select
						value={pair.leftType}
						onValueChange={(value) =>
							onUpdate({ ...pair, leftType: value as PairForm["leftType"] })
						}
					>
						<SelectTrigger className="text-xs">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>{itemTypeOptions}</SelectContent>
					</Select>
					<Textarea
						className="min-h-20 text-xs"
						placeholder={
							pair.leftType === "text"
								? "Nội dung văn bản..."
								: "URL hình ảnh/âm thanh..."
						}
						value={pair.leftValue}
						onChange={(e) => onUpdate({ ...pair, leftValue: e.target.value })}
					/>
				</div>

				<div className="space-y-2">
					<Label className="text-xs">Nội dung bên phải</Label>
					<Select
						value={pair.rightType}
						onValueChange={(value) =>
							onUpdate({ ...pair, rightType: value as PairForm["rightType"] })
						}
					>
						<SelectTrigger className="text-xs">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>{itemTypeOptions}</SelectContent>
					</Select>
					<Textarea
						className="min-h-20 text-xs"
						placeholder={
							pair.rightType === "text"
								? "Nội dung văn bản..."
								: "URL hình ảnh/âm thanh..."
						}
						value={pair.rightValue}
						onChange={(e) => onUpdate({ ...pair, rightValue: e.target.value })}
					/>
				</div>
			</div>

			<div className="space-y-2">
				<Label className="text-xs">Gợi ý</Label>
				<Input
					className="text-xs"
					placeholder="Gợi ý..."
					value={pair.hint ?? ""}
					onChange={(e) => onUpdate({ ...pair, hint: e.target.value })}
				/>
			</div>
		</div>
	);
};

interface StageEditorProps {
	stage: StageForm;
	index: number;
	onUpdate: (stage: StageForm) => void;
	onRemove: () => void;
	canRemove: boolean;
}

const StageEditor = ({
	stage,
	index,
	onUpdate,
	onRemove,
	canRemove,
}: StageEditorProps) => {
	const [open, setOpen] = useState(true);

	const updatePair = (pairIndex: number, pair: PairForm) => {
		onUpdate({
			...stage,
			pairs: stage.pairs.map((item, indexValue) =>
				indexValue === pairIndex ? pair : item,
			),
		});
	};

	const removePair = (pairIndex: number) => {
		onUpdate({
			...stage,
			pairs: stage.pairs.filter((_, indexValue) => indexValue !== pairIndex),
		});
	};

	const addPair = () => {
		onUpdate({ ...stage, pairs: [...stage.pairs, defaultPair()] });
	};

	return (
		<Collapsible open={open} onOpenChange={setOpen}>
			<div className="rounded-xl border bg-card">
				<CollapsibleTrigger asChild>
					<button
						type="button"
						className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-muted/40"
					>
						<div className="flex items-center gap-2">
							{open ? (
								<ChevronUp className="h-4 w-4" />
							) : (
								<ChevronDown className="h-4 w-4" />
							)}
							<div>
								<div className="font-medium">
									Stage {index + 1}: {stage.title || "(Chưa đặt tên)"}
								</div>
								<div className="text-xs text-muted-foreground">
									{stage.pairs.length} cặp ghép
								</div>
							</div>
						</div>
						{canRemove ? (
							<Button
								type="button"
								size="icon"
								variant="ghost"
								className="h-8 w-8 text-destructive"
								onClick={(event) => {
									event.stopPropagation();
									onRemove();
								}}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						) : null}
					</button>
				</CollapsibleTrigger>
				<CollapsibleContent>
					<div className="space-y-5 px-5 pb-5">
						<Separator />
						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label>Tiêu đề stage</Label>
								<Input
									value={stage.title}
									onChange={(e) =>
										onUpdate({ ...stage, title: e.target.value })
									}
									placeholder="Ví dụ: Xử lý thông tin"
								/>
							</div>
							<div className="space-y-2">
								<Label>Loại layout</Label>
								<Select
									value={stage.layoutType}
									onValueChange={(value) =>
										onUpdate({
											...stage,
											layoutType: value as StageForm["layoutType"],
										})
									}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="match">Ghép đôi</SelectItem>
										<SelectItem value="media-quiz">Media quiz</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="space-y-2">
							<Label>Mô tả stage</Label>
							<Input
								value={stage.description ?? ""}
								onChange={(e) =>
									onUpdate({ ...stage, description: e.target.value })
								}
								placeholder="Mô tả ngắn về stage này..."
							/>
						</div>

						<div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
							<div className="space-y-2">
								<Label>Giới hạn thời gian (giây)</Label>
								<Input
									type="number"
									min={0}
									value={stage.timeLimit ?? ""}
									onChange={(e) =>
										onUpdate({
											...stage,
											timeLimit: e.target.value ? Number(e.target.value) : null,
										})
									}
									placeholder="Không giới hạn"
								/>
							</div>
							<div className="space-y-2">
								<Label>Số lần sai tối đa</Label>
								<Input
									type="number"
									min={1}
									value={stage.maxMistakes ?? ""}
									onChange={(e) =>
										onUpdate({
											...stage,
											maxMistakes: e.target.value
												? Number(e.target.value)
												: null,
										})
									}
									placeholder="Không giới hạn"
								/>
							</div>
							<div className="grid gap-3 self-end pb-1 text-sm">
								<div className="flex items-center gap-2">
									<Checkbox
										id={`shuffle-${index}`}
										checked={stage.shuffle}
										onCheckedChange={(checked) =>
											onUpdate({ ...stage, shuffle: !!checked })
										}
									/>
									<Label htmlFor={`shuffle-${index}`}>Xáo trộn</Label>
								</div>
								<div className="flex items-center gap-2">
									<Checkbox
										id={`hint-${index}`}
										checked={stage.showHints}
										onCheckedChange={(checked) =>
											onUpdate({ ...stage, showHints: !!checked })
										}
									/>
									<Label htmlFor={`hint-${index}`}>Hiện gợi ý</Label>
								</div>
							</div>
						</div>

						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<div>
									<h4 className="font-medium">Các cặp ghép</h4>
									<p className="text-xs text-muted-foreground">
										Mỗi stage cần ít nhất một cặp ghép để hiển thị trong game.
									</p>
								</div>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={addPair}
								>
									<PlusCircle className="mr-2 h-4 w-4" />
									Thêm cặp
								</Button>
							</div>
							<div className="space-y-3">
								{stage.pairs.map((pair, pairIndex) => (
									<PairEditor
										key={pair.id ?? `${index}-${pairIndex}`}
										pair={pair}
										index={pairIndex}
										onUpdate={(updated) => updatePair(pairIndex, updated)}
										onRemove={() => removePair(pairIndex)}
										canRemove={stage.pairs.length > 1}
									/>
								))}
							</div>
						</div>
					</div>
				</CollapsibleContent>
			</div>
		</Collapsible>
	);
};

type MatchingGameEditorPageProps = {
	mode: "create" | "edit";
	grade?: number;
	topicCode?: string;
};

export function MatchingGameEditorPage({
	mode,
	grade,
	topicCode,
}: MatchingGameEditorPageProps) {
	const navigate = useNavigate();
	const isCreateMode = mode === "create";
	const normalizedTopicCode = topicCode?.toUpperCase();
	const { data, isLoading } = useMatchingGameDetail(
		grade ?? 0,
		normalizedTopicCode ?? "",
		!isCreateMode && grade !== undefined && Boolean(normalizedTopicCode),
	);
	const upsertGame = useUpsertMatchingGame();
	const deleteGame = useDeleteMatchingGame();
	const [form, setForm] = useState<GameForm>(defaultForm());

	useEffect(() => {
		if (isCreateMode) {
			setForm(defaultForm());
			return;
		}
		if (!data || grade === undefined || !normalizedTopicCode) return;
		setForm(apiToForm(grade, normalizedTopicCode, data));
	}, [data, grade, isCreateMode, normalizedTopicCode]);

	const updateStage = (stageIndex: number, stage: StageForm) => {
		setForm((prev) => ({
			...prev,
			stages: prev.stages.map((item, indexValue) =>
				indexValue === stageIndex ? stage : item,
			),
		}));
	};

	const removeStage = (stageIndex: number) => {
		setForm((prev) => ({
			...prev,
			stages: prev.stages.filter((_, indexValue) => indexValue !== stageIndex),
		}));
	};

	const addStage = () => {
		setForm((prev) => ({
			...prev,
			stages: [...prev.stages, defaultStage()],
		}));
	};

	const handleSubmit = async () => {
		if (!form.topicName.trim()) {
			toast.error("Vui lòng nhập tên chủ đề");
			return;
		}
		if (!form.topicCode.trim()) {
			toast.error("Vui lòng nhập mã chủ đề");
			return;
		}

		try {
			const nextTopicCode = form.topicCode.toUpperCase();
			await upsertGame.mutateAsync({
				grade: form.grade,
				topicCode: nextTopicCode,
				meta: {
					title: buildTitle(form.grade, nextTopicCode, form.topicName),
					version: form.metaVersion || "1.0.0",
					language: form.metaLanguage || "vi",
				},
				stages: formToStages(form.stages),
			});
			toast.success(
				isCreateMode
					? "Tạo matching game thành công"
					: "Cập nhật matching game thành công",
			);
			if (
				isCreateMode ||
				nextTopicCode !== normalizedTopicCode ||
				form.grade !== grade
			) {
				navigate({
					to: "/apps/games/matching",
					search: { grade: form.grade, topic: nextTopicCode },
				});
			}
		} catch (error: unknown) {
			toast.error(getErrorMessage(error, "Không thể lưu matching game"));
		}
	};

	const handleDelete = async () => {
		if (grade === undefined || !normalizedTopicCode) return;
		if (
			!confirm(
				`Xoá matching game Lớp ${grade} - Chủ đề ${normalizedTopicCode}?`,
			)
		) {
			return;
		}
		try {
			await deleteGame.mutateAsync({ grade, topicCode: normalizedTopicCode });
			toast.success("Đã xoá matching game");
			navigate({ to: "/apps/games" });
		} catch (error: unknown) {
			toast.error(getErrorMessage(error, "Không thể xoá matching game"));
		}
	};

	const titlePreview = useMemo(
		() =>
			buildTitle(
				form.grade,
				form.topicCode.toUpperCase() || "A",
				form.topicName || "",
			),
		[form.grade, form.topicCode, form.topicName],
	);

	if (!isCreateMode && (grade === undefined || !normalizedTopicCode)) {
		return (
			<div className="p-6 text-destructive">
				Thiếu `grade` hoặc `topic` trong URL.
			</div>
		);
	}

	if (!isCreateMode && isLoading) {
		return (
			<div className="flex items-center gap-2 p-6 text-muted-foreground">
				<Loader2 className="h-4 w-4 animate-spin" />
				Đang tải matching game...
			</div>
		);
	}

	if (!isCreateMode && !data) {
		return (
			<div className="p-6">
				<p className="text-destructive">Không tìm thấy matching game.</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<Button asChild variant="link" className="px-0">
					<Link to="/apps/games">
						<ArrowLeft className="mr-2 h-4 w-4" />
						Quay lại danh sách
					</Link>
				</Button>
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div className="space-y-2">
						<div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
							<LayoutGrid className="h-4 w-4" />
							{isCreateMode ? "Tạo matching game" : "Biên tập matching game"}
						</div>
						<div>
							<h2 className="text-3xl font-bold tracking-tight">
								{isCreateMode ? "Tạo game nối khái niệm" : titlePreview}
							</h2>
							<p className="mt-1 text-sm text-muted-foreground">
								Cấu hình metadata, stage và từng cặp ghép trong một trình biên
								tập full-page.
							</p>
						</div>
					</div>
				</div>
			</div>

			<div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
				<div className="space-y-6">
					<Card>
						<CardHeader className="border-b">
							<CardTitle>Thông tin chương trình học</CardTitle>
							<CardDescription>
								Xác định lớp, mã chủ đề và metadata hiển thị cho matching game.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-5 pt-6">
							<div className="grid gap-4 md:grid-cols-3">
								<div className="space-y-2">
									<Label>Lớp</Label>
									<Select
										value={String(form.grade)}
										onValueChange={(value) =>
											setForm((prev) => ({ ...prev, grade: Number(value) }))
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{Array.from({ length: 9 }, (_, index) => index + 3).map(
												(level) => (
													<SelectItem key={level} value={String(level)}>
														Lớp {level}
													</SelectItem>
												),
											)}
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label>Mã chủ đề</Label>
									<Select
										value={
											KNOWN_TOPIC_CODES.includes(form.topicCode)
												? form.topicCode
												: "__custom__"
										}
										onValueChange={(value) => {
											if (value === "__custom__") {
												setForm((prev) => ({ ...prev, topicCode: "" }));
												return;
											}
											setForm((prev) => ({
												...prev,
												topicCode: value,
												topicName:
													TOPIC_TITLES_PRIMARY[value] ?? prev.topicName,
											}));
										}}
									>
										<SelectTrigger>
											<SelectValue placeholder="Chọn chủ đề..." />
										</SelectTrigger>
										<SelectContent>
											{Object.entries(TOPIC_TITLES_PRIMARY).map(
												([code, title]) => (
													<SelectItem key={code} value={code}>
														{code} · {title}
													</SelectItem>
												),
											)}
											<SelectItem value="__custom__">Tự nhập</SelectItem>
										</SelectContent>
									</Select>
									{!KNOWN_TOPIC_CODES.includes(form.topicCode) ? (
										<Input
											placeholder="Nhập mã chủ đề..."
											maxLength={3}
											value={form.topicCode}
											onChange={(e) =>
												setForm((prev) => ({
													...prev,
													topicCode: e.target.value.toUpperCase(),
												}))
											}
										/>
									) : null}
								</div>

								<div className="space-y-2">
									<Label>Ngôn ngữ</Label>
									<Select
										value={form.metaLanguage}
										onValueChange={(value) =>
											setForm((prev) => ({ ...prev, metaLanguage: value }))
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="vi">Tiếng Việt</SelectItem>
											<SelectItem value="en">English</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							<div className="space-y-2">
								<Label>Tên chủ đề</Label>
								<div className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-4">
									<div className="inline-flex w-fit items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground">
										<BookOpen className="h-4 w-4" />
										Lớp {form.grade} · {form.topicCode || "A"}
									</div>
									<Input
										placeholder="Ví dụ: MÁY TÍNH VÀ EM"
										value={form.topicName}
										onChange={(e) =>
											setForm((prev) => ({
												...prev,
												topicName: e.target.value.toUpperCase(),
											}))
										}
									/>
									<div className="text-xs text-muted-foreground">
										Tiêu đề đầy đủ:{" "}
										<span className="font-medium">{titlePreview}</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="border-b">
							<div className="flex items-center justify-between gap-3">
								<div>
									<CardTitle>Stages và cặp ghép</CardTitle>
									<CardDescription>
										Tổ chức gameplay theo stage, mỗi stage chứa layout, cấu hình
										và danh sách cặp ghép.
									</CardDescription>
								</div>
								<Button type="button" variant="outline" onClick={addStage}>
									<PlusCircle className="mr-2 h-4 w-4" />
									Thêm stage
								</Button>
							</div>
						</CardHeader>
						<CardContent className="space-y-4 pt-6">
							{form.stages.map((stage, index) => (
								<StageEditor
									key={stage.id ?? `stage-${index}`}
									stage={stage}
									index={index}
									onUpdate={(updated) => updateStage(index, updated)}
									onRemove={() => removeStage(index)}
									canRemove={form.stages.length > 1}
								/>
							))}
						</CardContent>
					</Card>
				</div>

				<div className="space-y-6">
					<Card className="xl:sticky xl:top-24">
						<CardHeader className="border-b">
							<CardTitle>Xuất bản</CardTitle>
							<CardDescription>
								Lưu nhanh metadata, stage và điều hướng lại đúng detail sau khi
								tạo mới hoặc đổi khóa định danh.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4 pt-6">
							<div className="space-y-3 rounded-xl border bg-muted/20 p-4 text-sm">
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">Khóa định danh</span>
									<Badge variant="outline">
										L{form.grade}-{form.topicCode || "A"}
									</Badge>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">Số stage</span>
									<span className="font-medium">{form.stages.length}</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">Ngôn ngữ</span>
									<span className="font-medium">{form.metaLanguage}</span>
								</div>
							</div>

							<Button
								className="w-full"
								onClick={() => void handleSubmit()}
								disabled={upsertGame.isPending}
							>
								<Save className="mr-2 h-4 w-4" />
								{upsertGame.isPending
									? "Đang lưu..."
									: isCreateMode
										? "Tạo matching game"
										: "Lưu thay đổi"}
							</Button>

							{!isCreateMode ? (
								<Button
									className="w-full"
									variant="destructive"
									onClick={() => void handleDelete()}
									disabled={deleteGame.isPending}
								>
									<Trash2 className="mr-2 h-4 w-4" />
									Xoá matching game
								</Button>
							) : null}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
