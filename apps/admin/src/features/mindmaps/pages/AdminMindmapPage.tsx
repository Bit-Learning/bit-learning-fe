import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusIcon, SearchIcon } from "lucide-react";
import {
	useAdminThemes,
	useAdminCreateTheme,
	useAdminPatchTheme,
	useAdminDeleteTheme,
	useAdminStructures,
	useAdminCreateStructure,
	useAdminPatchStructure,
	useAdminDeleteStructure,
} from "../queries/useMindmap";
import {
	MindMapThemeRequest,
	MindMapStructureRequest,
	ThemeConfigDto,
	StructureConfigDto,
} from "../types/mindmap.type";
import { TemplateCard } from "../components/TemplateCard";
import { ThemeFormDialog } from "../components/ThemeFormDialog";
import ThemeDetailModal from "../components/ThemeDetailModal";
import { StructureFormDialog } from "../components/StructureFormDialog";
import StructureDetailModal from "../components/StructureDetailModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { Main } from "@/layout/main";
import { Header } from "@/layout/header";

export default function AdminMindmapPage() {
	// Themes state & queries
	const { data: themes = [], isLoading: isLoadingThemes } = useAdminThemes();
	const createThemeMutation = useAdminCreateTheme();
	const patchThemeMutation = useAdminPatchTheme();
	const deleteThemeMutation = useAdminDeleteTheme();

	const [themeSearch, setThemeSearch] = useState("");
	const [themeFormOpen, setThemeFormOpen] = useState(false);
	const [editThemeTarget, setEditThemeTarget] = useState<
		ThemeConfigDto | undefined
	>();
	const [viewThemeTarget, setViewThemeTarget] = useState<
		ThemeConfigDto | undefined
	>();
	const [deleteThemeTarget, setDeleteThemeTarget] = useState<
		ThemeConfigDto | undefined
	>();

	const filteredThemes = themes.filter((t) =>
		t.name.toLowerCase().includes(themeSearch.toLowerCase()),
	);

	const openCreateTheme = () => {
		setEditThemeTarget(undefined);
		setThemeFormOpen(true);
	};

	const openViewTheme = (id: number) =>
		setViewThemeTarget(themes.find((t) => t.id === id));

	const openEditTheme = (id: number) => {
		setEditThemeTarget(themes.find((t) => t.id === id));
		setThemeFormOpen(true);
	};

	const openDeleteTheme = (id: number) =>
		setDeleteThemeTarget(themes.find((t) => t.id === id));

	const handleThemeFormSubmit = (
		data: MindMapThemeRequest,
		thumbnail: File | null,
	) => {
		if (editThemeTarget) {
			patchThemeMutation.mutate(
				{ id: editThemeTarget.id, request: data, thumbnail },
				{ onSuccess: () => setThemeFormOpen(false) },
			);
		} else {
			createThemeMutation.mutate(
				{ request: data, thumbnail },
				{ onSuccess: () => setThemeFormOpen(false) },
			);
		}
	};

	const handleDeleteTheme = () => {
		if (!deleteThemeTarget) return;
		deleteThemeMutation.mutate(deleteThemeTarget.id, {
			onSuccess: () => setDeleteThemeTarget(undefined),
		});
	};

	const isSavingTheme =
		createThemeMutation.isPending || patchThemeMutation.isPending;

	// Structures state & queries
	const { data: structures = [], isLoading: isLoadingStructures } =
		useAdminStructures();
	const createStructureMutation = useAdminCreateStructure();
	const patchStructureMutation = useAdminPatchStructure();
	const deleteStructureMutation = useAdminDeleteStructure();

	const [structureSearch, setStructureSearch] = useState("");
	const [structureFormOpen, setStructureFormOpen] = useState(false);
	const [editStructureTarget, setEditStructureTarget] = useState<
		StructureConfigDto | undefined
	>();
	const [viewStructureTarget, setViewStructureTarget] = useState<
		StructureConfigDto | undefined
	>();
	const [deleteStructureTarget, setDeleteStructureTarget] = useState<
		StructureConfigDto | undefined
	>();

	const filteredStructures = structures.filter((s) =>
		s.name.toLowerCase().includes(structureSearch.toLowerCase()),
	);

	const openCreateStructure = () => {
		setEditStructureTarget(undefined);
		setStructureFormOpen(true);
	};

	const openViewStructure = (id: number) =>
		setViewStructureTarget(structures.find((s) => s.id === id));

	const openEditStructure = (id: number) => {
		setEditStructureTarget(structures.find((s) => s.id === id));
		setStructureFormOpen(true);
	};

	const openDeleteStructure = (id: number) =>
		setDeleteStructureTarget(structures.find((s) => s.id === id));

	const handleStructureFormSubmit = (
		data: MindMapStructureRequest,
		thumbnail: File | null,
	) => {
		if (editStructureTarget) {
			patchStructureMutation.mutate(
				{ id: editStructureTarget.id, request: data, thumbnail },
				{ onSuccess: () => setStructureFormOpen(false) },
			);
		} else {
			createStructureMutation.mutate(
				{ request: data, thumbnail },
				{ onSuccess: () => setStructureFormOpen(false) },
			);
		}
	};

	const handleDeleteStructure = () => {
		if (!deleteStructureTarget) return;
		deleteStructureMutation.mutate(deleteStructureTarget.id, {
			onSuccess: () => setDeleteStructureTarget(undefined),
		});
	};

	const isSavingStructure =
		createStructureMutation.isPending || patchStructureMutation.isPending;

	return (
		<>
			<Header />

			<div className="flex flex-1 flex-col gap-6 p-8">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-bold">Quản lý sơ đồ tư duy</h1>
						<p className="text-muted-foreground mt-1 text-sm">
							Quản lý bảng màu, style và cấu trúc cho mindmap
						</p>
					</div>
				</div>

				<Tabs defaultValue="themes" className="mt-4">
					<TabsList>
						<TabsTrigger value="themes">Chủ đề</TabsTrigger>
						<TabsTrigger value="structures">Cấu trúc</TabsTrigger>
					</TabsList>

					<TabsContent value="themes" className="mt-6 flex flex-col gap-6">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-xl font-semibold">Quản lý chủ đề</h2>
								<p className="text-muted-foreground mt-1 text-sm">
									Quản lý bảng màu và style cho sơ đồ tư duy
								</p>
							</div>
							<Button onClick={openCreateTheme}>
								<PlusIcon className="mr-2 h-4 w-4" />
								Thêm chủ đề
							</Button>
						</div>

						<div className="relative max-w-full">
							<SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
							<Input
								className="pl-9"
								placeholder="Tìm kiếm..."
								value={themeSearch}
								onChange={(e) => setThemeSearch(e.target.value)}
							/>
						</div>

						{isLoadingThemes ? (
							<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
								{Array.from({ length: 8 }).map((_, i) => (
									<Skeleton key={i} className="h-52 rounded-xl" />
								))}
							</div>
						) : filteredThemes.length === 0 ? (
							<div className="text-muted-foreground flex h-40 items-center justify-center text-sm">
								{themeSearch ? "Không tìm thấy kết quả" : "Chưa có theme nào"}
							</div>
						) : (
							<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
								{filteredThemes.map((t) => (
									<TemplateCard
										key={t.id}
										id={t.id}
										name={t.name}
										description={t.description}
										thumbnailUrl={t.thumbnailUrl}
										isActive={t.isActive}
										colors={t.colors}
										onView={openViewTheme}
										onEdit={openEditTheme}
										onDelete={openDeleteTheme}
									/>
								))}
							</div>
						)}

						<ThemeDetailModal
							open={!!viewThemeTarget}
							data={viewThemeTarget}
							onClose={() => setViewThemeTarget(undefined)}
						/>

						<ThemeFormDialog
							open={themeFormOpen}
							editTarget={editThemeTarget}
							isPending={isSavingTheme}
							onSubmit={handleThemeFormSubmit}
							onClose={() => setThemeFormOpen(false)}
						/>

						<DeleteConfirmModal
							open={!!deleteThemeTarget}
							itemName={deleteThemeTarget?.name}
							isPending={deleteThemeMutation.isPending}
							onConfirm={handleDeleteTheme}
							onClose={() => setDeleteThemeTarget(undefined)}
						/>
					</TabsContent>

					<TabsContent value="structures" className="mt-6 flex flex-col gap-6">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-xl font-semibold">Quản lý cấu trúc</h2>
								<p className="text-muted-foreground mt-1 text-sm">
									Quản lý bố cục cho sơ đồ tư duy
								</p>
							</div>
							<Button onClick={openCreateStructure}>
								<PlusIcon className="mr-2 h-4 w-4" />
								Thêm cấu trúc
							</Button>
						</div>

						<div className="relative max-w-full">
							<SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
							<Input
								className="pl-9"
								placeholder="Tìm kiếm..."
								value={structureSearch}
								onChange={(e) => setStructureSearch(e.target.value)}
							/>
						</div>

						{isLoadingStructures ? (
							<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
								{Array.from({ length: 8 }).map((_, i) => (
									<Skeleton key={i} className="h-52 rounded-xl" />
								))}
							</div>
						) : filteredStructures.length === 0 ? (
							<div className="text-muted-foreground flex h-40 items-center justify-center text-sm">
								{structureSearch
									? "Không tìm thấy kết quả"
									: "Chưa có structure nào"}
							</div>
						) : (
							<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
								{filteredStructures.map((s) => (
									<TemplateCard
										key={s.id}
										id={s.id}
										name={s.name}
										description={s.description}
										thumbnailUrl={s.thumbnailUrl}
										isActive={s.isActive}
										metaChips={[
											s.elkAlgorithm,
											...(s.edgeType ? [s.edgeType] : []),
										]}
										onView={openViewStructure}
										onEdit={openEditStructure}
										onDelete={openDeleteStructure}
									/>
								))}
							</div>
						)}

						<StructureDetailModal
							open={!!viewStructureTarget}
							data={viewStructureTarget}
							onClose={() => setViewStructureTarget(undefined)}
						/>

						<StructureFormDialog
							open={structureFormOpen}
							editTarget={editStructureTarget}
							isPending={isSavingStructure}
							onSubmit={handleStructureFormSubmit}
							onClose={() => setStructureFormOpen(false)}
						/>

						<DeleteConfirmModal
							open={!!deleteStructureTarget}
							itemName={deleteStructureTarget?.name}
							isPending={deleteStructureMutation.isPending}
							onConfirm={handleDeleteStructure}
							onClose={() => setDeleteStructureTarget(undefined)}
						/>
					</TabsContent>
				</Tabs>
			</div>
		</>
	);
}
