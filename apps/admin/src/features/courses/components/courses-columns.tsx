import type { ColumnDef } from "@tanstack/react-table";
import { BookOpen, Edit, Trash2 } from "lucide-react";
import { DataTableColumnHeader } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { CoursePreview, CourseStatus } from "../types/course.type";

export const publishedStatuses = new Map<boolean, string>([
	[true, "bg-green-100 text-green-800"],
	[false, "bg-yellow-100 text-yellow-800"],
]);

export type CoursesColumnsParams = {
	onEdit: (course: CoursePreview) => void;
	onDelete: (course: CoursePreview) => void;
};

export function createCoursesColumns({
	onEdit,
	onDelete,
}: CoursesColumnsParams): ColumnDef<CoursePreview>[] {
	return [
		{
			accessorKey: "id",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="ID" />
			),
			cell: ({ row }) => <div className="w-16 ps-3">{row.getValue("id")}</div>,
			meta: {
				className: cn("w-20"),
			},
			enableHiding: false,
		},
		{
			accessorKey: "title",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Khóa học" />
			),
			cell: ({ row }) => {
				const course = row.original;
				return (
					<div className="flex items-center gap-3">
						<div className="flex h-12 w-20 items-center justify-center overflow-hidden rounded-md bg-muted">
							{course.thumbnailUrl ? (
								<img
									src={course.thumbnailUrl}
									alt={course.title}
									className="h-12 w-full object-cover"
								/>
							) : (
								<BookOpen className="h-6 w-6 text-muted-foreground" />
							)}
						</div>
						<div className="flex min-w-0 flex-col">
							<span className="line-clamp-2 font-medium">{course.title}</span>
							<span className="text-muted-foreground text-xs">
								{course.code}
							</span>
						</div>
					</div>
				);
			},
			meta: {
				className: cn("min-w-[260px]"),
			},
		},
		{
			accessorKey: "instructorName",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Giảng viên" />
			),
			cell: ({ row }) => (
				<div className="max-w-[180px] truncate">
					{row.original.instructorName}
				</div>
			),
		},
		{
			accessorKey: "grade",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Lớp" />
			),
			cell: ({ row }) => <span>Lớp {row.original.grade}</span>,
			enableSorting: false,
		},
		{
			accessorKey: "price",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Giá" />
			),
			cell: ({ row }) => {
				const price = row.original.price;
				return (
					<div className="text-right font-semibold">
						{price === 0 ? "Miễn phí" : `${price.toLocaleString("vi-VN")} ₫`}
					</div>
				);
			},
			meta: {
				className: cn("text-right"),
			},
		},
		{
			accessorKey: "status",
			header: ({ column }) => (
				<DataTableColumnHeader column={column} title="Trạng thái" />
			),
			cell: ({ row }) => {
				const status = row.original.status as CourseStatus;
				const isPublished = status === "PUBLISHED";
				const badgeColor = publishedStatuses.get(isPublished);
				return (
					<Badge variant="outline" className={cn("capitalize", badgeColor)}>
						{isPublished ? "Đã xuất bản" : "Chưa xuất bản"}
					</Badge>
				);
			},
			filterFn: (row, id, value) => {
				return value.includes(row.getValue(id));
			},
			enableSorting: false,
			enableHiding: false,
		},
		{
			id: "actions",
			enableSorting: false,
			enableHiding: false,
			meta: {
				className: cn("w-[190px] text-right"),
			},
			cell: ({ row }) => {
				const course = row.original;
				const isPublished = course.status === "PUBLISHED";
				return (
					<div className="flex justify-start gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => onEdit(course)}
							className="h-8 px-2 text-xs sm:px-3 sm:text-sm"
						>
							<Edit className="mr-1 h-4 w-4" />
							Chi tiết
						</Button>
						{!isPublished && (
							<Button
								variant="destructive"
								size="icon"
								onClick={() => onDelete(course)}
								className="h-8 w-8"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						)}
					</div>
				);
			},
		},
	];
}
