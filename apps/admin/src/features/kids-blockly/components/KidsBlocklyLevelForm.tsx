import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, X } from "lucide-react";
import type {
	KidsBlocklyLevel,
	BlockType,
	Direction,
	Position,
	CharacterState,
} from "../api/kids-blockly.api";

const ALL_BLOCK_TYPES: BlockType[] = [
	"move",
	"left",
	"right",
	"back",
	"turnAround",
	"jump",
	"repeat",
];

const BLOCK_LABELS: Record<BlockType, string> = {
	move: "Tiến",
	left: "Rẽ trái",
	right: "Rẽ phải",
	back: "Lùi",
	turnAround: "Quay đầu",
	jump: "Nhảy",
	repeat: "Lặp",
};

const DIRECTIONS: Direction[] = ["N", "E", "S", "W"];
const DIRECTION_LABELS: Record<Direction, string> = {
	N: "Bắc (N)",
	E: "Đông (E)",
	S: "Nam (S)",
	W: "Tây (W)",
};

export interface LevelFormValues {
	id: string;
	order: number;
	title: string;
	subtitle: string;
	gridRows: number;
	gridCols: number;
	startX: number;
	startY: number;
	startDir: Direction;
	goalX: number;
	goalY: number;
	obstacles: Position[];
	allowedBlocks: BlockType[];
	hint: string;
	par: number;
	isPublished: boolean;
}

function defaultValues(): LevelFormValues {
	return {
		id: "",
		order: 1,
		title: "",
		subtitle: "",
		gridRows: 5,
		gridCols: 5,
		startX: 0,
		startY: 0,
		startDir: "E",
		goalX: 4,
		goalY: 0,
		obstacles: [],
		allowedBlocks: ["move", "left", "right"],
		hint: "",
		par: 3,
		isPublished: false,
	};
}

function levelToFormValues(level: KidsBlocklyLevel): LevelFormValues {
	return {
		id: level.id,
		order: level.order,
		title: level.title,
		subtitle: level.subtitle,
		gridRows: level.gridSize.rows,
		gridCols: level.gridSize.cols,
		startX: level.start.x,
		startY: level.start.y,
		startDir: level.start.dir,
		goalX: level.goal.x,
		goalY: level.goal.y,
		obstacles: level.obstacles,
		allowedBlocks: level.allowedBlocks,
		hint: level.hint,
		par: level.par,
		isPublished: level.isPublished,
	};
}

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	editingLevel?: KidsBlocklyLevel | null;
	onSubmit: (values: LevelFormValues) => void;
	isSubmitting?: boolean;
};

export function KidsBlocklyLevelForm({
	open,
	onOpenChange,
	editingLevel,
	onSubmit,
	isSubmitting = false,
}: Props) {
	const [values, setValues] = useState<LevelFormValues>(defaultValues());
	const [obstacleInput, setObstacleInput] = useState("");

	const isEditing = !!editingLevel;

	useEffect(() => {
		if (open) {
			setValues(
				editingLevel ? levelToFormValues(editingLevel) : defaultValues(),
			);
			setObstacleInput("");
		}
	}, [open, editingLevel]);

	const set = <K extends keyof LevelFormValues>(
		key: K,
		value: LevelFormValues[K],
	) => setValues((prev) => ({ ...prev, [key]: value }));

	const toggleBlock = (block: BlockType) => {
		setValues((prev) => ({
			...prev,
			allowedBlocks: prev.allowedBlocks.includes(block)
				? prev.allowedBlocks.filter((b) => b !== block)
				: [...prev.allowedBlocks, block],
		}));
	};

	const addObstacle = () => {
		const parts = obstacleInput.trim().split(/[,\s]+/);
		if (parts.length !== 2) return;
		const x = parseInt(parts[0], 10);
		const y = parseInt(parts[1], 10);
		if (isNaN(x) || isNaN(y)) return;
		const already = values.obstacles.some((o) => o.x === x && o.y === y);
		if (already) return;
		setValues((prev) => ({
			...prev,
			obstacles: [...prev.obstacles, { x, y }],
		}));
		setObstacleInput("");
	};

	const removeObstacle = (idx: number) => {
		setValues((prev) => ({
			...prev,
			obstacles: prev.obstacles.filter((_, i) => i !== idx),
		}));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(values);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{isEditing
							? `Chỉnh sửa màn chơi: ${editingLevel?.id}`
							: "Tạo màn chơi mới"}
					</DialogTitle>
					<DialogDescription>
						{isEditing
							? "Cập nhật nội dung, lưới, khối lệnh hoặc trạng thái xuất bản."
							: "Điền thông tin để tạo một màn chơi Kids Blockly mới."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-5">
					{/* ID & Order */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-1.5">
							<Label htmlFor="level-id">ID màn chơi</Label>
							<Input
								id="level-id"
								placeholder="vd: meadow-4"
								value={values.id}
								onChange={(e) => set("id", e.target.value)}
								disabled={isEditing}
								required={!isEditing}
							/>
							{isEditing && (
								<p className="text-xs text-muted-foreground">
									ID không thể thay đổi sau khi tạo.
								</p>
							)}
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="level-order">Thứ tự</Label>
							<Input
								id="level-order"
								type="number"
								min={1}
								value={values.order}
								onChange={(e) =>
									set("order", parseInt(e.target.value, 10) || 1)
								}
								required
							/>
						</div>
					</div>

					{/* Title & Subtitle */}
					<div className="space-y-1.5">
						<Label htmlFor="level-title">Tiêu đề</Label>
						<Input
							id="level-title"
							placeholder="vd: Qua cầu nhỏ"
							value={values.title}
							onChange={(e) => set("title", e.target.value)}
							required
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="level-subtitle">Mô tả ngắn</Label>
						<Input
							id="level-subtitle"
							placeholder="vd: Đi vòng qua chướng ngại vật."
							value={values.subtitle}
							onChange={(e) => set("subtitle", e.target.value)}
							required
						/>
					</div>

					{/* Grid size */}
					<div className="space-y-1.5">
						<Label>Kích thước lưới</Label>
						<div className="flex items-center gap-3">
							<div className="flex items-center gap-2">
								<span className="text-sm text-muted-foreground">Hàng</span>
								<Input
									type="number"
									min={2}
									max={12}
									className="w-20"
									value={values.gridRows}
									onChange={(e) =>
										set("gridRows", parseInt(e.target.value, 10) || 5)
									}
								/>
							</div>
							<span className="text-muted-foreground">×</span>
							<div className="flex items-center gap-2">
								<span className="text-sm text-muted-foreground">Cột</span>
								<Input
									type="number"
									min={2}
									max={12}
									className="w-20"
									value={values.gridCols}
									onChange={(e) =>
										set("gridCols", parseInt(e.target.value, 10) || 5)
									}
								/>
							</div>
						</div>
					</div>

					{/* Start position */}
					<div className="space-y-1.5">
						<Label>Vị trí xuất phát</Label>
						<div className="flex flex-wrap items-center gap-3">
							<div className="flex items-center gap-2">
								<span className="text-sm text-muted-foreground">X</span>
								<Input
									type="number"
									min={0}
									className="w-20"
									value={values.startX}
									onChange={(e) =>
										set("startX", parseInt(e.target.value, 10) || 0)
									}
								/>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-sm text-muted-foreground">Y</span>
								<Input
									type="number"
									min={0}
									className="w-20"
									value={values.startY}
									onChange={(e) =>
										set("startY", parseInt(e.target.value, 10) || 0)
									}
								/>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-sm text-muted-foreground">Hướng</span>
								<select
									className="h-9 rounded-md border border-input bg-background px-3 text-sm"
									value={values.startDir}
									onChange={(e) => set("startDir", e.target.value as Direction)}
								>
									{DIRECTIONS.map((d) => (
										<option key={d} value={d}>
											{DIRECTION_LABELS[d]}
										</option>
									))}
								</select>
							</div>
						</div>
					</div>

					{/* Goal position */}
					<div className="space-y-1.5">
						<Label>Vị trí đích</Label>
						<div className="flex items-center gap-3">
							<div className="flex items-center gap-2">
								<span className="text-sm text-muted-foreground">X</span>
								<Input
									type="number"
									min={0}
									className="w-20"
									value={values.goalX}
									onChange={(e) =>
										set("goalX", parseInt(e.target.value, 10) || 0)
									}
								/>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-sm text-muted-foreground">Y</span>
								<Input
									type="number"
									min={0}
									className="w-20"
									value={values.goalY}
									onChange={(e) =>
										set("goalY", parseInt(e.target.value, 10) || 0)
									}
								/>
							</div>
						</div>
					</div>

					{/* Obstacles */}
					<div className="space-y-1.5">
						<Label>Chướng ngại vật</Label>
						<div className="flex gap-2">
							<Input
								placeholder="x, y — vd: 2, 3"
								value={obstacleInput}
								onChange={(e) => setObstacleInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										addObstacle();
									}
								}}
								className="flex-1"
							/>
							<Button type="button" variant="outline" onClick={addObstacle}>
								Thêm
							</Button>
						</div>
						{values.obstacles.length > 0 && (
							<div className="flex flex-wrap gap-1.5 pt-1">
								{values.obstacles.map((o, idx) => (
									<Badge key={idx} variant="secondary" className="gap-1 pr-1">
										({o.x}, {o.y})
										<button
											type="button"
											onClick={() => removeObstacle(idx)}
											className="ml-0.5 rounded-full hover:text-destructive"
											aria-label="Xoá chướng ngại vật"
										>
											<X className="h-3 w-3" />
										</button>
									</Badge>
								))}
							</div>
						)}
					</div>

					{/* Allowed blocks */}
					<div className="space-y-1.5">
						<Label>Khối lệnh cho phép</Label>
						<div className="flex flex-wrap gap-3">
							{ALL_BLOCK_TYPES.map((block) => (
								<label
									key={block}
									className="flex cursor-pointer items-center gap-2 text-sm"
								>
									<Checkbox
										checked={values.allowedBlocks.includes(block)}
										onCheckedChange={() => toggleBlock(block)}
									/>
									{BLOCK_LABELS[block]}
								</label>
							))}
						</div>
					</div>

					{/* Hint */}
					<div className="space-y-1.5">
						<Label htmlFor="level-hint">Gợi ý</Label>
						<Textarea
							id="level-hint"
							placeholder="Gợi ý cho người chơi..."
							value={values.hint}
							onChange={(e) => set("hint", e.target.value)}
							rows={2}
						/>
					</div>

					{/* Par */}
					<div className="space-y-1.5">
						<Label htmlFor="level-par">Số khối lệnh chuẩn (par)</Label>
						<Input
							id="level-par"
							type="number"
							min={1}
							className="w-32"
							value={values.par}
							onChange={(e) => set("par", parseInt(e.target.value, 10) || 1)}
							required
						/>
					</div>

					{/* Published */}
					<label className="flex cursor-pointer items-center gap-2 text-sm">
						<Checkbox
							checked={values.isPublished}
							onCheckedChange={(v) => set("isPublished", !!v)}
						/>
						Xuất bản ngay
					</label>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}
						>
							Huỷ
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							{isEditing ? "Lưu thay đổi" : "Tạo màn chơi"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
