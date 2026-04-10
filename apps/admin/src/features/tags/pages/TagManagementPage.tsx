import React, { useState } from "react";
import { Loader2, Pencil, Plus, Tag, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import TagFormModal from "../components/TagFormModal";
import { useDeleteTag, useGetAllTags } from "../queries/useTag";
import type { TagResponse } from "../types/tag.type";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/layout/header";
import { Main } from "@/layout/main";

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

	const handleConfirmDelete = () => {
		if (!deleteTarget) return;
		deleteTag(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
	};

	return (
		<>
			<Header />

			<Main className="flex flex-1 flex-col gap-6 p-8">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">Quản lý Tags</h1>
							<p className="text-sm text-gray-500">
								Tạo và quản lý tags cho bài tập lập trình
							</p>
						</div>
					</div>
					<Button
						onClick={() => setFormModal({ open: true })}
						className="bg-primary text-white hover:bg-blue-700"
					>
						<Plus className="mr-1.5 h-4 w-4" />
						Thêm tag
					</Button>
				</div>

				<div className="rounded-xl border border-gray-200 bg-white shadow-sm">
					<div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
						<span className="text-sm font-medium text-gray-700">
							Tất cả tags
						</span>
						{!isLoading && (
							<Badge variant="secondary" className="text-xs">
								{tags.length} tags
							</Badge>
						)}
					</div>

					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<Loader2 className="h-6 w-6 animate-spin text-blue-600" />
						</div>
					) : tags.length === 0 ? (
						<div className="py-12 text-center">
							<Tag className="mx-auto mb-3 h-10 w-10 text-gray-300" />
							<p className="text-sm text-gray-500">Chưa có tag nào.</p>
							<button
								onClick={() => setFormModal({ open: true })}
								className="mt-2 text-sm font-medium text-blue-600 hover:underline"
							>
								Tạo tag đầu tiên →
							</button>
						</div>
					) : (
						<ul className="divide-y divide-gray-100">
							{tags.map((tag) => (
								<li key={tag.id} className="flex items-center gap-3 px-5 py-3">
									<span className="flex-1 text-sm font-medium text-gray-800">
										{tag.name}
									</span>
									<span className="text-xs text-gray-400">
										{new Date(tag.createdAt).toLocaleDateString("vi-VN")}
									</span>
									<Button
										size="sm"
										variant="ghost"
										onClick={() => setFormModal({ open: true, tag })}
										className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600"
									>
										<Pencil className="h-3.5 w-3.5" />
									</Button>
									<Button
										size="sm"
										variant="ghost"
										onClick={() =>
											setDeleteTarget({ id: tag.id, name: tag.name })
										}
										className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
									>
										<Trash2 className="h-3.5 w-3.5" />
									</Button>
								</li>
							))}
						</ul>
					)}
				</div>

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
			</Main>
		</>
	);
};

export default TagManagementPage;
