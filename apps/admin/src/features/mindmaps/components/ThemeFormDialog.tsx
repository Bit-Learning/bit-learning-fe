import { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { PlusIcon, XIcon } from "lucide-react";
import { ThumbnailUpload } from "./ThumbnailUpload";
import { MindMapThemeRequest, ThemeConfigDto } from "../types/mindmap.type";

interface ThemeFormDialogProps {
	open: boolean;
	editTarget?: ThemeConfigDto;
	isPending?: boolean;
	onSubmit: (data: MindMapThemeRequest, thumbnail: File | null) => void;
	onClose: () => void;
}

const EMPTY: MindMapThemeRequest = {
	name: "",
	description: "",
	colors: [],
	node_styles: {},
	edge_style: {},
	background: "#ffffff",
	is_active: true,
};

export function ThemeFormDialog({
	open,
	editTarget,
	isPending,
	onSubmit,
	onClose,
}: ThemeFormDialogProps) {
	const [form, setForm] = useState<MindMapThemeRequest>(EMPTY);
	const [thumbnail, setThumbnail] = useState<File | null>(null);
	const [newColor, setNewColor] = useState("#000000");
	const [nodeStylesRaw, setNodeStylesRaw] = useState("{}");
	const [edgeStyleRaw, setEdgeStyleRaw] = useState("{}");
	const [nodeStylesError, setNodeStylesError] = useState<string>();
	const [edgeStyleError, setEdgeStyleError] = useState<string>();

	useEffect(() => {
		if (editTarget) {
			setForm({
				name: editTarget.name,
				description: editTarget.description ?? "",
				thumbnail_url: editTarget.thumbnailUrl,
				colors: editTarget.colors ?? [],
				node_styles: editTarget.nodeStyles ?? {},
				edge_style: editTarget.edgeStyle ?? {},
				background: editTarget.background ?? "#ffffff",
				is_active: editTarget.isActive,
			});
			setNodeStylesRaw(JSON.stringify(editTarget.nodeStyles ?? {}, null, 2));
			setEdgeStyleRaw(JSON.stringify(editTarget.edgeStyle ?? {}, null, 2));
		} else {
			setForm(EMPTY);
			setNodeStylesRaw("{}");
			setEdgeStyleRaw("{}");
		}
		setThumbnail(null);
		setNodeStylesError(undefined);
		setEdgeStyleError(undefined);
	}, [editTarget, open]);

	const handleNodeStylesChange = (raw: string) => {
		setNodeStylesRaw(raw);
		setNodeStylesError(undefined);
	};

	const handleNodeStylesBlur = () => {
		try {
			setForm((f) => ({ ...f, node_styles: JSON.parse(nodeStylesRaw) }));
			setNodeStylesError(undefined);
		} catch {
			setNodeStylesError("JSON không hợp lệ");
		}
	};

	const handleEdgeStyleChange = (raw: string) => {
		setEdgeStyleRaw(raw);
		setEdgeStyleError(undefined);
	};

	const handleEdgeStyleBlur = () => {
		try {
			setForm((f) => ({ ...f, edge_style: JSON.parse(edgeStyleRaw) }));
			setEdgeStyleError(undefined);
		} catch {
			setEdgeStyleError("JSON không hợp lệ");
		}
	};

	const addColor = () => {
		if (!form.colors?.includes(newColor)) {
			setForm((f) => ({ ...f, colors: [...(f.colors ?? []), newColor] }));
		}
	};

	const removeColor = (c: string) => {
		setForm((f) => ({ ...f, colors: f.colors?.filter((x) => x !== c) }));
	};

	const handleSubmit = () => {
		let valid = true;

		try {
			const parsedNode = JSON.parse(nodeStylesRaw);
			setForm((f) => ({ ...f, node_styles: parsedNode }));
			setNodeStylesError(undefined);
		} catch {
			setNodeStylesError("JSON không hợp lệ");
			valid = false;
		}

		try {
			const parsedEdge = JSON.parse(edgeStyleRaw);
			setForm((f) => ({ ...f, edge_style: parsedEdge }));
			setEdgeStyleError(undefined);
		} catch {
			setEdgeStyleError("JSON không hợp lệ");
			valid = false;
		}

		if (!valid) return;
		onSubmit(form, thumbnail);
	};

	const hasError = !!nodeStylesError || !!edgeStyleError;

	return (
		<Dialog open={open} onOpenChange={(v) => !v && onClose()}>
			<DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{editTarget ? "Cập nhật Theme" : "Tạo Theme mới"}
					</DialogTitle>
				</DialogHeader>

				<div className="grid gap-4 py-2">
					<div className="space-y-1.5">
						<Label>Thumbnail</Label>
						<ThumbnailUpload
							value={thumbnail}
							previewUrl={editTarget?.thumbnailUrl}
							onChange={setThumbnail}
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="t-name">
							Tên <span className="text-destructive">*</span>
						</Label>
						<Input
							id="t-name"
							value={form.name}
							onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
							placeholder="vd: Indigo Light, Dark Ocean, Sunset Orange..."
						/>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="t-desc">Mô tả</Label>
						<Textarea
							id="t-desc"
							rows={2}
							value={form.description}
							onChange={(e) =>
								setForm((f) => ({ ...f, description: e.target.value }))
							}
							placeholder="vd: Tím nhạt, phong cách học thuật, phù hợp ghi chú"
						/>
					</div>

					<div className="space-y-1.5">
						<Label>Colors</Label>
						<div className="flex flex-wrap gap-2">
							{form.colors?.map((c) => (
								<div
									key={c}
									className="flex items-center gap-1 rounded-full border px-2 py-1"
								>
									<span
										className="h-4 w-4 rounded-full"
										style={{ background: c }}
									/>
									<span className="text-xs">{c}</span>
									<button
										type="button"
										onClick={() => removeColor(c)}
										className="text-muted-foreground hover:text-foreground"
									>
										<XIcon className="h-3 w-3" />
									</button>
								</div>
							))}
						</div>
						<div className="flex items-center gap-2">
							<input
								type="color"
								value={newColor}
								onChange={(e) => setNewColor(e.target.value)}
								className="h-9 w-12 cursor-pointer rounded border p-1"
							/>
							<Input
								value={newColor}
								onChange={(e) => setNewColor(e.target.value)}
								className="w-28 font-mono text-sm"
							/>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={addColor}
							>
								<PlusIcon className="mr-1 h-3.5 w-3.5" />
								Thêm
							</Button>
						</div>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="t-bg">Background</Label>
						<div className="flex items-center gap-2">
							<input
								type="color"
								value={form.background ?? "#ffffff"}
								onChange={(e) =>
									setForm((f) => ({ ...f, background: e.target.value }))
								}
								className="h-9 w-12 cursor-pointer rounded border p-1"
							/>
							<Input
								id="t-bg"
								value={form.background}
								onChange={(e) =>
									setForm((f) => ({ ...f, background: e.target.value }))
								}
								className="w-32 font-mono text-sm"
							/>
						</div>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="t-node">Node Styles (JSON)</Label>
						<Textarea
							id="t-node"
							rows={6}
							className="font-mono text-xs"
							value={nodeStylesRaw}
							onChange={(e) => handleNodeStylesChange(e.target.value)}
							onBlur={handleNodeStylesBlur}
							placeholder={`vd:\n{\n  "root": { "background": "#4f46e5", "color": "#fff", "borderRadius": "12px" },\n  "branch": { "background": "#6366f1", "color": "#fff", "borderRadius": "8px" },\n  "leaf": { "background": "#e0e7ff", "color": "#3730a3", "borderRadius": "6px" }\n}`}
						/>
						{nodeStylesError && (
							<p className="text-destructive text-xs">{nodeStylesError}</p>
						)}
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="t-edge">Edge Style (JSON)</Label>
						<Textarea
							id="t-edge"
							rows={4}
							className="font-mono text-xs"
							value={edgeStyleRaw}
							onChange={(e) => handleEdgeStyleChange(e.target.value)}
							onBlur={handleEdgeStyleBlur}
							placeholder={`vd:\n{\n  "stroke": "#6366f1",\n  "strokeWidth": 2,\n  "animated": false\n}`}
						/>
						{edgeStyleError && (
							<p className="text-destructive text-xs">{edgeStyleError}</p>
						)}
					</div>

					<div className="flex items-center justify-between">
						<Label htmlFor="t-active">Active</Label>
						<Switch
							id="t-active"
							checked={form.is_active ?? true}
							onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onClose} disabled={isPending}>
						Hủy
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={isPending || !form.name || hasError}
					>
						{isPending ? "Đang lưu..." : editTarget ? "Cập nhật" : "Tạo mới"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
