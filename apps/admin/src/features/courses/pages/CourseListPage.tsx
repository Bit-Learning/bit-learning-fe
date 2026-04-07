import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { BookOpen, Edit, Plus, SearchIcon, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useGetCourses, useHideOrShowCourse } from "../queries/useCourse";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { CoursePreview } from "../types/course.type";
import { Pagination } from "@/components/Pagination";
import { Main } from "@/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/layout/header";

type DeleteModalState =
	| { type: "none" }
	| { type: "delete"; id: number; name: string };

export const CourseListPage: React.FC = () => {
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState("");
	const [page, setPage] = useState(0);
	const [size] = useState(10);
	const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
		type: "none",
	});

	const { data: coursesData, isLoading } = useGetCourses(page, size);
	const hideMutation = useHideOrShowCourse();

	const courses = Array.isArray(coursesData?.data) ? coursesData.data : [];
	const totalPages = coursesData?.page?.totalPages || 0;

	const filteredCourses = courses
		.filter((course: CoursePreview) => !course.isDeleted)
		.filter((course: CoursePreview) =>
			course.title.toLowerCase().includes(searchQuery.toLowerCase()),
		);

	const handleConfirm = async () => {
		if (deleteModal.type === "none") return;
		try {
			await hideMutation.mutateAsync({ id: deleteModal.id, isHidden: true });
			setDeleteModal({ type: "none" });
		} catch (error) {
			console.error("Failed to delete course:", error);
		}
	};

	return (
		<>
			<Header fixed>
				<Search />
				<div className="ms-auto flex items-center space-x-4">
					<ThemeSwitch />
					<ConfigDrawer />
					<ProfileDropdown />
				</div>
			</Header>

			<Main className="flex flex-1 flex-col gap-6 p-8">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold">Khóa học của tôi</h1>
						<p className="text-muted-foreground text-sm">
							Quản lý và chỉnh sửa các khóa học
						</p>
					</div>
					<Button size="lg" onClick={() => navigate({ to: "/courses/create" })}>
						<Plus className="mr-2 h-4 w-4" />
						Tạo khóa học mới
					</Button>
				</div>

				<div className="relative flex-1">
					<SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
					<Input
						placeholder="Tìm kiếm khóa học..."
						className="pl-10"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>

				{isLoading ? (
					<div className="py-12 text-center">
						<div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
						<p className="mt-4 text-gray-600">Đang tải...</p>
					</div>
				) : filteredCourses.length === 0 ? (
					<Card className="p-12 text-center">
						<BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-400" />
						<h3 className="mb-2 text-xl font-semibold">Chưa có khóa học nào</h3>
						<p className="mb-6 text-gray-600">
							Hãy tạo khóa học đầu tiên của bạn
						</p>
						<Button
							size="lg"
							onClick={() => navigate({ to: "/courses/create" })}
						>
							<Plus className="mr-2 h-4 w-4" />
							Tạo khóa học mới
						</Button>
					</Card>
				) : (
					<>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
							{filteredCourses.map((course: CoursePreview) => (
								<Card
									key={course.id}
									className="overflow-hidden p-0 transition-shadow hover:shadow-lg"
								>
									<div className="relative flex aspect-video items-center justify-center">
										{course.thumbnailUrl ? (
											<img
												src={course.thumbnailUrl}
												alt={course.title}
												className="h-50 w-full object-cover"
											/>
										) : (
											<BookOpen className="h-16 w-16 text-white/50" />
										)}
										<div className="absolute right-3 top-3 flex flex-col items-end gap-1">
											<Badge
												variant={
													course.status === "PUBLISHED"
														? "default"
														: "secondary"
												}
											>
												{course.status === "PUBLISHED"
													? "Đã xuất bản"
													: "Chưa xuất bản"}
											</Badge>
										</div>
									</div>

									<div className="space-y-3 px-4 pb-3">
										<h3 className="line-clamp-2 h-12 text-md font-semibold">
											{course.title}
										</h3>

										<div className="flex items-center justify-between gap-4 text-sm text-gray-600">
											<div className="flex items-center gap-1">
												<BookOpen className="h-4 w-4" />
												<span>Lớp {course.grade}</span>
											</div>
											<div className="text-lg font-bold text-blue-600">
												{course.price === 0
													? "Miễn phí"
													: `${course.price.toLocaleString("vi-VN")} ₫`}
											</div>
										</div>

										<div className="flex items-center gap-2 border-t pt-3">
											<Button
												variant="outline"
												className="flex-1 hover:bg-primary hover:text-slate-100"
												onClick={() =>
													navigate({
														to: "/courses/$id",
														params: { id: String(course.id) },
													})
												}
											>
												<Edit className="mr-2 h-4 w-4" />
												Chi tiết
											</Button>
											<Button
												variant="outline"
												size="icon"
												className="hover:border-red-600 hover:text-slate-100"
												disabled={hideMutation.isPending}
												onClick={() =>
													setDeleteModal({
														type: "delete",
														id: course.id,
														name: course.title,
													})
												}
											>
												<Trash2 className="h-4 w-4 text-red-500" />
											</Button>
										</div>
									</div>
								</Card>
							))}
						</div>

						{totalPages > 1 && (
							<Pagination
								currentPage={page}
								totalPages={totalPages}
								onPageChange={setPage}
							/>
						)}
					</>
				)}

				<DeleteConfirmModal
					open={deleteModal.type !== "none"}
					onClose={() => setDeleteModal({ type: "none" })}
					onConfirm={handleConfirm}
					title="Xóa khóa học"
					description={
						deleteModal.type !== "none"
							? `Bạn có chắc chắn muốn xóa "${deleteModal.name}"? Hành động này không thể hoàn tác.`
							: undefined
					}
					isPending={hideMutation.isPending}
					confirmLabel="Xóa"
				/>
			</Main>
		</>
	);
};
