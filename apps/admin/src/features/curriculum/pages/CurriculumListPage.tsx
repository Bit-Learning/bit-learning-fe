import { useEffect, useMemo, useState } from "react";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import {
	Plus,
	GraduationCap,
	BookOpen,
	Layers,
	Book,
	Pencil,
	Trash2,
	ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurriculums, useDeleteCurriculum } from "../queries/useCurriculum";
import { useSubjectsList, useDeleteSubject } from "../queries/useSubject";
import CurriculumFormModal from "../components/CurriculumFormModal";
import SubjectFormModal from "../components/SubjectFormModal";
import DeleteConfirmModal from "../../../components/DeleteConfirmModal";
import type { TCurriculumResponse } from "../types/curriculum.type";
import type { TSubjectResponse } from "../types/subject.type";
import { Main } from "@/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/layout/header";
import { CurriculumTable } from "../components/curriculum-table";
const route = getRouteApi("/_authenticated/curriculum/");

const CurriculumListPage: React.FC = () => {
	const search = route.useSearch();
	const tableNavigate = route.useNavigate();
	const appNavigate = useNavigate();

	const [curriculumModal, setCurriculumModal] = useState<{
		open: boolean;
		data?: TCurriculumResponse | null;
	}>({ open: false });
	const [subjectModal, setSubjectModal] = useState<{
		open: boolean;
		data?: TSubjectResponse | null;
		curriculumId: number;
	}>({ open: false, curriculumId: 0 });
	const [deleteModal, setDeleteModal] = useState<{
		open: boolean;
		type: "curriculum" | "subject";
		item: any;
	}>({ open: false, type: "curriculum", item: null });
	const [selectedCurriculum, setSelectedCurriculum] =
		useState<TCurriculumResponse | null>(null);

	const page = (search.page || 1) - 1;
	const size = search.pageSize || 10;

	const {
		data: curriculaResponse,
		isLoading: loadingCurriculums,
		isError,
		error,
	} = useCurriculums(page, size);
	const { data: subjects, isLoading: loadingSubjects } = useSubjectsList();
	const { mutate: deleteCurriculum, isPending: deletingCurriculum } =
		useDeleteCurriculum();
	const { mutate: deleteSubject, isPending: deletingSubject } =
		useDeleteSubject();

	const curriculums = curriculaResponse?.data ?? [];
	const totalPages = curriculaResponse?.page?.totalPages || 0;
	const totalCurriculums = curriculaResponse?.page?.totalElements ?? 0;

	const subjectCounts = useMemo(() => {
		const map = new Map<number, number>();
		if (!subjects) return map;
		for (const s of subjects) {
			const curriculumId = s.curriculum?.id;
			if (!curriculumId) continue;
			map.set(curriculumId, (map.get(curriculumId) ?? 0) + 1);
		}
		return map;
	}, [subjects]);

	const handleDelete = () => {
		if (deleteModal.type === "curriculum") {
			deleteCurriculum(deleteModal.item.id, {
				onSuccess: () => setDeleteModal({ ...deleteModal, open: false }),
			});
		} else {
			deleteSubject(deleteModal.item.id, {
				onSuccess: () => setDeleteModal({ ...deleteModal, open: false }),
			});
		}
	};

	const totalSubjects = subjects?.length ?? 0;

	const selectedSubjects = useMemo(() => {
		if (!selectedCurriculum || !subjects) return [];
		return subjects.filter(
			(subject) => subject.curriculum?.id === selectedCurriculum.id,
		);
	}, [selectedCurriculum, subjects]);

	useEffect(() => {
		if (!selectedCurriculum && curriculums.length > 0) {
			setSelectedCurriculum(curriculums[0] ?? null);
		}
	}, [curriculums, selectedCurriculum]);

	// Full-page skeleton
	if (loadingCurriculums) {
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
					<div className="flex justify-between items-center">
						<Skeleton className="h-8 w-56" />
						<Skeleton className="h-9 w-36" />
					</div>
					<div className="grid grid-cols-2 gap-4">
						<Skeleton className="h-20 rounded-xl" />
						<Skeleton className="h-20 rounded-xl" />
					</div>
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} className="h-20 w-full rounded-xl" />
					))}
				</Main>
			</>
		);
	}

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
				{/* ── Page header ── */}
				<div className="flex items-start justify-between gap-4">
					<div>
						<h1 className="text-2xl font-bold tracking-tight">
							Chương trình học
						</h1>
						<p className="text-sm text-muted-foreground mt-0.5">
							Quản lý chương trình học và danh sách môn học
						</p>
					</div>
					<Button
						size="sm"
						onClick={() => setCurriculumModal({ open: true })}
						className="shrink-0"
					>
						<Plus className="h-4 w-4 mr-2" />
						Thêm chương trình
					</Button>
				</div>

				{/* ── Stats strip ── */}
				{!!totalCurriculums && (
					<div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
						<Card className="border shadow-sm">
							<CardContent className="flex items-center gap-3 p-4">
								<div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
									<GraduationCap className="h-5 w-5 text-primary" />
								</div>
								<div>
									<p className="text-2xl font-bold leading-none">
										{totalCurriculums}
									</p>
									<p className="text-xs text-muted-foreground mt-1">
										Chương trình
									</p>
								</div>
							</CardContent>
						</Card>
						<Card className="border shadow-sm">
							<CardContent className="flex items-center gap-3 p-4">
								<div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
									<BookOpen className="h-5 w-5 text-blue-500" />
								</div>
								<div>
									<p className="text-2xl font-bold leading-none">
										{totalSubjects}
									</p>
									<p className="text-xs text-muted-foreground mt-1">Môn học</p>
								</div>
							</CardContent>
						</Card>
					</div>
				)}

				{/* ── Content ── */}
				{isError ? (
					<Card className="border-dashed border-2">
						<CardContent className="flex flex-col items-center justify-center py-12 text-sm text-destructive">
							Không thể tải danh sách chương trình học:{" "}
							{error instanceof Error
								? error.message
								: "Đã xảy ra lỗi không xác định"}
						</CardContent>
					</Card>
				) : !curriculums.length ? (
					<Card className="border-dashed border-2">
						<CardContent className="flex flex-col items-center justify-center py-16">
							<div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
								<Layers className="h-8 w-8 text-muted-foreground" />
							</div>
							<h3 className="font-semibold text-base mb-1">
								Chưa có chương trình học
							</h3>
							<p className="text-sm text-muted-foreground mb-5 text-center max-w-xs">
								Bắt đầu bằng cách tạo chương trình học đầu tiên để quản lý môn
								học.
							</p>
							<Button onClick={() => setCurriculumModal({ open: true })}>
								<Plus className="h-4 w-4 mr-2" />
								Tạo chương trình đầu tiên
							</Button>
						</CardContent>
					</Card>
				) : (
					<CurriculumTable
						data={curriculums}
						totalPages={totalPages}
						search={search}
						navigate={tableNavigate}
						subjectCounts={subjectCounts}
						onEdit={(curriculum) =>
							setCurriculumModal({ open: true, data: curriculum })
						}
						onDelete={(curriculum) =>
							setDeleteModal({
								open: true,
								type: "curriculum",
								item: curriculum,
							})
						}
						onAddSubject={(curriculum) =>
							setSubjectModal({
								open: true,
								curriculumId: curriculum.id,
							})
						}
						onCurriculumSelect={(curriculum) =>
							setSelectedCurriculum(curriculum)
						}
					/>
				)}

				{selectedCurriculum && (
					<Card className="mt-4 border border-dashed">
						<CardContent className="p-4 sm:p-6">
							<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
										<GraduationCap className="h-5 w-5 text-primary" />
									</div>
									<div>
										<p className="text-xs font-medium text-muted-foreground">
											Môn học trong chương trình
										</p>
										<h2 className="text-base font-semibold leading-tight">
											{selectedCurriculum.name}
										</h2>
									</div>
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={() =>
										setSubjectModal({
											open: true,
											curriculumId: selectedCurriculum.id,
										})
									}
								>
									<Plus className="mr-1 h-3.5 w-3.5" />
									Thêm môn
								</Button>
							</div>

							<div className="border-t border-border/60 pt-4">
								{loadingSubjects ? (
									<div className="space-y-2">
										{[1, 2].map((i) => (
											<Skeleton key={i} className="h-12 w-full rounded-lg" />
										))}
									</div>
								) : !selectedSubjects.length ? (
									<div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
										<Book className="mb-2 h-8 w-8 opacity-30" />
										<p className="text-sm">Chưa có môn học nào</p>
										<Button
											variant="outline"
											size="sm"
											className="mt-3"
											onClick={() =>
												setSubjectModal({
													open: true,
													curriculumId: selectedCurriculum.id,
												})
											}
										>
											<Plus className="mr-1 h-3.5 w-3.5" />
											Thêm môn học đầu tiên
										</Button>
									</div>
								) : (
									<div className="divide-y divide-border/60">
										{selectedSubjects.map((subject, idx) => (
											<div
												key={subject.id}
												className="group flex cursor-pointer items-center justify-between px-1 py-3 hover:bg-muted/40 sm:px-2"
												onClick={() =>
													appNavigate({
														to: "/subject/$id",
														params: { id: subject.id.toString() },
													})
												}
											>
												<div className="flex min-w-0 items-center gap-3">
													<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
														{idx + 1}
													</div>
													<div className="min-w-0">
														<span className="block truncate text-sm font-medium">
															{subject.name}
														</span>
													</div>
												</div>
												<div className="ml-4 flex shrink-0 items-center gap-1">
													<Button
														variant="ghost"
														size="icon"
														className="h-7 w-7 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
														onClick={(e) => {
															e.stopPropagation();
															setSubjectModal({
																open: true,
																data: subject,
																curriculumId: selectedCurriculum.id,
															});
														}}
													>
														<Pencil className="h-3 w-3" />
													</Button>
													<Button
														variant="ghost"
														size="icon"
														className="h-7 w-7 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
														onClick={(e) => {
															e.stopPropagation();
															setDeleteModal({
																open: true,
																type: "subject",
																item: subject,
															});
														}}
													>
														<Trash2 className="h-3 w-3" />
													</Button>
													<ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				)}

				{/* ── Modals ── */}
				<CurriculumFormModal
					open={curriculumModal.open}
					onClose={() => setCurriculumModal({ open: false })}
					data={curriculumModal.data}
				/>
				<SubjectFormModal
					open={subjectModal.open}
					onClose={() => setSubjectModal({ open: false, curriculumId: 0 })}
					data={subjectModal.data}
					curriculumId={subjectModal.curriculumId}
				/>
				<DeleteConfirmModal
					open={deleteModal.open}
					onClose={() => setDeleteModal({ ...deleteModal, open: false })}
					onConfirm={handleDelete}
					itemName={deleteModal.item?.name}
					isPending={deletingCurriculum || deletingSubject}
				/>
			</Main>
		</>
	);
};

export default CurriculumListPage;
