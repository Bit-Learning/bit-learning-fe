import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusIcon, SearchIcon } from "lucide-react";
import {
  useAdminStructures,
  useAdminCreateStructure,
  useAdminPatchStructure,
  useAdminDeleteStructure,
} from "../queries/useMindmap";
import { MindMapStructureRequest, StructureConfigDto } from "../types/mindmap.type";
import { TemplateCard } from "../components/TemplateCard";
import { StructureFormDialog } from "../components/StructureFormDialog";
import StructureDetailModal from "../components/StructureDetailModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";

export default function AdminStructuresPage() {
  const { data: structures = [], isLoading } = useAdminStructures();

  const createMutation = useAdminCreateStructure();
  const patchMutation = useAdminPatchStructure();
  const deleteMutation = useAdminDeleteStructure();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StructureConfigDto | undefined>();
  const [viewTarget, setViewTarget] = useState<StructureConfigDto | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<StructureConfigDto | undefined>();

  const filtered = structures.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => {
    setEditTarget(undefined);
    setFormOpen(true);
  };

  const openView = (id: number) => setViewTarget(structures.find((s) => s.id === id));

  const openEdit = (id: number) => {
    setEditTarget(structures.find((s) => s.id === id));
    setFormOpen(true);
  };

  const openDelete = (id: number) => setDeleteTarget(structures.find((s) => s.id === id));

  const handleFormSubmit = (data: MindMapStructureRequest, thumbnail: File | null) => {
    if (editTarget) {
      patchMutation.mutate({ id: editTarget.id, request: data, thumbnail }, { onSuccess: () => setFormOpen(false) });
    } else {
      createMutation.mutate({ request: data, thumbnail }, { onSuccess: () => setFormOpen(false) });
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(undefined) });
  };

  const isSaving = createMutation.isPending || patchMutation.isPending;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Structures</h1>
          <p className="text-muted-foreground mt-1 text-sm">Quản lý layout ELK cho mindmap</p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Thêm Structure
        </Button>
      </div>

      <div className="relative max-w-full">
        <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input className="pl-9" placeholder="Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-muted-foreground flex h-40 items-center justify-center text-sm">
          {search ? "Không tìm thấy kết quả" : "Chưa có structure nào"}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((s) => (
            <TemplateCard
              key={s.id}
              id={s.id}
              name={s.name}
              description={s.description}
              thumbnailUrl={s.thumbnailUrl}
              isActive={s.isActive}
              metaChips={[s.elkAlgorithm, ...(s.edgeType ? [s.edgeType] : [])]}
              onView={openView}
              onEdit={openEdit}
              onDelete={openDelete}
            />
          ))}
        </div>
      )}

      <StructureDetailModal open={!!viewTarget} data={viewTarget} onClose={() => setViewTarget(undefined)} />

      <StructureFormDialog
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
    </div>
  );
}
