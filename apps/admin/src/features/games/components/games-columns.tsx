import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdminGameDto } from "../api/admin-games.api";

export type GameRow = AdminGameDto & { categoryName?: string };

export type CreateGamesColumnsArgs = {
	onEdit: (game: GameRow) => void;
	onArchive: (game: GameRow) => void;
	onApprove: (game: GameRow) => void;
	onReject: (game: GameRow) => void;
	getPlayUrl: (minioObjectName?: string) => string;
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

export const createGamesColumns = ({
	onEdit,
	onArchive,
	onApprove,
	onReject,
	getPlayUrl,
}: CreateGamesColumnsArgs): ColumnDef<GameRow>[] => [
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
		accessorKey: "views",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Lượt xem" />
		),
		cell: ({ row }) => <span>{row.original.views ?? 0}</span>,
	},
	{
		accessorKey: "likes",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Lượt thích" />
		),
		cell: ({ row }) => <span>{row.original.likes ?? 0}</span>,
	},
	{
		id: "actions",
		header: () => (
			<div className="w-55 text-right text-xs font-medium uppercase text-muted-foreground">
				Thao tác
			</div>
		),
		cell: ({ row }) => {
			const game = row.original;
			const playUrl = game.minioObjectName
				? getPlayUrl(game.minioObjectName)
				: undefined;

			return (
				<div className="space-x-2 text-right">
					{playUrl && (
						<Button asChild size="sm" variant="ghost">
							<a href={playUrl} target="_blank" rel="noreferrer">
								Xem
							</a>
						</Button>
					)}
					{game.status === "DRAFT" && (
						<Button variant="outline" size="sm" onClick={() => onApprove(game)}>
							Duyệt
						</Button>
					)}
					{game.status === "PUBLISHED" && (
						<Button variant="outline" size="sm" onClick={() => onReject(game)}>
							Chuyển về nháp
						</Button>
					)}
					<Button size="sm" variant="outline" onClick={() => onEdit(game)}>
						Sửa
					</Button>
					<Button
						size="sm"
						variant="outline"
						disabled={game.status === "ARCHIVED"}
						onClick={() => onArchive(game)}
					>
						Lưu trữ
					</Button>
				</div>
			);
		},
		enableSorting: false,
		enableHiding: false,
	},
];
