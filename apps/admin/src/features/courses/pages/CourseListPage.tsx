import React from "react";
import { getRouteApi } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetCourses, useHideOrShowCourse } from "../queries/useCourse";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { CoursePreview, CourseLevel, CourseStatus } from "../types/course.type";
import { Header } from "@/layout/header";
import { CoursesTable } from "../components/courses-table";
import { useState } from "react";

const route = getRouteApi("/_authenticated/courses/");

type DeleteModalState =
	| { type: "none" }
	| { type: "delete"; id: number; name: string };

export const CourseListPage: React.FC = () => {
	const search = route.useSearch();
	const navigate = route.useNavigate();

	const page = (search.page || 1) - 1;
	const size = search.pageSize || 10;
	const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
		type: "none",
	});

	const levels = search.level?.length
		? (search.level as CourseLevel[])
		: undefined;
	const grades = search.grade?.length
		? (search.grade as unknown[])
				.map((g) => (typeof g === "string" ? parseInt(g, 10) : (g as number)))
				.filter((g) => !isNaN(g))
		: undefined;
	const statuses = search.status?.length
		? (search.status as CourseStatus[])
		: undefined;
	const title = search.title || undefined;

	const {
		data: coursesData,
		isLoading,
		isError,
		error,
	} = useGetCourses({ page, size, title, levels, grades, statuses });
	const hideMutation = useHideOrShowCourse();

	const courses = Array.isArray(coursesData?.data)
		? (coursesData.data as CoursePreview[]).filter((c) => !c.isDeleted)
		: [];
	const totalPages = coursesData?.page?.totalPages || 0;

	const handleConfirm = async () => {
		if (deleteModal.type === "none") return;
		try {
			await hideMutation.mutateAsync({ id: deleteModal.id, isHidden: true });
			setDeleteModal({ type: "none" });
		} catch (error) {
			console.error("Failed to delete course:", error);
		}
	};

	const handleEditCourse = (course: CoursePreview) => {
		navigate({
			to: "/courses/$id",
			params: { id: String(course.id) },
		});
	};

	const handleDeleteClick = (course: CoursePreview) => {
		setDeleteModal({
			type: "delete",
			id: course.id,
			name: course.title,
		});
	};

	return (
		<>
			<Header fixed />

			<div className="flex flex-1 flex-col gap-2 sm:gap-6 p-6">
				<div className="flex flex-wrap items-end justify-between gap-2">
					<div>
						<h1 className="text-2xl font-bold">Khóa học của tôi</h1>
					</div>
					<Button size="sm" onClick={() => navigate({ to: "/courses/create" })}>
						<Plus className="mr-0 h-4 w-4" />
						Tạo khóa học mới
					</Button>
				</div>

				{isLoading && (
					<div className="flex h-100 items-center justify-center">
						<div className="text-muted-foreground">Đang tải khóa học...</div>
					</div>
				)}

				{isError && (
					<div className="flex h-100 items-center justify-center">
						<div className="text-destructive">
							Không thể tải danh sách khóa học:{" "}
							{error instanceof Error ? error.message : "Lỗi không xác định"}
						</div>
					</div>
				)}

				{!isLoading && !isError && (
					<CoursesTable
						data={courses}
						totalPages={totalPages}
						search={search}
						navigate={navigate}
						onEdit={handleEditCourse}
						onDelete={handleDeleteClick}
					/>
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
			</div>
		</>
	);
};
