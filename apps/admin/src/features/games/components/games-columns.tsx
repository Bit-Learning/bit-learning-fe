import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "@tanstack/react-router";
import { Gamepad2, LayoutGrid, Trash2 } from "lucide-react";
import { DataTableColumnHeader } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type GameRow = {
	id: string;
	rowType: "standard" | "matching";
	displayId: string;
	title: string;
	status?: "PUBLISHED" | "DRAFT" | "ARCHIVED";
	categoryOrTopic: string;
	difficultyOrGrade: string;
	description?: string;
	likes?: number;
	views?: number;
	standardId?: number;
	matchingGrade?: number;
	matchingTopicCode?: string;
};

type CreateGamesColumnsOptions = {
	onDeleteStandard: (id: number) => void;
	onDeleteMatching: (grade: number, topicCode: string) => void;
	isDeletingStandard?: boolean;
	isDeletingMatching?: boolean;
};

const getStatusLabel = (status?: string) => {
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
	status?: string,
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

export const createGamesColumns = ({
	onDeleteStandard,
	onDeleteMatching,
	isDeletingMatching = false,
	isDeletingStandard = false,
}: CreateGamesColumnsOptions): ColumnDef<GameRow>[] => [
	{
		accessorKey: "displayId",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Định danh" />
		),
		cell: ({ row }) => (
			<div className="min-w-28 ps-3 font-medium">{row.original.displayId}</div>
		),
		enableHiding: false,
	},
	{
		accessorKey: "rowType",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Loại" />
		),
		cell: ({ row }) => {
			const isMatching = row.original.rowType === "matching";
			return (
				<Badge variant="outline" className="gap-1.5">
					{isMatching ? (
						<LayoutGrid className="h-3.5 w-3.5" />
					) : (
						<Gamepad2 className="h-3.5 w-3.5" />
					)}
					{isMatching ? "Nối khái niệm" : "Game thường"}
				</Badge>
			);
		},
		filterFn: (row, id, value) => {
			const rowType = row.getValue(id) as string | undefined;
			if (!Array.isArray(value) || value.length === 0) return true;
			return value.includes(rowType);
		},
	},
	{
		accessorKey: "title",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Tiêu đề" />
		),
		cell: ({ row }) => (
			<div className="space-y-1">
				<div
					className="max-w-72 truncate font-medium"
					title={row.original.title}
				>
					{row.original.title}
				</div>
				{row.original.description ? (
					<div
						className="max-w-80 truncate text-xs text-muted-foreground"
						title={row.original.description}
					>
						{row.original.description}
					</div>
				) : null}
			</div>
		),
	},
	{
		accessorKey: "status",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Trạng thái" />
		),
		cell: ({ row }) => {
			const status = row.original.status;
			if (!status) {
				return <span className="text-sm text-muted-foreground">N/A</span>;
			}
			return (
				<Badge variant={getStatusVariant(status)}>
					{getStatusLabel(status)}
				</Badge>
			);
		},
		filterFn: (row, id, value) => {
			const status = row.getValue(id) as string | undefined;
			if (!Array.isArray(value) || value.length === 0) return true;
			return status ? value.includes(status) : false;
		},
	},
	{
		accessorKey: "categoryOrTopic",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Phân loại" />
		),
		cell: ({ row }) => (
			<span className="text-sm text-muted-foreground">
				{row.original.categoryOrTopic}
			</span>
		),
	},
	{
		accessorKey: "difficultyOrGrade",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Thông tin" />
		),
		cell: ({ row }) => (
			<span className="text-sm text-muted-foreground">
				{row.original.difficultyOrGrade}
			</span>
		),
	},
	{
		id: "actions",
		header: () => (
			<div className="w-44 text-right text-xs font-medium uppercase text-muted-foreground">
				Thao tác
			</div>
		),
		cell: ({ row }) => {
			const game = row.original;
			const isMatching = game.rowType === "matching";

			return (
				<div className="space-y-2 text-right">
					<div className="text-xs text-muted-foreground">
						{isMatching
							? `${game.difficultyOrGrade} · ${game.categoryOrTopic}`
							: `${game.views ?? 0} lượt xem · ${game.likes ?? 0} lượt thích`}
					</div>
					<div className="flex justify-end gap-2">
						{isMatching ? (
							<Button asChild size="sm" variant="outline">
								<Link
									to="/apps/games/matching"
									search={{
										grade: game.matchingGrade ?? 0,
										topic: game.matchingTopicCode ?? "",
									}}
								>
									Xem chi tiết
								</Link>
							</Button>
						) : (
							<Button asChild size="sm" variant="outline">
								<Link
									to="/apps/games/$id"
									params={{ id: String(game.standardId) }}
								>
									Xem chi tiết
								</Link>
							</Button>
						)}
						<Button
							size="icon"
							variant="outline"
							className="text-destructive hover:bg-destructive/10"
							disabled={
								isMatching
									? isDeletingMatching
									: isDeletingStandard || game.status === "ARCHIVED"
							}
							onClick={() => {
								if (isMatching) {
									if (
										game.matchingGrade !== undefined &&
										game.matchingTopicCode
									) {
										onDeleteMatching(
											game.matchingGrade,
											game.matchingTopicCode,
										);
									}
									return;
								}
								if (game.standardId !== undefined) {
									onDeleteStandard(game.standardId);
								}
							}}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				</div>
			);
		},
		enableSorting: false,
		enableHiding: false,
	},
];
