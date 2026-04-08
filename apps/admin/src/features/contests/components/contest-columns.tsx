import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Eye, Trash2 } from "lucide-react";
import { DataTableColumnHeader } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { ContestListDTO, ContestStatus } from "../types/contest.type";

export type ContestColumnsParams = {
	onView: (contest: ContestListDTO) => void;
	onEdit: (contest: ContestListDTO) => void;
	onDelete: (contest: ContestListDTO) => void;
};

const statusClasses: Record<ContestStatus, string> = {
	RUNNING:
		"bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
	UPCOMING:
		"bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
	ENDED: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400",
};

const statusLabels: Record<ContestStatus, string> = {
	RUNNING: "Đang diễn ra",
	UPCOMING: "Sắp tới",
	ENDED: "Đã kết thúc",
};

const getParticipantText = (status: ContestStatus) => {
	return status === "UPCOMING"
		? "đã đăng ký"
		: status === "RUNNING"
			? "thí sinh"
			: "hoàn thành";
};

const formatDateTime = (dateString: string) => {
	const date = new Date(dateString);
	return {
		time: date.toLocaleTimeString("vi-VN", {
			hour: "2-digit",
			minute: "2-digit",
		}),
		date: date.toLocaleDateString("vi-VN", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		}),
	};
};

export function createContestColumns({
	onView,
	onEdit,
	onDelete,
}: ContestColumnsParams): ColumnDef<ContestListDTO>[] {
	return [
		{
			accessorKey: "status",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Trạng thái" />
			),
			cell: ({ row }) => {
				const status = row.original.status;
				return (
					<span
						className={cn(
							"inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
							statusClasses[status],
						)}
					>
						{statusLabels[status]}
					</span>
				);
			},
			filterFn: (row, id, value) => {
				return (value as string[]).includes(row.getValue(id) as string);
			},
			enableSorting: false,
			meta: {
				className: cn("w-[140px]"),
			},
		},
		{
			accessorKey: "title",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Tiêu đề cuộc thi" />
			),
			cell: ({ row }) => {
				const contest = row.original;
				return (
					<div className="flex flex-col">
						<div className="font-medium">{contest.title}</div>
						<div className="text-xs text-slate-500">
							Mã: {contest.contestId}
						</div>
					</div>
				);
			},
			meta: {
				className: cn("min-w-[260px]"),
			},
		},
		{
			accessorKey: "time",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Thời gian" />
			),
			cell: ({ row }) => {
				const contest = row.original;
				const startTime = formatDateTime(contest.startTime);
				const endTime = formatDateTime(contest.endTime);
				return (
					<div className="flex flex-col">
						<div className="text-sm">
							{startTime.time} - {endTime.time}
						</div>
						<div className="text-xs text-slate-500">{startTime.date}</div>
					</div>
				);
			},
			enableSorting: false,
		},
		{
			accessorKey: "participantCount",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Số người tham gia" />
			),
			cell: ({ row }) => {
				const contest = row.original;
				return (
					<div className="flex items-center">
						<span className="text-sm font-semibold">
							{contest.participantCount.toLocaleString()}
						</span>
						<span className="ml-1 text-xs text-slate-400">
							{getParticipantText(contest.status)}
						</span>
					</div>
				);
			},
			enableSorting: false,
		},
		{
			id: "actions",
			header: () => <div className="text-right">Thao tác</div>,
			enableSorting: false,
			enableHiding: false,
			meta: {
				className: cn("w-[160px] text-right"),
			},
			cell: ({ row }) => {
				const contest = row.original;
				return (
					<div className="flex justify-end gap-2">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onView(contest)}
							className="h-8 w-8 text-black"
							title="Xem"
						>
							<Eye className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onEdit(contest)}
							className="h-8 w-8 text-black"
							title="Sửa"
						>
							<Edit className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onDelete(contest)}
							className="h-8 w-8 text-black"
							title="Xóa"
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				);
			},
		},
	];
}
