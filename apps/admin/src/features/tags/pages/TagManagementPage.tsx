import type React from "react";
import { useState } from "react";
import { Loader2, Plus, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { Header } from "@/layout/header";
import { Main } from "@/layout/main";
import TagFormModal from "../components/TagFormModal";
import { TagsTable } from "../components/tags-tables";
import { useDeleteTag, useGetAllTags } from "../queries/useTag";
import type { TagResponse } from "../types/tag.type";

const TagManagementPage: React.FC = () => {
	const [formModal, setFormModal] = useState<{
		open: boolean;
		tag?: TagResponse;
	}>({ open: false });
	const [deleteTarget, setDeleteTarget] = useState<{
		id: string;
		name: string;
	} | null>(null);

	const { data: tags = [], isLoading } = useGetAllTags();
	const { mutate: deleteTag, isPending: isDeleting } = useDeleteTag();

	const handleEditTag = (tag: TagResponse) => {
		setFormModal({ open: true, tag });
	};

	const handleAskDeleteTag = (tag: TagResponse) => {
		setDeleteTarget({ id: tag.id, name: tag.name });
	};

	const handleConfirmDelete = () => {
		if (!deleteTarget) return;
		deleteTag(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
	};

	return (
		<>
			<Header />

			<div className="flex flex-1 flex-col gap-2 sm:gap-6 p-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div>
							<h1 className="text-2xl font-bold text-foreground">
								Quản lý Tags
							</h1>
							<p className="text-sm text-muted-foreground">
								Tạo và quản lý tags cho bài tập lập trình
							</p>
						</div>
					</div>
					<Button
						onClick={() => setFormModal({ open: true })}
						className="bg-primary text-primary-foreground hover:bg-primary/90"
					>
						<Plus className="mr-1.5 h-4 w-4" />
						Tạo mới
					</Button>
				</div>

				<Card className="gap-0 overflow-hidden border shadow-sm">
					<div className="flex items-center justify-start border-b bg-muted/30 px-5 py-3">
						<span className="text-sm font-medium text-foreground">
							Tổng số tags:
						</span>
						{!isLoading && (
							<Badge variant="secondary" className="ml-2 text-xs">
								{tags.length} tags
							</Badge>
						)}
					</div>

					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<Loader2 className="h-6 w-6 animate-spin text-primary" />
						</div>
					) : tags.length === 0 ? (
						<div className="py-12 text-center">
							<Tag className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
							<p className="text-sm text-muted-foreground">Chưa có tag nào.</p>
							<button
								type="button"
								onClick={() => setFormModal({ open: true })}
								className="mt-2 text-sm font-medium text-primary hover:underline"
							>
								Tạo tag đầu tiên →
							</button>
						</div>
					) : (
						<div className="p-4">
							<TagsTable
								data={tags}
								onEdit={handleEditTag}
								onDelete={handleAskDeleteTag}
							/>
						</div>
					)}
				</Card>

				<TagFormModal
					open={formModal.open}
					onClose={() => setFormModal({ open: false })}
					tag={formModal.tag}
				/>

				<DeleteConfirmModal
					open={!!deleteTarget}
					onClose={() => setDeleteTarget(null)}
					onConfirm={handleConfirmDelete}
					itemName={deleteTarget?.name}
					isPending={isDeleting}
					title="Xóa tag"
				/>
			</div>
		</>
	);
};

export default TagManagementPage;
