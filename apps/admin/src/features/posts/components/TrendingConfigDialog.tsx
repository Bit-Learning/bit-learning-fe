import { useEffect, useState } from "react";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
	useGetTrendingConfig,
	useUpdateTrendingConfig,
} from "../queries/useTrendingConfig";
import type { UpdateTrendingConfigRequest } from "../apis/trending-config.api";

export function TrendingConfigDialog() {
	const [open, setOpen] = useState(false);
	const { data: config, isLoading } = useGetTrendingConfig();
	const { mutate: updateConfig, isPending } = useUpdateTrendingConfig();

	const [form, setForm] = useState<UpdateTrendingConfigRequest>({
		lookbackDays: 14,
		minScore: 5.0,
		commentWeight: 4.0,
		reactionWeight: 3.0,
		viewWeight: 0.1,
	});

	useEffect(() => {
		if (config) {
			setForm({
				lookbackDays: config.lookbackDays,
				minScore: config.minScore,
				commentWeight: config.commentWeight,
				reactionWeight: config.reactionWeight,
				viewWeight: config.viewWeight,
			});
		}
	}, [config]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		updateConfig(form, { onSuccess: () => setOpen(false) });
	};

	const field = (
		label: string,
		key: keyof UpdateTrendingConfigRequest,
		hint?: string,
	) => (
		<div className="space-y-1.5">
			<Label htmlFor={key}>{label}</Label>
			<Input
				id={key}
				type="number"
				step="any"
				min={0}
				value={form[key]}
				onChange={(e) =>
					setForm((prev) => ({ ...prev, [key]: Number(e.target.value) }))
				}
			/>
			{hint && <p className="text-xs text-muted-foreground">{hint}</p>}
		</div>
	);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" className="gap-1.5">
					<Settings2 className="h-4 w-4" />
					Cấu hình Trending
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Cấu hình thuật toán Trending</DialogTitle>
				</DialogHeader>

				{isLoading ? (
					<div className="space-y-4">
						{[1, 2, 3, 4, 5].map((i) => (
							<Skeleton key={i} className="h-10 w-full" />
						))}
					</div>
				) : (
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="rounded-md bg-muted/50 px-3 py-2 font-mono text-xs text-muted-foreground">
							score = bình luận × {form.commentWeight} + reaction ×{" "}
							{form.reactionWeight} + lượt xem × {form.viewWeight}
						</div>

						{field(
							"Khoảng thời gian (ngày)",
							"lookbackDays",
							"Chỉ xét bài viết được tạo trong N ngày gần nhất",
						)}
						{field(
							"Điểm tối thiểu",
							"minScore",
							"Bài phải đạt ít nhất điểm này mới được trending",
						)}
						{field("Trọng số bình luận", "commentWeight")}
						{field("Trọng số reaction", "reactionWeight")}
						{field("Trọng số lượt xem", "viewWeight")}

						<div className="flex justify-end gap-2 pt-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
							>
								Hủy
							</Button>
							<Button type="submit" disabled={isPending}>
								{isPending ? "Đang lưu..." : "Lưu"}
							</Button>
						</div>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
