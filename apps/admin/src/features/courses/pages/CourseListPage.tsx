import React, { useMemo, useState } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { BookOpen, CheckCircle2, Plus, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetCourses, useHideOrShowCourse } from "../queries/useCourse";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { CoursePreview, CourseStatus } from "../types/course.type";
import { Main } from "@/layout/main";
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
		? coursesData.data.filter((course: CoursePreview) => !course.isDeleted)
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

			<Main className="flex flex-1 flex-col gap-6 p-8">
				<div className="flex flex-wrap items-end justify-between gap-2 mb-6">
					<div>
						<h1 className="text-2xl font-bold">Khóa học của tôi</h1>
						<p className="text-muted-foreground text-sm">
							Quản lý và chỉnh sửa các khóa học
						</p>
					</div>
					<Button size="sm" onClick={() => navigate({ to: "/courses/create" })}>
						<Plus className="mr-0 h-4 w-4" />
						Tạo khóa học mới
					</Button>
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-1 xl:grid-cols-3">
					<div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
						<div className="flex items-start justify-between">
							<div>
								<p className="text-sm font-medium text-slate-500 dark:text-slate-400">
									Tổng số khóa học
								</p>
								<p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
									{stats.total}
								</p>
							</div>
							<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20">
								<BookOpen className="h-5 w-5" />
							</div>
						</div>
					</div>

					<div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
						<div className="flex items-start justify-between">
							<div>
								<p className="text-sm font-medium text-slate-500 dark:text-slate-400">
									Đã xuất bản
								</p>
								<p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
									{stats.published}
								</p>
							</div>
							<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
								<CheckCircle2 className="h-5 w-5" />
							</div>
						</div>
					</div>

					<div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
						<div className="flex items-start justify-between">
							<div>
								<p className="text-sm font-medium text-slate-500 dark:text-slate-400">
									Chưa xuất bản
								</p>
								<p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
									{stats.pending}
								</p>
							</div>
							<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20">
								<BookOpen className="h-5 w-5" />
							</div>
						</div>
					</div>
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
			</Main>
		</>
	);
};
