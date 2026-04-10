import React, { useState } from "react";
import { useGetPosts } from "../queries/usePost";
import { PostRow } from "../components/PostRow";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { SearchIcon, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/Pagination";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/layout/header";
import { Main } from "@/layout/main";

export const PostListPage: React.FC = () => {
	const [page, setPage] = useState(0);
	const [size] = useState(9);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");

	const { data, isLoading, isError } = useGetPosts(page, size);

	const filteredPosts = data?.content.filter((post) => {
		const matchesSearch =
			post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			post.content.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesStatus =
			statusFilter === "all" ||
			(statusFilter === "banned" && post.isBanned) ||
			(statusFilter === "active" && !post.isBanned);
		return matchesSearch && matchesStatus;
	});

	if (isError) {
		return (
			<div className="flex items-center justify-center h-96">
				<p className="text-destructive">
					Đã xảy ra lỗi khi tải danh sách bài viết
				</p>
			</div>
		);
	}

	return (
		<>
			<Header />
			<Main className="flex flex-1 flex-col gap-6 p-8">
				<div className="mb-8 flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold mb-2">Quản lý bài viết</h1>
						<p className="text-muted-foreground text-sm">
							Xem xét và kiểm duyệt các bài viết trong hệ thống
						</p>
					</div>
				</div>

				<div className="flex gap-4 mb-6">
					<div className="relative flex-1">
						<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
						<Input
							placeholder="Tìm kiếm bài viết..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-9"
						/>
					</div>
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-48">
							<Filter className="w-4 h-4 mr-2" />
							<SelectValue placeholder="Lọc theo trạng thái" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Tất cả</SelectItem>
							<SelectItem value="active">Đang hoạt động</SelectItem>
							<SelectItem value="banned">Bị khóa</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="rounded-md border overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="bg-muted/50 text-left">
								<th className="px-4 py-3 font-semibold">Tiêu đề</th>
								<th className="px-4 py-3 font-semibold whitespace-nowrap">
									Tác giả
								</th>
								<th className="px-4 py-3 font-semibold whitespace-nowrap">
									Ngày đăng
								</th>
								<th className="px-4 py-3 font-semibold">Trạng thái</th>
								<th className="px-4 py-3 font-semibold">Hành động</th>
							</tr>
						</thead>
						<tbody>
							{isLoading ? (
								[...Array(6)].map((_, i) => (
									<tr key={i} className="border-b">
										{[...Array(7)].map((_, j) => (
											<td key={j} className="px-4 py-3">
												<Skeleton className="h-4 w-full" />
											</td>
										))}
									</tr>
								))
							) : filteredPosts?.length === 0 ? (
								<tr>
									<td
										colSpan={7}
										className="text-center py-12 text-muted-foreground"
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

				{data && data.page && data.page.totalPages > 1 && (
					<Pagination
						currentPage={page}
						totalPages={data.page.totalPages}
						onPageChange={setPage}
					/>
				)}
			</Main>
		</>
	);
};
