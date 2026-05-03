import type { ColumnDef } from "@tanstack/react-table";
import { Eye, EyeOff, Loader2, Pencil } from "lucide-react";
import { DataTableColumnHeader } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { KidsBlocklyLevel } from "../api/kids-blockly.api";

const BLOCK_LABELS: Record<string, string> = {
	move: "Tiến",
	left: "Rẽ trái",
	right: "Rẽ phải",
	back: "Lùi",
	turnAround: "Quay đầu",
	jump: "Nhảy",
	repeat: "Lặp",
};

type CreateColumnsOptions = {
	onEdit: (level: KidsBlocklyLevel) => void;
	onTogglePublish: (level: KidsBlocklyLevel) => void;
	publishingLevelId?: string | null;
};

export const createKidsBlocklyColumns = ({
	onEdit,
	onTogglePublish,
	publishingLevelId = null,
}: CreateColumnsOptions): ColumnDef<KidsBlocklyLevel>[] => [
	{
		accessorKey: "order",
		header: ({ column }) => <DataTableColumnHeader column={column} title="#" />,
		cell: ({ row }) => (
			<div className="w-10 ps-3 text-muted-foreground">
				{row.original.order}
			</div>
		),
		enableHiding: false,
	},
	{
		accessorKey: "id",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="ID" />
		),
		cell: ({ row }) => (
			<div className="font-mono text-xs">{row.original.id}</div>
		),
		enableHiding: false,
	},
	{
		accessorKey: "title",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Tiêu đề" />
		),
		cell: ({ row }) => (
			<div className="space-y-0.5">
				<div className="font-medium">{row.original.title}</div>
				<div
					className="max-w-64 truncate text-xs text-muted-foreground"
					title={row.original.subtitle}
				>
					{row.original.subtitle}
				</div>
			</div>
		),
	},
	{
		accessorKey: "gridSize",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Lưới" />
		),
		cell: ({ row }) => (
			<div className="text-sm text-muted-foreground">
				{row.original.gridSize.rows}×{row.original.gridSize.cols}
			</div>
		),
		enableSorting: false,
	},
	{
		accessorKey: "par",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Par" />
		),
		cell: ({ row }) => <div className="text-sm">{row.original.par}</div>,
	},
	{
		accessorKey: "allowedBlocks",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Khối lệnh" />
		),
		cell: ({ row }) => (
			<div className="flex flex-wrap gap-1">
				{row.original.allowedBlocks.map((b) => (
					<Badge key={b} variant="outline" className="text-xs">
						{BLOCK_LABELS[b] ?? b}
					</Badge>
				))}
			</div>
		),
		enableSorting: false,
	},
	{
		accessorKey: "isPublished",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Trạng thái" />
		),
		cell: ({ row }) =>
			row.original.isPublished ? (
				<Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
					Đã xuất bản
				</Badge>
			) : (
				<Badge variant="secondary">Chưa xuất bản</Badge>
			),
		filterFn: (row, _id, value) => {
			if (!Array.isArray(value) || value.length === 0) return true;
			return value.includes(String(row.original.isPublished));
		},
		enableSorting: false,
	},
	{
		id: "actions",
		header: () => (
			<div className="pe-4 text-right text-xs font-medium uppercase text-muted-foreground">
				Thao tác
			</div>
		),
		cell: ({ row }) => {
			const level = row.original;
			const isThisPublishing = publishingLevelId === level.id;
			return (
				<div className="flex justify-end gap-2 pe-4">
					<TooltipProvider delayDuration={200}>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									size="icon"
									variant="outline"
									onClick={() => onEdit(level)}
								>
									<Pencil className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>Chỉnh sửa</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									size="icon"
									variant="outline"
									disabled={isThisPublishing}
									className={
										level.isPublished
											? "text-emerald-600 hover:bg-emerald-50"
											: "text-muted-foreground"
									}
									onClick={() => onTogglePublish(level)}
								>
									{isThisPublishing ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : level.isPublished ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								{level.isPublished ? "Ẩn màn chơi" : "Xuất bản"}
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			);
		},
		enableSorting: false,
		enableHiding: false,
	},
];
