import type { ColumnDef } from "@tanstack/react-table";
import { MessageSquare, TrendingUp } from "lucide-react";
import { DataTableColumnHeader } from "@/components/data-table";
import { LongText } from "@/components/long-text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { PostPreview } from "../types/post.type";
import {
	getAuthorInitials,
	getAuthorName,
	getPostExcerpt,
} from "../post.utils";
import { PostsRowActions } from "./posts-row-actions";

export const postsColumns: ColumnDef<PostPreview>[] = [
	{
		accessorKey: "title",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Tiêu đề" />
		),
		cell: ({ row }) => {
			const post = row.original;

			return (
				<div className="flex min-w-0 items-start gap-3 py-1">
					<img
						src={post.thumbnailUrl}
						alt={post.title}
						className="h-14 w-20 rounded-md border object-cover"
					/>
					<div className="min-w-0 flex-1">
						<div className="flex flex-wrap items-center gap-2">
							<LongText className="max-w-[240px] font-medium">
								{post.title}
							</LongText>
							{post.isFeatured && (
								<Badge className="bg-primary text-white" variant="secondary">
									Nổi bật
								</Badge>
							)}
							{post.isTrending && (
								<Badge className="bg-amber-200" variant="outline">
									Trending
								</Badge>
							)}
						</div>
						<p className="mt-1 max-w-[400px] truncate text-xs text-muted-foreground">
							{getPostExcerpt(post)}
						</p>
						{/* <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
							<span className="font-mono">#{post.id}</span>
							<span className="font-mono">{post.slug}</span>
							{post.category ? (
								<Badge variant="outline">{post.category.name}</Badge>
							) : null}
						</div> */}
					</div>
				</div>
			);
		},
		meta: { className: "min-w-[200px]" },
	},
	{
		id: "author",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Tác giả" />
		),
		cell: ({ row }) => {
			const author = row.original.author;
			const authorName = getAuthorName(author);

			return (
				<div className="flex items-center gap-2 whitespace-nowrap">
					<Avatar className="h-8 w-8">
						<AvatarImage src={author.avatar} alt={authorName} />
						<AvatarFallback>{getAuthorInitials(author)}</AvatarFallback>
					</Avatar>
				</div>
			);
		},
		enableSorting: false,
		meta: { className: "min-w-[100px]" },
	},
	{
		id: "stats",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Ngày đăng & thống kê" />
		),
		cell: ({ row }) => {
			const post = row.original;
			return (
				<div className="whitespace-nowrap text-sm text-muted-foreground">
					<div>{new Date(post.createdAt).toLocaleDateString("vi-VN")}</div>
					<div className="mt-2 flex items-center gap-3 text-xs">
						<span>{post.viewsCount.toLocaleString("vi-VN")} lượt xem</span>
						<span className="inline-flex items-center gap-1">
							<MessageSquare className="h-3.5 w-3.5" />
							{post.commentsCount}
						</span>
						<span className="inline-flex items-center gap-1">
							<TrendingUp className="h-3.5 w-3.5" />
							{post.totalReactions}
						</span>
					</div>
				</div>
			);
		},
		enableSorting: false,
		meta: { className: "min-w-[200px]" },
	},
	{
		accessorKey: "isBanned",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Trạng thái" />
		),
		cell: ({ row }) => {
			const post = row.original;
			return (
				<div className="flex flex-wrap gap-1.5">
					{post.isBanned ? <Badge variant="destructive">Bị khóa</Badge> : null}
					{post.isEdited ? <Badge variant="secondary">Đã sửa</Badge> : null}
					{!post.isBanned && !post.isEdited ? (
						<Badge variant="default" className="bg-green-500">
							Hoạt động
						</Badge>
					) : null}
				</div>
			);
		},
		filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
		enableSorting: false,
		meta: { className: "min-w-[100px]" },
	},
	{
		accessorKey: "isFeatured",
		header: () => null,
		cell: () => null,
		filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
		enableSorting: false,
		enableHiding: true,
		meta: { className: "hidden" },
	},
	{
		id: "actions",
		header: () => <div>Hành động</div>,
		cell: PostsRowActions,
		enableSorting: false,
		enableHiding: false,
		meta: { className: "w-[90px]" },
	},
];
