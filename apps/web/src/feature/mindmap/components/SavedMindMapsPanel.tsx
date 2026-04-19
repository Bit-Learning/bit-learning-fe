import { useState } from "react";
import {
	AlertCircle,
	BookMarked,
	CalendarDays,
	ChevronLeft,
	ChevronRight,
	Clock3,
	GitBranchPlus,
	Loader2,
	Network,
	Trash2,
	Upload,
} from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { toast } from "@/shared/components/Sonner";
import { extractApiErrorMessage } from "@/shared/lib/api-error";
import { mindmapApi } from "../apis/mindmap.api";
import {
	useDeleteSavedMindMap,
	useGetSavedMindMaps,
} from "../queries/use-mindmap-queries";
import type { SavedMindMapDto } from "../types/mindmap.type";

interface SavedMindMapsPanelProps {
	onLoad: (detail: SavedMindMapDto) => void;
}

const loadingSkeletonKeys = [
	"skeleton-a",
	"skeleton-b",
	"skeleton-c",
	"skeleton-d",
	"skeleton-e",
	"skeleton-f",
];

function formatDate(dateStr: string) {
	try {
		return new Date(dateStr).toLocaleDateString("vi-VN", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch {
		return dateStr;
	}
}

export default function SavedMindMapsPanel({
	onLoad,
}: SavedMindMapsPanelProps) {
	const [page, setPage] = useState(0);
	const [loadingId, setLoadingId] = useState<number | null>(null);
	const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

	const { data, isLoading, isError } = useGetSavedMindMaps(page, 12);
	const { mutate: deleteMindMap, isPending: isDeleting } =
		useDeleteSavedMindMap();

	const items = data?.data?.data ?? [];
	const pagination = data?.data?.page;
	const totalPages = pagination?.totalPages ?? 1;
	const totalItems = pagination?.totalElements ?? items.length;

	const handleLoad = async (id: number) => {
		setLoadingId(id);
		try {
			const res = await mindmapApi.getById(id);
			const detail = res.data.data;
			if (detail) {
				onLoad(detail);
			}
		} catch (error) {
			toast.error({
				title: "Lỗi khi tải mindmap",
				description: extractApiErrorMessage(error, "Không thể tải mindmap."),
			});
		} finally {
			setLoadingId(null);
		}
	};

	const handleDelete = (id: number) => {
		deleteMindMap(id, {
			onSuccess: () => {
				setConfirmDeleteId(null);
				toast.success({ title: "Đã xóa mindmap" });
				if (items.length === 1 && page > 0) {
					setPage((previous) => previous - 1);
				}
			},
			onError: (error) => {
				toast.error({
					title: "Lỗi khi xóa mindmap",
					description: extractApiErrorMessage(error, "Không thể xóa mindmap."),
				});
			},
		});
	};

	if (isLoading) {
		return (
			<div className="flex flex-1 flex-col gap-4">
				<div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
					<div className="flex items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800">
							<Loader2 className="h-5 w-5 animate-spin" />
						</div>
						<div>
							<p className="text-sm font-semibold text-slate-900 dark:text-white">
								Đang tải mindmap đã lưu
							</p>
							<p className="text-sm text-slate-500 dark:text-slate-400">
								Hệ thống đang lấy danh sách để bạn chọn lại nhanh.
							</p>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
					{loadingSkeletonKeys.map((key) => (
						<div
							key={key}
							className="animate-pulse rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
						>
							<div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700" />
							<div className="mt-4 h-5 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
							<div className="mt-2 h-4 w-1/3 rounded bg-slate-100 dark:bg-slate-800" />
							<div className="mt-4 h-9 rounded-full bg-slate-100 dark:bg-slate-800" />
							<div className="mt-4 grid grid-cols-2 gap-3">
								<div className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800" />
								<div className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800" />
							</div>
							<div className="mt-4 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800" />
							<div className="mt-5 flex gap-3">
								<div className="h-11 w-11 rounded-2xl bg-slate-100 dark:bg-slate-800" />
								<div className="h-11 flex-1 rounded-2xl bg-slate-200 dark:bg-slate-700" />
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex flex-1 items-center justify-center">
				<div className="max-w-md rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center shadow-sm dark:border-rose-900/60 dark:bg-rose-950/30">
					<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-rose-500 shadow-sm dark:bg-slate-900">
						<AlertCircle className="h-6 w-6" />
					</div>
					<p className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
						Không thể tải danh sách mindmap đã lưu
					</p>
					<p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
						Hãy thử tải lại trang hoặc quay lại sau khi kết nối ổn định hơn.
					</p>
				</div>
			</div>
		);
	}

	if (items.length === 0) {
		return (
			<div className="flex flex-1 items-center justify-center">
				<div className="max-w-lg rounded-[2rem] border border-dashed border-slate-300 bg-white px-8 py-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
					<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
						<BookMarked className="h-8 w-8" />
					</div>
					<p className="mt-5 text-xl font-semibold text-slate-900 dark:text-white">
						Chưa có mindmap nào được lưu
					</p>
					<p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
						Tạo mindmap, tinh chỉnh nếu cần, rồi nhấn &quot;Lưu&quot; để giữ lại
						phiên bản bạn muốn tái sử dụng.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-1 flex-col gap-4 overflow-hidden">
			<div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
				<div>
					<p className="text-sm font-semibold text-slate-900 dark:text-white">
						Thư viện mindmap đã lưu
					</p>
					<p className="text-sm text-slate-500 dark:text-slate-400">
						{totalItems} mindmap sẵn sàng để mở lại và tiếp tục chỉnh sửa.
					</p>
				</div>
				<div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
					Trang {page + 1}/{totalPages}
				</div>
			</div>

			<div className="grid flex-1 auto-rows-max grid-cols-1 gap-4 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">
				{items.map((item) => {
					const isConfirmingDelete = confirmDeleteId === item.id;
					const isLoadingThis = loadingId === item.id;
					const nodeCount = item.metadata?.total_nodes ?? 0;
					const depth = item.metadata?.max_depth ?? 0;

					return (
						<div
							key={item.id}
							className="group flex flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900"
						>
							<div className="flex flex-1 flex-col p-5">
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0">
										<p className="truncate text-lg font-semibold text-slate-900 dark:text-white">
											{item.title}
										</p>
									</div>
									<span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
										v{item.current_version}
									</span>
								</div>

								<div className="mt-4">
									<span className="inline-flex max-w-full items-center rounded-full bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
										<span className="truncate">{item.topic}</span>
									</span>
								</div>

								<div className="mt-4 grid grid-cols-2 gap-3">
									<div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800/70">
										<div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
											<Network className="h-3.5 w-3.5" />
											Node
										</div>
										<p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
											{nodeCount}
										</p>
									</div>
									<div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800/70">
										<div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
											<GitBranchPlus className="h-3.5 w-3.5" />
											Độ sâu
										</div>
										<p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
											{depth}
										</p>
									</div>
								</div>

								<div className="mt-4 space-y-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-800/60">
									<div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
										<CalendarDays className="h-4 w-4" />
										<span>Tạo lúc {formatDate(item.createdAt)}</span>
									</div>
									<div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
										<Clock3 className="h-4 w-4" />
										<span>Cập nhật {formatDate(item.updatedAt)}</span>
									</div>
								</div>

								<div className="mt-5 flex gap-3">
									{isConfirmingDelete ? (
										<>
											<Button
												variant="outline"
												onPress={() => setConfirmDeleteId(null)}
												className="cursor-pointer py-5"
												isDisabled={isDeleting}
											>
												Hủy
											</Button>
											<Button
												onPress={() => handleDelete(item.id)}
												isDisabled={isDeleting}
												className="flex-1 gap-2 bg-red-600 py-5 text-sm text-white hover:bg-red-700"
											>
												{isDeleting ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : (
													<Trash2 className="h-4 w-4" />
												)}
												Xác nhận xóa
											</Button>
										</>
									) : (
										<>
											<Button
												variant="outline"
												onPress={() => setConfirmDeleteId(item.id)}
												className="cursor-pointer shrink-0 py-5"
												isDisabled={isLoadingThis}
											>
												<Trash2 className="h-5 w-5 text-red-500" />
											</Button>
											<Button
												onPress={() => handleLoad(item.id)}
												isDisabled={isLoadingThis}
												className="flex-1 justify-center text-md cursor-pointer bg-blue-700 hover:bg-white hover:text-blue-600 hover:border-blue-600 text-white text-md px-5 py-5 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm shadow-blue-500/30"
											>
												{isLoadingThis ? (
													<Loader2 className="h-5 w-5 animate-spin" />
												) : (
													<Upload className="h-5 w-5" />
												)}
												Sử dụng
											</Button>
										</>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{totalPages > 1 && (
				<div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
					<Button
						variant="outline"
						onPress={() => setPage((previous) => Math.max(0, previous - 1))}
						isDisabled={page === 0}
						className="h-9 w-9 p-0"
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<div className="min-w-24 text-center">
						<p className="text-sm font-semibold text-slate-900 dark:text-white">
							Trang {page + 1}
						</p>
						<p className="text-xs text-slate-500 dark:text-slate-400">
							Tổng {totalPages} trang
						</p>
					</div>
					<Button
						variant="outline"
						onPress={() =>
							setPage((previous) => Math.min(totalPages - 1, previous + 1))
						}
						isDisabled={page >= totalPages - 1}
						className="h-9 w-9 p-0"
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			)}
		</div>
	);
}
