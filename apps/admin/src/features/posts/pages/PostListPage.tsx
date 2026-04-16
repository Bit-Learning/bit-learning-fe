import type React from "react";
import { useState } from "react";
import { Header } from "@/layout/header";
import { PostsTable } from "../components/posts-table";
import { useGetPosts } from "../queries/usePost";

export const PostListPage: React.FC = () => {
	const [page, setPage] = useState(0);
	const [size, setSize] = useState(10);

	const { data, isLoading, isError } = useGetPosts(page, size);

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
				<h1 className="text-2xl font-bold">Quản lý bài viết</h1>

				<PostsTable
					data={data?.content ?? []}
					isLoading={isLoading}
					totalPages={data?.page?.totalPages ?? 0}
					pageIndex={page}
					pageSize={size}
					onPaginationChange={(pagination) => {
						setPage(pagination.pageIndex);
						setSize(pagination.pageSize);
					}}
				/>
			</div>
		</>
	);
};
