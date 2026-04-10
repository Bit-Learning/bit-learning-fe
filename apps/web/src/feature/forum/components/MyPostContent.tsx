import React, { useState, useMemo } from "react";
import {
	Plus,
	Search,
	FileText,
	CheckCircle,
	Lock,
	PenSquare,
	Flame,
	TrendingUp,
	ThumbsUp,
	Inbox,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useForumPostsByAuthor, useDeleteForumPost } from "../queries/useForum";
import { selectForumMyPosts } from "../stores/forum.store";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import { useNavigate } from "@tanstack/react-router";
import { Pagination } from "@/shared/components/Pagination";
import { PostRow } from "./PostRow";

type TabType = "all" | "published" | "locked";

function formatDate(date: string): string {
	const diffH = Math.floor((Date.now() - new Date(date).getTime()) / 3_600_000);
	if (diffH < 1) return "Vừa xong";
	if (diffH < 24) return `${diffH} giờ trước`;
	const days = Math.floor(diffH / 24);
	if (days < 30) return `${days} ngày trước`;
	return new Date(date).toLocaleDateString("vi-VN");
}

const TABS: { key: TabType; label: string; icon: React.ReactNode }[] = [
	{ key: "all", label: "Tất cả", icon: <FileText className="w-3.5 h-3.5" /> },
	{
		key: "published",
		label: "Đã đăng",
		icon: <CheckCircle className="w-3.5 h-3.5" />,
	},
	{ key: "locked", label: "Bị khóa", icon: <Lock className="w-3.5 h-3.5" /> },
];

const MyPostContent: React.FC = () => {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState<TabType>("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [page, setPage] = useState(0);

	const { userInfo } = useSelector(selectAuthStateInfo);
	const authorId = userInfo?.id || 1;

	const allPosts = useSelector(selectForumMyPosts);
	const { data } = useForumPostsByAuthor({ authorId, page, size: 10 });
	const deletePostMutation = useDeleteForumPost();
	const pagination = data?.page;

	const counts = useMemo(
		() => ({
			all: allPosts.length,
			published: allPosts.filter((p) => !p.isBanned).length,
			locked: allPosts.filter((p) => p.isBanned).length,
		}),
		[allPosts],
	);

	const displayPosts = useMemo(() => {
		let result = allPosts;
		if (activeTab === "published") result = result.filter((p) => !p.isBanned);
		if (activeTab === "locked") result = result.filter((p) => p.isBanned);
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			result = result.filter(
				(p) =>
					p.title.toLowerCase().includes(q) ||
					p.content.toLowerCase().includes(q),
			);
		}
		return result;
	}, [allPosts, activeTab, searchQuery]);

	const topPost = useMemo(
		() =>
			allPosts.length > 0
				? [...allPosts].sort((a, b) => b.likes - a.likes)[0]
				: null,
		[allPosts],
	);

	function isEditAllowed(createdAt: string): boolean {
		return Date.now() - new Date(createdAt).getTime() < 5 * 60 * 1000;
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="bg-white border-b border-gray-200 shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<nav className="text-md text-gray-500 flex items-center">
						<span
							onClick={() => navigate({ to: "/" })}
							className="hover:text-gray-700 cursor-pointer"
						>
							Trang chủ
						</span>
						<span className="mx-2 text-gray-400">/</span>
						<span className="text-gray-700 font-medium">Bài viết của tôi</span>
					</nav>
				</div>
			</div>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-5 items-start">
				<aside className="w-56 shrink-0 sticky top-8 self-start space-y-3">
					<div className="bg-white rounded-md border border-gray-200 overflow-hidden">
						<div className="px-2 py-2 space-y-0.5">
							<button
								className="cursor-pointer w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-md font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors text-left"
								onClick={() => navigate({ to: "/forum" })}
							>
								<Flame className="w-4 h-4" />
								Bảng tin
							</button>
							<button className="cursor-pointer w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-md font-semibold text-primary bg-blue-50 text-left">
								<PenSquare className="w-4 h-4" />
								Bài viết của tôi
							</button>
						</div>
					</div>

					<div className="bg-white rounded-md border border-gray-200 p-4 space-y-4">
						<div>
							<p className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2.5">
								Của tôi
							</p>
							<div className="space-y-1.5">
								{[
									{ label: "Tổng bài viết", value: counts.all },
									{ label: "Đã đăng", value: counts.published },
									{ label: "Bị khóa", value: counts.locked },
									{
										label: "Lượt thích",
										value: allPosts.reduce((s, p) => s + p.likes, 0),
									},
								].map(({ label, value }) => (
									<div
										key={label}
										className="flex items-center justify-between"
									>
										<span className="text-sm text-gray-500">{label}</span>
										<span className="text-sm font-semibold text-gray-800">
											{value}
										</span>
									</div>
								))}
							</div>
						</div>

						{topPost && (
							<div className="border-t border-gray-100 pt-3">
								<div className="flex items-center gap-1.5 mb-2">
									<TrendingUp className="w-3.5 h-3.5 text-orange-400" />
									<p className="text-sm font-semibold uppercase tracking-wider text-gray-400">
										Nổi bật
									</p>
								</div>
								<button
									className="w-full text-left group"
									onClick={() =>
										navigate({
											to: "/forum/post/$id",
											params: { id: String(topPost.id) },
										})
									}
								>
									<p className="text-sm font-semibold text-gray-700 group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-1">
										{topPost.title}
									</p>
									<div className="flex items-center gap-2 text-sm text-gray-400">
										<span className="flex items-center gap-2 ">
											<ThumbsUp className="w-3.5 h-3.5 fill-blue-500 text-blue-500" />
											{topPost.likes}
										</span>
										<span>{formatDate(topPost.createdAt)}</span>
									</div>
								</button>
							</div>
						)}

						<button
							className="cursor-pointer w-full flex items-center justify-center gap-2 bg-primary hover:bg-blue-700 text-white py-2 rounded-md text-sm font-semibold transition-colors"
							onClick={() => navigate({ to: "/forum/create" })}
						>
							<Plus className="w-3.5 h-3.5" />
							Tạo bài viết mới
						</button>
					</div>
				</aside>

				<div className="flex-1 min-w-0 space-y-3">
					<div className="bg-white rounded-md border border-gray-200 px-5 py-3.5 flex items-center gap-4">
						<div>
							<h1 className="text-base font-semibold text-gray-900">
								Bài viết của tôi
							</h1>
							<p className="text-sm text-gray-400 mt-0.5">
								Nội dung bạn đã chia sẻ
							</p>
						</div>
						<div className="relative flex-1 max-w-md">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
							<input
								className="pl-9 pr-3 py-3 bg-gray-100 rounded-md text-sm w-full outline-none focus:ring-2 focus:ring-blue-200 transition-all placeholder:text-gray-400"
								placeholder="Tìm kiếm..."
								value={searchQuery}
								onChange={(e) => {
									setSearchQuery(e.target.value);
									setPage(0);
								}}
							/>
						</div>

						<div className="bg-white px-2 py-2 flex items-center gap-1">
							{TABS.map(({ key, label, icon }) => (
								<button
									key={key}
									onClick={() => {
										setActiveTab(key);
										setPage(0);
									}}
									className={`cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold transition-all ${
										activeTab === key
											? "bg-primary text-white"
											: "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
									}`}
								>
									{icon}
									{label}
									<span
										className={`ml-0.5 text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
											activeTab === key
												? "bg-blue-500 text-white"
												: "bg-gray-100 text-gray-500"
										}`}
									>
										{counts[key]}
									</span>
								</button>
							))}
						</div>
					</div>
					<div className="space-y-2">
						{displayPosts.length === 0 ? (
							<div className="text-center py-16 bg-white rounded-md border border-gray-200">
								{activeTab === "locked" ? (
									<Lock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
								) : searchQuery ? (
									<Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
								) : (
									<Inbox className="w-8 h-8 text-gray-300 mx-auto mb-2" />
								)}
								<p className="text-md font-semibold text-gray-500">
									{activeTab === "locked"
										? "Không có bài viết bị khóa"
										: searchQuery
											? `Không tìm thấy "${searchQuery}"`
											: "Bạn chưa có bài viết nào"}
								</p>
								{!searchQuery && activeTab === "all" && (
									<button
										className="mt-3 text-sm text-primary font-semibold hover:underline"
										onClick={() => navigate({ to: "/forum/create" })}
									>
										Tạo bài viết đầu tiên →
									</button>
								)}
							</div>
						) : (
							displayPosts.map((post) => (
								<PostRow
									key={post.id}
									post={post}
									formatDate={formatDate}
									canEdit={isEditAllowed(post.createdAt)}
									onEdit={() =>
										navigate({
											to: "/forum/$id/edit",
											params: { id: String(post.id) },
										})
									}
									onDelete={() => deletePostMutation.mutate(post.id)}
									onView={() =>
										navigate({
											to: "/forum/post/$id",
											params: { id: String(post.id) },
										})
									}
								/>
							))
						)}
					</div>

					{pagination && pagination.totalPages > 1 && (
						<div className="mt-4">
							<Pagination
								currentPage={page}
								totalPages={pagination.totalPages}
								onPageChange={setPage}
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default MyPostContent;
