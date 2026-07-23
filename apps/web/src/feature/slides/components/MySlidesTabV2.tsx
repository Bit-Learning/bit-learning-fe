import React, { useMemo, useState } from "react";
import {
	Calendar,
	ChevronLeft,
	ChevronRight,
	Code,
	Download,
	Eye,
	FolderOpen,
	Loader2,
	Plus,
	Search,
	Trash2,
} from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import DeleteConfirmModal from "@/shared/components/DeleteConfirmModal";
import { useDeleteSlide, useMySlides } from "../queries/useSlide";
import type { SlideGenerationResponse } from "../types/slide.type";

interface MySlidesTabV2Props {
	onViewDetail: (slide: SlideGenerationResponse) => void;
	onSwitchToCreate: () => void;
}

export const MySlidesTabV2: React.FC<MySlidesTabV2Props> = ({
	onViewDetail,
	onSwitchToCreate,
}) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [page, setPage] = useState(0);
	const [deletingSlide, setDeletingSlide] =
		useState<SlideGenerationResponse | null>(null);
	const pageSize = 10;

	const { data, isLoading, isError } = useMySlides(page, pageSize);
	const deleteSlide = useDeleteSlide();

	const springPage = data?.data as any;
	const slides: SlideGenerationResponse[] = springPage?.content || [];
	const pageInfo = springPage;

	const filteredSlides = useMemo(
		() =>
			Array.isArray(slides)
				? slides.filter((slide) =>
						slide.topic.toLowerCase().includes(searchQuery.toLowerCase()),
					)
				: [],
		[slides, searchQuery],
	);

	const cachedCount = filteredSlides.filter((slide) => slide.fromCache).length;

	const handleConfirmDelete = () => {
		if (!deletingSlide) {
			return;
		}

		deleteSlide.mutate(deletingSlide.id, {
			onSettled: () => setDeletingSlide(null),
		});
	};

	const handleDownload = (slide: SlideGenerationResponse) => {
		if (slide.cloudinaryUrl) {
			window.open(slide.cloudinaryUrl, "_blank");
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-16">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<span className="ml-3 text-slate-600">Đang tải danh sách slide...</span>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
				<p className="font-medium text-red-700">
					Không thể tải danh sách slide. Vui lòng thử lại.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
				<div className="border-b border-slate-100 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.10),_transparent_42%),linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-6 py-6 md:px-8">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
						<div className="max-w-2xl">
							<div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600">
								<FolderOpen size={14} />
								Thư viện slide
							</div>
							<h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
								Các bộ slide đã tạo
							</h2>
							<p className="mt-2 text-sm leading-6 text-slate-600 md:text-base">
								Quản lý deck đã sinh, mở chi tiết nhanh, tải xuống hoặc xóa khỏi
								thư viện của bạn.
							</p>
						</div>

						<div className="grid grid-cols-2 gap-2 sm:w-fit">
							<div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
								<p className="text-xs uppercase tracking-[0.18em] text-slate-400">
									Tổng
								</p>
								<p className="mt-1 text-lg font-semibold text-slate-900">
									{slides.length}
								</p>
							</div>
							<div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
								<p className="text-xs uppercase tracking-[0.18em] text-slate-400">
									Hiển thị
								</p>
								<p className="mt-1 text-lg font-semibold text-slate-900">
									{filteredSlides.length}
								</p>
							</div>
						</div>
					</div>
				</div>

				<div className="space-y-6 px-6 py-6 md:px-8">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
						<div className="relative w-full lg:max-w-xl">
							<Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
							<input
								placeholder="Tìm theo chủ đề slide..."
								value={searchQuery}
								onChange={(event) => setSearchQuery(event.target.value)}
								className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-900 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
							/>
						</div>

						<Button
							className="cursor-pointer rounded-2xl bg-blue-600 px-5 py-6 text-white shadow-sm shadow-blue-500/30 transition-all hover:border-blue-600 hover:bg-white hover:text-blue-600"
							onClick={onSwitchToCreate}
						>
							<Plus size={18} />
							Tạo mới
						</Button>
					</div>

					{filteredSlides.length === 0 ? (
						<div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-16 text-center">
							<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
								<Search size={30} className="text-slate-300" />
							</div>
							<p className="mt-4 text-base font-semibold text-slate-700">
								Không tìm thấy slide nào
							</p>
							<p className="mt-1 text-sm text-slate-500">
								Thử một từ khóa khác hoặc tạo bộ slide mới từ đầu.
							</p>
						</div>
					) : (
						<div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
							{filteredSlides.map((slide) => (
								<article
									key={slide.id}
									className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
								>
									<div className="flex items-start justify-between gap-4">
										<div className="flex min-w-0 items-start gap-3">
											<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
												<Code size={22} />
											</div>
											<div className="min-w-0">
												<h3 className="line-clamp-2 text-lg font-semibold text-slate-900">
													{slide.topic}
												</h3>
												<p className="mt-1 text-sm text-slate-500">
													{slide.templateName}
												</p>
											</div>
										</div>

										{slide.fromCache && (
											<span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
												<span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
												Cache
											</span>
										)}
									</div>

									<div className="mt-5 grid grid-cols-2 gap-3">
										<div className="rounded-2xl bg-slate-50 px-4 py-3">
											<p className="text-xs uppercase tracking-[0.14em] text-slate-400">
												Số slide
											</p>
											<p className="mt-1 text-base font-semibold text-slate-900">
												{slide.slideCount}
											</p>
										</div>
										<div className="rounded-2xl bg-slate-50 px-4 py-3">
											<p className="text-xs uppercase tracking-[0.14em] text-slate-400">
												Ngày tạo
											</p>
											<p className="mt-1 flex items-center gap-1 text-sm font-medium text-slate-700">
												<Calendar size={14} />
												{new Date(slide.generatedAt).toLocaleDateString(
													"vi-VN",
													{
														year: "numeric",
														month: "2-digit",
														day: "2-digit",
													},
												)}
											</p>
										</div>
									</div>

									<div className="mt-5 flex flex-wrap gap-2">
										<button
											className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
											title="Download PPTX"
											onClick={() => handleDownload(slide)}
										>
											<Download size={16} />
											Tải xuống
										</button>
										<button
											className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
											title="Xem chi tiết"
											onClick={() => onViewDetail(slide)}
										>
											<Eye size={16} />
											Xem chi tiết
										</button>
										<button
											className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
											title="Xóa"
											onClick={() => setDeletingSlide(slide)}
											disabled={deleteSlide.isPending}
										>
											<Trash2 size={16} />
											Xóa
										</button>
									</div>
								</article>
							))}
						</div>
					)}
				</div>
			</section>

			{filteredSlides.length > 0 && pageInfo && pageInfo.totalPages > 1 && (
				<div className="mt-2 flex items-center justify-center gap-2">
					<button
						className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-800 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
						onClick={() => setPage((previous) => Math.max(0, previous - 1))}
						disabled={page === 0}
					>
						<ChevronLeft size={20} />
					</button>
					{[...Array(Math.min(pageInfo.totalPages, 10))].map((_, index) => {
						const shouldShow =
							index < 3 ||
							index >= pageInfo.totalPages - 3 ||
							Math.abs(index - page) <= 1;
						if (!shouldShow) {
							if (index === 3) {
								return (
									<span key={index} className="px-2 text-slate-400">
										...
									</span>
								);
							}
							return null;
						}
						return (
							<button
								key={index}
								className={`flex h-10 w-10 items-center justify-center rounded-xl font-medium transition-colors ${
									page === index
										? "bg-primary text-white shadow-lg shadow-blue-500/30"
										: "border border-slate-200 text-slate-600 hover:bg-slate-100"
								}`}
								onClick={() => setPage(index)}
							>
								{index + 1}
							</button>
						);
					})}
					<button
						className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-800 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
						onClick={() =>
							setPage((previous) =>
								Math.min(pageInfo.totalPages - 1, previous + 1),
							)
						}
						disabled={page === pageInfo.totalPages - 1}
					>
						<ChevronRight size={20} />
					</button>
				</div>
			)}

			<DeleteConfirmModal
				open={!!deletingSlide}
				onClose={() => setDeletingSlide(null)}
				onConfirm={handleConfirmDelete}
				isPending={deleteSlide.isPending}
				title="Xóa slide"
				itemName={deletingSlide?.topic}
			/>
		</div>
	);
};
