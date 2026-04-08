import type { ColumnDef } from "@tanstack/react-table";
import { Calendar, Edit, Plus, Trash2 } from "lucide-react";
import { DataTableColumnHeader } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { TCurriculumResponse } from "../types/curriculum.type";

export type CurriculumColumnsParams = {
	onEdit: (curriculum: TCurriculumResponse) => void;
	onDelete: (curriculum: TCurriculumResponse) => void;
	onAddSubject: (curriculum: TCurriculumResponse) => void;
	subjectCounts?: Map<number, number>;
};

const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	return date.toLocaleDateString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
};

export function createCurriculumColumns({
	onEdit,
	onDelete,
	onAddSubject,
	subjectCounts,
}: CurriculumColumnsParams): ColumnDef<TCurriculumResponse>[] {
	return [
		{
			accessorKey: "name",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Chương trình" />
			),
			cell: ({ row }) => {
				const curriculum = row.original;
				return (
					<div className="flex flex-col gap-0.5">
						<span className="font-medium truncate">{curriculum.name}</span>
						<div className="flex gap-2 text-xs text-muted-foreground">
							<span>Mã: {curriculum.code}</span>
							{curriculum.description && (
								<span className="truncate max-w-[260px]">
									{curriculum.description}
								</span>
							)}
						</div>
					</div>
				);
			},
			meta: {
				className: cn("min-w-[260px]"),
			},
		},
		{
			accessorKey: "code",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Mã" />
			),
			cell: ({ row }) => (
				<span className="font-mono text-xs">{row.original.code}</span>
			),
			meta: {
				className: cn("w-[140px]"),
			},
		},
		{
			id: "subjectCount",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Số môn học" />
			),
			cell: ({ row }) => {
				const curriculum = row.original;
				const count = subjectCounts?.get(curriculum.id) ?? 0;
				return <span className="text-sm font-semibold">{count}</span>;
			},
			enableSorting: false,
			meta: {
				className: cn("w-[120px]"),
			},
		},
		{
			accessorKey: "createdAt",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Ngày tạo" />
			),
			cell: ({ row }) => (
				<div className="flex items-center gap-1 text-xs text-muted-foreground">
					<Calendar className="h-3.5 w-3.5" />
					<span>{formatDate(row.original.createdAt)}</span>
				</div>
			),
			meta: {
				className: cn("w-[150px]"),
			},
		},
		{
			id: "actions",
			header: () => <div className="text-right">Thao tác</div>,
			cell: ({ row }) => {
				const curriculum = row.original;
				return (
					<div className="flex justify-end gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => onAddSubject(curriculum)}
							className="h-8 px-2 text-xs sm:px-3 sm:text-sm"
						>
							<Plus className="mr-1 h-3.5 w-3.5" />
							Thêm môn
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onEdit(curriculum)}
							className="h-8 w-8 text-muted-foreground hover:text-foreground"
							title="Sửa chương trình"
						>
							<Edit className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onDelete(curriculum)}
							className="h-8 w-8 text-muted-foreground hover:text-destructive"
							title="Xóa chương trình"
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				);
			},
			enableSorting: false,
			enableHiding: false,
			meta: {
				className: cn("w-[260px] text-right"),
			},
		},
	];
}
