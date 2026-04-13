import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "@tanstack/react-router";
import { DataTableColumnHeader } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdminGameDto } from "../api/admin-games.api";

export type GameRow = AdminGameDto & { categoryName?: string };

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
): "default" | "secondary" | "destructive" => {
	switch (status) {
		case "PUBLISHED":
			return "default";
		case "DRAFT":
			return "secondary";
		case "ARCHIVED":
			return "destructive";
		default:
			return "secondary";
	}
};

export const createGamesColumns = (): ColumnDef<GameRow>[] => [
	{
		accessorKey: "id",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="ID" />
		),
		cell: ({ row }) => <div className="w-16 ps-3">{row.original.id}</div>,
		enableHiding: false,
	},
	{
		accessorKey: "title",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Tiêu đề" />
		),
		cell: ({ row }) => (
			<div className="max-w-64 truncate" title={row.original.title}>
				{row.original.title}
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
			return (
				<Badge variant={getStatusVariant(status)}>
					{getStatusLabel(status)}
				</Badge>
			);
		},
		filterFn: (row, id, value) => {
			const status = row.getValue(id) as string | undefined;
			if (!Array.isArray(value) || value.length === 0) return true;
			return value.includes(status);
		},
	},
	{
		accessorKey: "categoryName",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Danh mục" />
		),
		cell: ({ row }) => (
			<span className="text-sm text-muted-foreground">
				{row.original.categoryName ?? "-"}
			</span>
		),
	},
	{
		accessorKey: "description",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Mô tả" />
		),
		cell: ({ row }) => (
			<div className="max-w-xs truncate" title={row.original.description}>
				{row.original.description}
			</div>
		),
	},
	{
		id: "actions",
		header: () => (
			<div className="w-40 text-right text-xs font-medium uppercase text-muted-foreground">
				Thao tác
			</div>
		),
		cell: ({ row }) => {
			const game = row.original;

			return (
				<div className="space-y-2 text-right">
					<div className="text-xs text-muted-foreground">
						{game.views ?? 0} lượt xem · {game.likes ?? 0} lượt thích
					</div>
					<div>
						<Button asChild size="sm" variant="outline">
							<Link to="/apps/games/$id" params={{ id: String(game.id) }}>
								Xem chi tiết
							</Link>
						</Button>
					</div>
				</div>
			);
		},
		enableSorting: false,
		enableHiding: false,
	},
];
