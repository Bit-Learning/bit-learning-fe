import React, { useMemo, useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import {
	Plus,
	Trophy,
	PlayCircle,
	Clock,
	History,
	TrendingUp,
} from "lucide-react";
import { useContestList, useDeleteContest } from "../queries/useContest";
import { ContestStatus, type ContestListDTO } from "../types/contest.type";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { Header } from "@/layout/header";
import { ContestsTable } from "../components/contests-table";

const route = getRouteApi("/_authenticated/contests/");

const ContestListPage: React.FC = () => {
	const search = route.useSearch();
	const navigate = route.useNavigate();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [contestToDelete, setContestToDelete] = useState<ContestListDTO | null>(
		null,
	);

	const page = (search.page || 1) - 1;
	const size = search.pageSize || 10;

	const {
		data: contestsData,
		isLoading,
		isError,
		error,
	} = useContestList({ page, size });
	const { mutate: deleteContest, isPending: isDeleting } = useDeleteContest();

	const contestsList = contestsData?.data || [];

	const stats = useMemo(() => {
		return {
			total: contestsList?.length,
			running: contestsList?.filter((c) => c.status === ContestStatus.RUNNING)
				.length,
			upcoming: contestsList?.filter((c) => c.status === ContestStatus.UPCOMING)
				.length,
			ended: contestsList?.filter((c) => c.status === ContestStatus.ENDED)
				.length,
		};
	}, [contestsList]);

	const handleDeleteClick = (contest: ContestListDTO) => {
		setContestToDelete(contest);
		setDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = () => {
		if (contestToDelete) {
			deleteContest(contestToDelete.contestId, {
				onSuccess: () => {
					setDeleteDialogOpen(false);
					setContestToDelete(null);
				},
				onError: (error) => {
					console.error("Error deleting contest:", error);
				},
			});
		}
	};

	const handleCloseDeleteDialog = () => {
		if (!isDeleting) {
			setDeleteDialogOpen(false);
			setContestToDelete(null);
		}
	};

	const totalPages = contestsData?.page?.totalPages || 0;

	const handleViewContest = (contest: ContestListDTO) => {
		navigate({
			to: "/contests/$id",
			params: { id: contest.contestId },
		});
	};

	const handleEditContest = (contest: ContestListDTO) => {
		navigate({
			to: "/contests/$id/edit",
			params: { id: contest.contestId },
		});
	};

	return (
		<>
			<Header />

			<div className="flex flex-1 flex-col gap-2 sm:gap-6 p-6">
				<div className="flex justify-between items-center mb-8">
					<div>
						<h2 className="text-2xl font-bold">Quản lý cuộc thi</h2>
						<p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
							Theo dõi và quản lý các cuộc thi Tin học trên hệ thống
						</p>
					</div>
					<Button
						size="sm"
						onClick={() => navigate({ to: "/contests/create" })}
						className="bg-primary text-white px-5 py-5 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-sm"
					>
						<Plus className="w-5 h-5" />
						Tạo cuộc thi mới
					</Button>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					<div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
						<div className="flex items-center justify-between mb-4">
							<div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
								<Trophy className="w-6 h-6" />
							</div>
							<span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full flex items-center gap-1">
								<TrendingUp className="w-3 h-3" />
								+12%
							</span>
						</div>
						<h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">
							Tổng số cuộc thi
						</h3>
						<p className="text-2xl font-bold mt-1">{stats.total}</p>
					</div>

					<div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
						<div className="flex items-center justify-between mb-4">
							<div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg">
								<PlayCircle className="w-6 h-6" />
							</div>
						</div>
						<h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">
							Đang diễn ra
						</h3>
						<p className="text-2xl font-bold mt-1">{stats.running}</p>
					</div>

					<div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
						<div className="flex items-center justify-between mb-4">
							<div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg">
								<Clock className="w-6 h-6" />
							</div>
						</div>
						<h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">
							Sắp tới
						</h3>
						<p className="text-2xl font-bold mt-1">{stats.upcoming}</p>
					</div>

					<div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
						<div className="flex items-center justify-between mb-4">
							<div className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-600 rounded-lg">
								<History className="w-6 h-6" />
							</div>
						</div>
						<h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">
							Đã kết thúc
						</h3>
						<p className="text-2xl font-bold mt-1">{stats.ended}</p>
					</div>
				</div>

				<div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
					<div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
						<h3 className="font-bold">Danh sách cuộc thi</h3>
					</div>

					<div className="p-6">
						{isLoading && (
							<div className="space-y-3">
								{[...Array(5)].map((_, i) => (
									<Skeleton key={i} className="h-16 w-full" />
								))}
							</div>
						)}
						{isError && !isLoading && (
							<div className="py-8 text-center text-sm text-destructive">
								Không thể tải danh sách cuộc thi:{" "}
								{error instanceof Error
									? error.message
									: "Đã xảy ra lỗi không xác định"}
							</div>
						)}
						{!isLoading && !isError && (
							<ContestsTable
								data={contestsList}
								totalPages={totalPages}
								search={search}
								navigate={navigate}
								onView={handleViewContest}
								onEdit={handleEditContest}
								onDelete={handleDeleteClick}
							/>
						)}
					</div>
				</div>

				<DeleteConfirmModal
					open={deleteDialogOpen}
					onClose={handleCloseDeleteDialog}
					onConfirm={handleDeleteConfirm}
					title="Xác nhận xóa cuộc thi"
					description="Bạn có chắc chắn muốn xóa cuộc thi này? Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan đến cuộc thi."
					itemName={contestToDelete?.title}
					isPending={isDeleting}
				/>
			</div>
		</>
	);
};

export default ContestListPage;
