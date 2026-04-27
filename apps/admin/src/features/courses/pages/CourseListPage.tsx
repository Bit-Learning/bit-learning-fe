import React, { useMemo, useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetCourses, useHideOrShowCourse } from "../queries/useCourse";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { CoursePreview, CourseStatus } from "../types/course.type";
import { Header } from "@/layout/header";
import { CoursesTable } from "../components/courses-table";

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

	const {
		data: coursesData,
		isLoading,
		isError,
		error,
	} = useGetCourses(page, size);
	const hideMutation = useHideOrShowCourse();

	const courses = Array.isArray(coursesData?.data)
		? coursesData.data.filter((course: CoursePreview) => {
				// Apply grade filter
				if (search.grade && search.grade.length > 0) {
					const gradeFilters = (search.grade as unknown[])
						.map((g) => (typeof g === "string" ? parseInt(g, 10) : g))
						.filter((g) => !isNaN(g));
					if (!gradeFilters.includes(course.grade)) {
						return false;
					}
				}
				// Apply level filter
				if (search.level && search.level.length > 0) {
					if (!search.level.includes(course.level)) {
						return false;
					}
				}
				// Apply status filter
				if (search.status && search.status.length > 0) {
					if (!search.status.includes(course.status)) {
						return false;
					}
				}
				// Apply title filter
				if (search.title) {
					if (
						!course.title.toLowerCase().includes(search.title.toLowerCase())
					) {
						return false;
					}
				}
				return !course.isDeleted;
			})
		: [];
	const totalPages = coursesData?.page?.totalPages || 0;

	const stats = useMemo(() => {
		const total = courses.length;
		const published = courses.filter(
			(course) => course.status === CourseStatus.PUBLISHED,
		).length;
		const pending = courses.filter(
			(course) => course.status === CourseStatus.PENDING,
		).length;
		const rejected = courses.filter(
			(course) => course.status === CourseStatus.REJECTED,
		).length;

		return { total, published, pending, rejected };
	}, [courses]);

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

				{/* <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[
            {
              label: "Tổng khóa học",
              value: stats.total,
            },
            {
              label: "Đã xuất bản",
              value: stats.published,
            },
            {
              label: "Chưa xuất bản",
              value: stats.pending,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {item.label}
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {item.value}
                </p>
              </div>

            </div>
          ))}
        </div> */}

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
