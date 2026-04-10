import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusIcon, SearchIcon } from "lucide-react";
import {
	useAdminThemes,
	useAdminCreateTheme,
	useAdminPatchTheme,
	useAdminDeleteTheme,
} from "../queries/useMindmap";
import { MindMapThemeRequest, ThemeConfigDto } from "../types/mindmap.type";
import { TemplateCard } from "../components/TemplateCard";
import { ThemeFormDialog } from "../components/ThemeFormDialog";
import ThemeDetailModal from "../components/ThemeDetailModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { Main } from "@/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/layout/header";

export default function AdminThemesPage() {
	const { data: themes = [], isLoading } = useAdminThemes();

	const createMutation = useAdminCreateTheme();
	const patchMutation = useAdminPatchTheme();
	const deleteMutation = useAdminDeleteTheme();

	const [search, setSearch] = useState("");
	const [formOpen, setFormOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<ThemeConfigDto | undefined>();
	const [viewTarget, setViewTarget] = useState<ThemeConfigDto | undefined>();
	const [deleteTarget, setDeleteTarget] = useState<
		ThemeConfigDto | undefined
	>();

	const filtered = themes.filter((t) =>
		t.name.toLowerCase().includes(search.toLowerCase()),
	);

	const openCreate = () => {
		setEditTarget(undefined);
		setFormOpen(true);
	};

	const openView = (id: number) =>
		setViewTarget(themes.find((t) => t.id === id));

	const openEdit = (id: number) => {
		setEditTarget(themes.find((t) => t.id === id));
		setFormOpen(true);
	};

	const openDelete = (id: number) =>
		setDeleteTarget(themes.find((t) => t.id === id));

	const handleFormSubmit = (
		data: MindMapThemeRequest,
		thumbnail: File | null,
	) => {
		if (editTarget) {
			patchMutation.mutate(
				{ id: editTarget.id, request: data, thumbnail },
				{ onSuccess: () => setFormOpen(false) },
			);
		} else {
			createMutation.mutate(
				{ request: data, thumbnail },
				{ onSuccess: () => setFormOpen(false) },
			);
		}
	};

	const handleDelete = () => {
		if (!deleteTarget) return;
		deleteMutation.mutate(deleteTarget.id, {
			onSuccess: () => setDeleteTarget(undefined),
		});
	};

	const isSaving = createMutation.isPending || patchMutation.isPending;

	return (
		<>
			<Header />

			<Main className="flex flex-1 flex-col gap-6 p-8">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold">Themes</h1>
						<p className="text-muted-foreground mt-1 text-sm">
							Quản lý bảng màu và style cho mindmap
						</p>
					</div>
					<Button onClick={openCreate}>
						<PlusIcon className="mr-2 h-4 w-4" />
						Thêm Theme
					</Button>
				</div>

				<div className="relative max-w-full">
					<SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
					<Input
						className="pl-9"
						placeholder="Tìm kiếm..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>

				{isLoading ? (
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
						{Array.from({ length: 8 }).map((_, i) => (
							<Skeleton key={i} className="h-52 rounded-xl" />
						))}
					</div>
				) : filtered.length === 0 ? (
					<div className="text-muted-foreground flex h-40 items-center justify-center text-sm">
						{search ? "Không tìm thấy kết quả" : "Chưa có theme nào"}
					</div>
				) : (
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
						{filtered.map((t) => (
							<TemplateCard
								key={t.id}
								id={t.id}
								name={t.name}
								description={t.description}
								thumbnailUrl={t.thumbnailUrl}
								isActive={t.isActive}
								colors={t.colors}
								onView={openView}
								onEdit={openEdit}
								onDelete={openDelete}
							/>
						))}
					</div>
				)}

				<ThemeDetailModal
					open={!!viewTarget}
					data={viewTarget}
					onClose={() => setViewTarget(undefined)}
				/>

				<ThemeFormDialog
					open={formOpen}
					editTarget={editTarget}
					isPending={isSaving}
					onSubmit={handleFormSubmit}
					onClose={() => setFormOpen(false)}
				/>

				<DeleteConfirmModal
					open={!!deleteTarget}
					itemName={deleteTarget?.name}
					isPending={deleteMutation.isPending}
					onConfirm={handleDelete}
					onClose={() => setDeleteTarget(undefined)}
				/>
			</Main>
		</>
	);
}
