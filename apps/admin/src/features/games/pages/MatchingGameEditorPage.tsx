import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	ArrowLeft,
	BookOpen,
	ChevronDown,
	ChevronUp,
	ExternalLink,
	FileImage,
	Loader2 as Loader2Icon,
	LayoutGrid,
	Loader2,
	Music,
	PlusCircle,
	Save,
	Send,
	Trash2,
	Upload,
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
import { getMatchingGamePlayUrl } from "@/shared/constants/endpoints";
import type {
	MatchingGameFullDto,
	MatchingGameStatus,
	MatchingPairDto,
	MatchingStageConfigDto,
	MatchingStageDto,
} from "../api/admin-matching-game.api";
import { useApproveGame, useRejectGame } from "../queries/useAdminGamesCrud";
import { adminGamesApi } from "../api/admin-games.api";
import { adminMatchingGameApi } from "../api/admin-matching-game.api";
import {
	MATCHING_GAME_KEYS,
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
	thumbnailUrl: string;
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
	thumbnailUrl: "",
	stages: [defaultStage()],
});

const getStatusLabel = (status?: MatchingGameStatus) => {
	switch (status) {
		case "PUBLISHED":
			return "Đã xuất bản";
		case "DRAFT":
			return "Nháp";
		case "ARCHIVED":
			return "Đã lưu trữ";
		default:
			return "Không rõ";
	}
};

const getStatusVariant = (
	status?: MatchingGameStatus,
): "default" | "secondary" | "destructive" | "outline" => {
	switch (status) {
		case "PUBLISHED":
			return "default";
		case "DRAFT":
			return "secondary";
		case "ARCHIVED":
			return "destructive";
		default:
			return "outline";
	}
};

const apiToForm = (
	grade: number,
	topicCode: string,
	data: MatchingGameFullDto,
): GameForm => {
	const rawTitle = data?.meta?.title ?? "";
	return {
		grade,
		topicCode,
		topicName: parseTopicName(rawTitle, grade, topicCode),
		metaVersion: data?.meta?.version ?? "1.0.0",
		metaLanguage: data?.meta?.language ?? "vi",
		thumbnailUrl: data?.meta?.thumbnailUrl ?? "",
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

// Reusable media item editor: handles text / image (url+upload) / audio (url+upload)
const MediaItemEditor = ({
	label,
	type,
	value,
	onTypeChange,
	onValueChange,
}: {
	label: string;
	type: PairForm["leftType"];
	value: string;
	onTypeChange: (t: PairForm["leftType"]) => void;
	onValueChange: (v: string) => void;
}) => {
	const [uploading, setUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileUpload = async (file: File) => {
		setUploading(true);
		try {
			const res = await adminMatchingGameApi.uploadMedia(file);
			const url = res.data.data;
			if (url) onValueChange(url);
		} catch {
			toast.error("Không thể tải file lên");
		} finally {
			setUploading(false);
		}
	};

	const itemTypeOptions = (
		<>
			<SelectItem value="text">Văn bản</SelectItem>
			<SelectItem value="image">Hình ảnh</SelectItem>
			<SelectItem value="audio">Âm thanh</SelectItem>
		</>
	);

	return (
		<div className="space-y-2">
			<Label className="text-xs">{label}</Label>
			<Select
				value={type}
				onValueChange={(v) => onTypeChange(v as PairForm["leftType"])}
			>
				<SelectTrigger className="text-xs">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>{itemTypeOptions}</SelectContent>
			</Select>

			{type === "text" ? (
				<Textarea
					className="min-h-20 text-xs"
					placeholder="Nội dung văn bản..."
					value={value}
					onChange={(e) => onValueChange(e.target.value)}
				/>
			) : type === "image" ? (
				<div className="space-y-2">
					<Input
						className="text-xs"
						placeholder="https://example.com/image.png"
						value={value}
						onChange={(e) => onValueChange(e.target.value)}
					/>
					<div className="flex items-center gap-2">
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							className="hidden"
							onChange={(e) => {
								const file = e.target.files?.[0];
								if (file) void handleFileUpload(file);
								e.target.value = "";
							}}
						/>
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="h-7 gap-1 text-xs"
							disabled={uploading}
							onClick={() => fileInputRef.current?.click()}
						>
							{uploading ? (
								<Loader2Icon className="h-3 w-3 animate-spin" />
							) : (
								<Upload className="h-3 w-3" />
							)}
							{uploading ? "Đang tải..." : "Tải ảnh lên"}
						</Button>
					</div>
					{value ? (
						<div className="overflow-hidden rounded-lg border bg-muted/20">
							<img
								src={value}
								alt="preview"
								className="h-28 w-full object-contain"
								onError={(e) => {
									(e.currentTarget as HTMLImageElement).style.display = "none";
								}}
							/>
						</div>
					) : null}
				</div>
			) : (
				<div className="space-y-2">
					<Input
						className="text-xs"
						placeholder="https://example.com/audio.mp3"
						value={value}
						onChange={(e) => onValueChange(e.target.value)}
					/>
					<div className="flex items-center gap-2">
						<input
							ref={fileInputRef}
							type="file"
							accept="audio/*"
							className="hidden"
							onChange={(e) => {
								const file = e.target.files?.[0];
								if (file) void handleFileUpload(file);
								e.target.value = "";
							}}
						/>
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="h-7 gap-1 text-xs"
							disabled={uploading}
							onClick={() => fileInputRef.current?.click()}
						>
							{uploading ? (
								<Loader2Icon className="h-3 w-3 animate-spin" />
							) : (
								<Music className="h-3 w-3" />
							)}
							{uploading ? "Đang tải..." : "Tải audio lên"}
						</Button>
					</div>
					{value ? (
						// biome-ignore lint/a11y/useMediaCaption: preview only
						<audio controls src={value} className="w-full" />
					) : null}
				</div>
			)}
		</div>
	);
};

const PairEditor = ({
	pair,
	index,
	onUpdate,
	onRemove,
	canRemove,
}: PairEditorProps) => {
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
				<MediaItemEditor
					label="Nội dung bên trái"
					type={pair.leftType}
					value={pair.leftValue}
					onTypeChange={(t) =>
						onUpdate({ ...pair, leftType: t, leftValue: "" })
					}
					onValueChange={(v) => onUpdate({ ...pair, leftValue: v })}
				/>
				<MediaItemEditor
					label="Nội dung bên phải"
					type={pair.rightType}
					value={pair.rightValue}
					onTypeChange={(t) =>
						onUpdate({ ...pair, rightType: t, rightValue: "" })
					}
					onValueChange={(v) => onUpdate({ ...pair, rightValue: v })}
				/>
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
	gameId?: number;
	grade?: number;
	topicCode?: string;
};

export function MatchingGameEditorPage({
	mode,
	gameId,
	grade,
	topicCode,
}: MatchingGameEditorPageProps) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const isCreateMode = mode === "create";
	const normalizedTopicCode = topicCode?.toUpperCase();
	const { data, isLoading } = useMatchingGameDetail(
		{
			gameId,
			grade,
			topicCode: normalizedTopicCode,
		},
		!isCreateMode &&
			(gameId !== undefined ||
				(grade !== undefined && Boolean(normalizedTopicCode))),
	);
	const upsertGame = useUpsertMatchingGame();
	const deleteGame = useDeleteMatchingGame();
	const approveGame = useApproveGame();
	const rejectGame = useRejectGame();
	const [form, setForm] = useState<GameForm>(defaultForm());
	const [thumbnailFile, setThumbnailFile] = useState<File | undefined>(
		undefined,
	);
	const matchingGameId = data?.meta?.gameId ?? gameId;
	const resolvedGrade = data?.meta?.grade ?? grade;
	const resolvedTopicCode =
		data?.meta?.topicCode?.toUpperCase() ?? normalizedTopicCode;

	useEffect(() => {
		if (isCreateMode) {
			setForm(defaultForm());
			return;
		}
		if (!data || resolvedGrade === undefined || !resolvedTopicCode) return;
		setForm(apiToForm(resolvedGrade, resolvedTopicCode, data));
	}, [data, isCreateMode, resolvedGrade, resolvedTopicCode]);

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
			const savedGame = await upsertGame.mutateAsync({
				grade: form.grade,
				topicCode: nextTopicCode,
				meta: {
					gameId: matchingGameId,
					title: buildTitle(form.grade, nextTopicCode, form.topicName),
					version: form.metaVersion || "1.0.0",
					language: form.metaLanguage || "vi",
					thumbnailUrl: form.thumbnailUrl || undefined,
				},
				stages: formToStages(form.stages),
			});

			// Upload thumbnail file if provided (uses /admin/games/{id} multipart endpoint)
			const savedGameId = savedGame.meta.gameId;
			if (thumbnailFile && savedGameId !== undefined) {
				try {
					await adminGamesApi.updateGame(savedGameId, {
						title:
							savedGame.meta.title ??
							buildTitle(form.grade, nextTopicCode, form.topicName),
						desc: "",
						thumbnail: thumbnailFile,
					});
					setThumbnailFile(undefined);
				} catch {
					toast.warning(
						"Lưu game thành công nhưng không thể tải thumbnail lên",
					);
				}
			}

			toast.success(
				isCreateMode
					? "Tạo matching game thành công"
					: "Cập nhật matching game thành công",
			);
			if (savedGameId !== undefined) {
				navigate({
					to: "/apps/games/matching",
					search: {
						gameId: savedGameId,
						grade: savedGame.meta.grade ?? form.grade,
						topic: savedGame.meta.topicCode ?? nextTopicCode,
					},
				});
			}
		} catch (error: unknown) {
			toast.error(getErrorMessage(error, "Không thể lưu matching game"));
		}
	};

	const handleDelete = async () => {
		if (matchingGameId === undefined) return;
		const gradeLabel = resolvedGrade ?? form.grade;
		const topicLabel = resolvedTopicCode ?? form.topicCode.toUpperCase();
		if (
			!confirm(
				`Xoá matching game #${matchingGameId} · Lớp ${gradeLabel} - Chủ đề ${topicLabel}?`,
			)
		) {
			return;
		}
		try {
			await deleteGame.mutateAsync({ gameId: matchingGameId });
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
	const currentStatus = isCreateMode ? ("DRAFT" as const) : data?.status;
	const previewSearch =
		!isCreateMode && matchingGameId !== undefined
			? {
					gameId: matchingGameId,
					grade: resolvedGrade,
					topic: resolvedTopicCode,
				}
			: undefined;
	const playUrl =
		!isCreateMode &&
		matchingGameId !== undefined &&
		currentStatus === "PUBLISHED"
			? getMatchingGamePlayUrl({
					gameId: matchingGameId,
					grade: resolvedGrade,
					topicCode: resolvedTopicCode,
				})
			: undefined;

	const refreshMatchingQueries = async () => {
		await Promise.all([
			queryClient.invalidateQueries({
				queryKey: MATCHING_GAME_KEYS.mappings(),
			}),
			matchingGameId !== undefined
				? queryClient.invalidateQueries({
						queryKey: MATCHING_GAME_KEYS.detail({
							gameId: matchingGameId,
							grade: resolvedGrade,
							topicCode: resolvedTopicCode,
						}),
					})
				: Promise.resolve(),
		]);
	};

	const handleApprove = async () => {
		if (isCreateMode || matchingGameId === undefined) {
			return;
		}
		try {
			await approveGame.mutateAsync(matchingGameId);
			await refreshMatchingQueries();
			toast.success("Matching game đã được duyệt và xuất bản");
		} catch (error: unknown) {
			toast.error(getErrorMessage(error, "Không thể duyệt matching game"));
		}
	};

	const handleReject = async () => {
		if (isCreateMode || matchingGameId === undefined) {
			return;
		}
		try {
			await rejectGame.mutateAsync(matchingGameId);
			await refreshMatchingQueries();
			toast.success("Matching game đã được chuyển về trạng thái nháp");
		} catch (error: unknown) {
			toast.error(
				getErrorMessage(error, "Không thể chuyển matching game về nháp"),
			);
		}
	};

	if (
		!isCreateMode &&
		gameId === undefined &&
		(grade === undefined || !normalizedTopicCode)
	) {
		return (
			<div className="p-6 text-destructive">
				Thiếu `gameId` hoặc `grade/topic` trong URL.
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
							<div className="grid gap-4 md:grid-cols-2">
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
											{Array.from({ length: 10 }, (_, index) => index + 3).map(
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

							<div className="space-y-2">
								<Label>Thumbnail</Label>
								<div className="space-y-3">
									<Input
										placeholder="https://example.com/thumbnail.png"
										value={form.thumbnailUrl}
										onChange={(e) =>
											setForm((prev) => ({
												...prev,
												thumbnailUrl: e.target.value,
											}))
										}
									/>
									<p className="text-xs text-muted-foreground">
										Nhập URL ảnh có sẵn, hoặc tải ảnh mới bên dưới (ảnh tải lên
										sẽ được ưu tiên).
									</p>
									<div className="rounded-xl border border-dashed p-4">
										<div className="mb-3 flex items-center gap-2 text-sm font-medium">
											<FileImage className="h-4 w-4 text-sky-600" />
											Tải ảnh thumbnail
										</div>
										<Input
											type="file"
											accept="image/*"
											onChange={(e) =>
												setThumbnailFile(e.target.files?.[0] ?? undefined)
											}
										/>
										{thumbnailFile ? (
											<p className="mt-2 text-xs text-muted-foreground">
												Đã chọn: {thumbnailFile.name}
											</p>
										) : null}
									</div>
									{form.thumbnailUrl && !thumbnailFile ? (
										<div className="overflow-hidden rounded-lg border bg-muted/20">
											<img
												src={form.thumbnailUrl}
												alt="Thumbnail preview"
												className="h-40 w-full object-cover"
												onError={(e) => {
													(e.currentTarget as HTMLImageElement).style.display =
														"none";
												}}
											/>
										</div>
									) : null}
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
								Xem trước, duyệt và quản lý trạng thái xuất bản của trò chơi.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4 pt-6">
							<div className="space-y-3 rounded-xl border bg-muted/20 p-4 text-sm">
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">ID game</span>
									<Badge variant="outline">
										{matchingGameId !== undefined
											? `#${matchingGameId}`
											: "Mới"}
									</Badge>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">
										Slot chương trình học
									</span>
									<Badge variant="outline">
										L{form.grade}-{form.topicCode || "A"}
									</Badge>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">Trạng thái</span>
									<Badge variant={getStatusVariant(currentStatus)}>
										{isCreateMode
											? "Bản nháp mới"
											: getStatusLabel(currentStatus)}
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
										? "Tạo trò chơi"
										: "Lưu thay đổi"}
							</Button>

							{previewSearch ? (
								<Button asChild className="w-full" variant="outline">
									<Link
										to="/apps/games/matching/preview"
										search={previewSearch}
									>
										<LayoutGrid className="mr-2 h-4 w-4" />
										Xem thử nội bộ
									</Link>
								</Button>
							) : null}

							{playUrl ? (
								<Button asChild className="w-full" variant="outline">
									<a href={playUrl} target="_blank" rel="noreferrer">
										<ExternalLink className="mr-2 h-4 w-4" />
										Mở bản chơi công khai
									</a>
								</Button>
							) : null}

							{!isCreateMode && currentStatus === "DRAFT" ? (
								<p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
									Bản nháp có thể xem qua nút preview nội bộ. Bản công khai chỉ
									mở sau khi duyệt và xuất bản.
								</p>
							) : null}

							{!isCreateMode && currentStatus === "DRAFT" ? (
								<Button
									className="w-full"
									variant="outline"
									onClick={() => void handleApprove()}
									disabled={
										approveGame.isPending || matchingGameId === undefined
									}
								>
									<Send className="mr-2 h-4 w-4" />
									Duyệt và xuất bản
								</Button>
							) : null}

							{!isCreateMode && currentStatus === "PUBLISHED" ? (
								<Button
									className="w-full"
									variant="outline"
									onClick={() => void handleReject()}
									disabled={
										rejectGame.isPending || matchingGameId === undefined
									}
								>
									Chuyển về nháp
								</Button>
							) : null}

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
