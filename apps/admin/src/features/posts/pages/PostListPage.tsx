import type React from "react";
import { useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { FileText, ShieldOff, Star, TrendingUp } from "lucide-react";
import { Header } from "@/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PostsTable } from "../components/posts-table";
import { useGetPosts } from "../queries/usePost";
import type { ColumnFiltersState } from "@tanstack/react-table";

export const PostListPage: React.FC = () => {
	const [page, setPage] = useState(0);
	const [size, setSize] = useState(10);

	const navigate = useNavigate();
	const search = useSearch({ from: "/_authenticated/posts/" });

	const { data, isLoading, isError } = useGetPosts(page, size);

	const posts = data?.content ?? [];

	const totalPosts = data?.page?.totalElements ?? posts.length;
	const bannedCount = posts.filter((p) => p.isBanned).length;
	const featuredCount = posts.filter((p) => p.isFeatured).length;
	const trendingCount = posts.filter((p) => p.isTrending).length;

	const initialColumnFilters: ColumnFiltersState = [
		...(search.status ? [{ id: "isBanned", value: [search.status] }] : []),
		...(search.featured
			? [{ id: "isFeatured", value: [search.featured] }]
			: []),
	];

	const handleColumnFiltersChange = (filters: ColumnFiltersState) => {
		const statusFilter = filters.find((f) => f.id === "isBanned");
		const featuredFilter = filters.find((f) => f.id === "isFeatured");
		navigate({
			to: "/posts",
			search: {
				status: (statusFilter?.value as string[] | undefined)?.[0],
				featured: (featuredFilter?.value as string[] | undefined)?.[0],
			},
			replace: true,
		});
	};

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
			<div className="flex flex-1 flex-col gap-6 p-6">
				<h1 className="text-2xl font-bold">Quản lý bài viết</h1>

				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Tổng bài viết
							</CardTitle>
							<FileText className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{totalPosts.toLocaleString("vi-VN")}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Bị khóa
							</CardTitle>
							<ShieldOff className="h-4 w-4 text-destructive" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-destructive">
								{bannedCount.toLocaleString("vi-VN")}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Nổi bật
							</CardTitle>
							<Star className="h-4 w-4 text-yellow-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-yellow-600">
								{featuredCount.toLocaleString("vi-VN")}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Trending
							</CardTitle>
							<TrendingUp className="h-4 w-4 text-amber-500" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-amber-600">
								{trendingCount.toLocaleString("vi-VN")}
							</div>
						</CardContent>
					</Card>
				</div>

				<PostsTable
					data={posts}
					isLoading={isLoading}
					totalPages={data?.page?.totalPages ?? 0}
					pageIndex={page}
					pageSize={size}
					initialColumnFilters={initialColumnFilters}
					onPaginationChange={(pagination) => {
						setPage(pagination.pageIndex);
						setSize(pagination.pageSize);
					}}
					onColumnFiltersChange={handleColumnFiltersChange}
				/>
			</div>
		</>
	);
};
