import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, GraduationCap, BookOpen, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	useCurriculumsList,
	useDeleteCurriculum,
} from "../queries/useCurriculum";
import { useSubjectsList, useDeleteSubject } from "../queries/useSubject";
import CurriculumItem from "../components/CurriculumItem";
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

const CurriculumListPage: React.FC = () => {
	const navigate = useNavigate();

	const [expandedIds, setExpandedIds] = useState<number[]>([]);
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

	const { data: curriculums, isLoading: loadingCurriculums } =
		useCurriculumsList();
	const { data: subjects, isLoading: loadingSubjects } = useSubjectsList();
	const { mutate: deleteCurriculum, isPending: deletingCurriculum } =
		useDeleteCurriculum();
	const { mutate: deleteSubject, isPending: deletingSubject } =
		useDeleteSubject();

	const getSubjectsByCurriculum = (curriculumId: number) =>
		subjects?.filter((s) => s.curriculum?.id === curriculumId) || [];

	const toggleExpand = (id: number) => {
		setExpandedIds((prev) =>
			prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
		);
	};

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
	const totalCurriculums = curriculums?.length ?? 0;

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
				{!curriculums?.length ? (
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
					<div className="space-y-3">
						{curriculums.map((curriculum, idx) => (
							<CurriculumItem
								key={curriculum.id}
								curriculum={curriculum}
								subjects={getSubjectsByCurriculum(curriculum.id)}
								isExpanded={expandedIds.includes(curriculum.id)}
								isLoading={loadingSubjects}
								colorIndex={idx}
								onToggle={() => toggleExpand(curriculum.id)}
								onEdit={() =>
									setCurriculumModal({ open: true, data: curriculum })
								}
								onDelete={() =>
									setDeleteModal({
										open: true,
										type: "curriculum",
										item: curriculum,
									})
								}
								onAddSubject={() =>
									setSubjectModal({ open: true, curriculumId: curriculum.id })
								}
								onEditSubject={(subject) =>
									setSubjectModal({
										open: true,
										data: subject,
										curriculumId: curriculum.id,
									})
								}
								onDeleteSubject={(subject) =>
									setDeleteModal({ open: true, type: "subject", item: subject })
								}
								onSubjectClick={(subject) =>
									navigate({
										to: "/subject/$id",
										params: { id: subject.id.toString() },
									})
								}
							/>
						))}
					</div>
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
