import type React from "react";
import { useState } from "react";
import { Filter, SearchIcon } from "lucide-react";
import { Pagination } from "@/components/Pagination";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/layout/header";
import { Main } from "@/layout/main";
import { PostRow } from "../components/PostRow";
import { useGetPosts } from "../queries/usePost";
import { getAuthorName, getPostExcerpt, getPostTags } from "../post.utils";

export const PostListPage: React.FC = () => {
	const [page, setPage] = useState(0);
	const [size] = useState(9);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const tableSkeletonRows = [
		"post-row-skeleton-1",
		"post-row-skeleton-2",
		"post-row-skeleton-3",
		"post-row-skeleton-4",
		"post-row-skeleton-5",
		"post-row-skeleton-6",
	];
	const tableSkeletonCols = [
		"post-cell-skeleton-title",
		"post-cell-skeleton-author",
		"post-cell-skeleton-stats",
		"post-cell-skeleton-status",
		"post-cell-skeleton-action",
	];

	const { data, isLoading, isError } = useGetPosts(page, size);

	const filteredPosts = data?.content.filter((post) => {
		const normalizedSearch = searchTerm.toLowerCase();
		const searchableText = [
			post.title,
			post.slug,
			post.category?.name,
			getAuthorName(post.author),
			getPostExcerpt(post),
			...getPostTags(post).map((tag) => tag.name),
		]
			.filter(Boolean)
			.join(" ")
			.toLowerCase();

		const matchesSearch =
			normalizedSearch.length === 0 ||
			searchableText.includes(normalizedSearch);
		const matchesStatus =
			statusFilter === "all" ||
			(statusFilter === "banned" && post.isBanned) ||
			(statusFilter === "active" && !post.isBanned);

		return matchesSearch && matchesStatus;
	});

	if (isError) {
		return (
			<div className="flex h-96 items-center justify-center">
				<p className="text-destructive">
					Đã xảy ra lỗi khi tải danh sách bài viết
				</p>
			</div>
		);
	}

	return (
		<>
			<Header />
			<div className="flex flex-1 flex-col gap-2 sm:gap-6 p-6">
				<div className="mb-8 flex items-center justify-between">
					<div>
						<h1 className="mb-2 text-2xl font-bold">Quản lý bài viết</h1>
						<p className="text-sm text-muted-foreground">
							Xem xét và kiểm duyệt các bài viết trong hệ thống
						</p>
					</div>
				</div>

				<div className="mb-6 flex gap-4">
					<div className="relative flex-1">
						<SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Tìm kiếm bài viết..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-9"
						/>
					</div>
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-48">
							<Filter className="mr-2 h-4 w-4" />
							<SelectValue placeholder="Lọc theo trạng thái" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Tất cả</SelectItem>
							<SelectItem value="active">Đang hoạt động</SelectItem>
							<SelectItem value="banned">Bị khóa</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="overflow-x-auto rounded-md border">
					<table className="w-full text-sm">
						<thead>
							<tr className="bg-muted/50 text-left">
								<th className="px-4 py-3 font-semibold">Tiêu đề</th>
								<th className="px-4 py-3 font-semibold whitespace-nowrap">
									Tác giả
								</th>
								<th className="px-4 py-3 font-semibold whitespace-nowrap">
									Ngày đăng & thống kê
								</th>
								<th className="px-4 py-3 font-semibold">Trạng thái</th>
								<th className="px-4 py-3 font-semibold">Hành động</th>
							</tr>
						</thead>
						<tbody>
							{isLoading ? (
								tableSkeletonRows.map((rowKey) => (
									<tr key={rowKey} className="border-b">
										{tableSkeletonCols.map((colKey) => (
											<td key={`${rowKey}-${colKey}`} className="px-4 py-3">
												<Skeleton className="h-4 w-full" />
											</td>
										))}
									</tr>
								))
							) : filteredPosts?.length === 0 ? (
								<tr>
									<td
										colSpan={5}
										className="py-12 text-center text-muted-foreground"
									>
										Không tìm thấy bài viết nào
									</td>
								</tr>
							) : (
								filteredPosts?.map((post) => (
									<PostRow key={post.id} post={post} />
								))
							)}
						</tbody>
					</table>
				</div>

				{data?.page && data.page.totalPages > 1 && (
					<Pagination
						currentPage={page}
						totalPages={data.page.totalPages}
						onPageChange={setPage}
					/>
				)}
			</div>
		</>
	);
};
