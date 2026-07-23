import React, { useState } from "react";
import { BookMarked, X, Check, ArrowRight } from "lucide-react";
import { useAllCategories } from "@/feature/course/queries/useCourse";
import { useUpdateFavoriteCategories } from "@/feature/user/queries/useUser";
import { Button } from "@workspace/ui/components/Button";

interface FavoriteCategoriesModalProps {
	currentCategories?: string[];
	onClose: () => void;
	isOnboarding?: boolean;
}

export const FavoriteCategoriesModal: React.FC<
	FavoriteCategoriesModalProps
> = ({ currentCategories = [], onClose, isOnboarding = false }) => {
	const { data: categories = [], isLoading } = useAllCategories();
	const updateMutation = useUpdateFavoriteCategories();

	const [selected, setSelected] = useState<Set<string>>(
		new Set(currentCategories),
	);

	const toggle = (cat: string) => {
		setSelected((prev) => {
			const next = new Set(prev);
			next.has(cat) ? next.delete(cat) : next.add(cat);
			return next;
		});
	};

	const handleSave = async () => {
		await updateMutation.mutateAsync([...selected]);
		onClose();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
			<div className="relative w-full max-w-xl rounded-2xl bg-white shadow-xl overflow-hidden">
				<div className="px-6 pt-6 pb-4 border-b border-slate-100">
					<div className="flex items-start justify-between gap-3">
						<div className="flex items-center gap-3">
							<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
								<BookMarked className="h-5 w-5 text-slate-600" />
							</div>
							<div>
								<h2 className="text-lg font-semibold text-slate-800 leading-tight">
									Bạn thích học gì?
								</h2>
								<p className="text-sm text-slate-400 mt-0.5">
									Chọn để nhận gợi ý khóa học phù hợp
								</p>
							</div>
						</div>
						{!isOnboarding && (
							<button
								onClick={onClose}
								className="rounded-md p-1 hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
							>
								<X className="h-4 w-4" />
							</button>
						)}
					</div>
				</div>

				<div className="px-6 py-5">
					{isLoading ? (
						<div className="flex items-center justify-center py-10 gap-2 text-slate-400">
							<div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500" />
							<span className="text-sm">Đang tải...</span>
						</div>
					) : (
						<>
							<p className="text-xs text-slate-400 mb-3 uppercase tracking-wide font-medium">
								Đã chọn {selected.size} / {categories.length} danh mục
							</p>
							<div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
								{categories.map((cat) => {
									const active = selected.has(cat);
									return (
										<button
											key={cat}
											type="button"
											onClick={() => toggle(cat)}
											className={`
												cursor-pointer inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5
												text-sm font-medium border transition-all duration-100 select-none
												${
													active
														? "bg-slate-800 text-white border-slate-800"
														: "bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-800"
												}
											`}
										>
											{active && <Check className="h-3 w-3 shrink-0" />}
											{cat}
										</button>
									);
								})}
							</div>
						</>
					)}
				</div>

				<div className="flex items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
					<button
						onClick={onClose}
						disabled={updateMutation.isPending}
						className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
					>
						{isOnboarding ? "Bỏ qua" : "Hủy"}
					</button>

					<Button
						onClick={handleSave}
						isDisabled={updateMutation.isPending || selected.size === 0}
						className="gap-2 bg-blue-600 hover:bg-slate-700 text-white min-w-28 p-5 text-md"
					>
						{updateMutation.isPending ? (
							<>
								<div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
								Đang lưu...
							</>
						) : (
							<>Lưu lại</>
						)}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default FavoriteCategoriesModal;
