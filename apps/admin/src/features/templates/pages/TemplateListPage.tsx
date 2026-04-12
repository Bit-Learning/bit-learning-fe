import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
	SearchIcon,
	Plus,
	Filter,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { TemplateCard } from "../components/TemplateCard";
import { TemplateListParams } from "../types/template.type";
import { useTemplates, useDeleteTemplate } from "../queries/useTemplate";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { Main } from "@/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { ConfigDrawer } from "@/components/config-drawer";
import { Header } from "@/layout/header";

export const TemplateListPage: React.FC = () => {
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState("");
	const [params, setParams] = useState<TemplateListParams>({
		page: 1,
		size: 6,
		sortBy: "createdAt",
		sortDir: "desc",
	});
	const [deleteTarget, setDeleteTarget] = useState<
		{ id: number; name: string } | undefined
	>();

	const { data: templatesData, isLoading } = useTemplates();
	const deleteTemplate = useDeleteTemplate();

	const templates = templatesData?.data ?? [];
	const totalCount = templatesData?.page?.totalElements ?? 0;
	const totalPages = templatesData?.page?.totalPages ?? 1;

	const handleViewDetail = (id: number) => {
		navigate({ to: "/templates/$id", params: { id: id.toString() } });
	};

	const handleEdit = (id: number) => {
		navigate({ to: "/templates/$id/edit", params: { id: id.toString() } });
	};

	const handleDownload = (url: string) => {
		window.open(url, "_blank");
	};

	const handleDelete = () => {
		if (!deleteTarget) return;
		deleteTemplate.mutate(deleteTarget.id, {
			onSuccess: () => setDeleteTarget(undefined),
		});
	};

	return (
		<>
			<Header />

			<div className="flex flex-1 flex-col gap-6 p-8">
				<div className="flex items-center justify-between mb-8">
					<div>
						<h2 className="text-2xl font-bold text-slate-900">
							Quản lý Mẫu Slide
						</h2>
						<p className="text-slate-500 text-sm mt-1">
							Quản lý và cập nhật kho tài liệu slide thuyết trình của hệ thống.
						</p>
					</div>
					<Button
						onClick={() => navigate({ to: "/templates/create" })}
						className="bg-primary hover:bg-blue-700 shadow-sm"
					>
						<Plus className="w-4 h-4 mr-2" />
						Tạo mẫu mới
					</Button>
				</div>

				<div className="flex flex-col sm:flex-row gap-4 mb-6">
					<div className="relative flex-1">
						<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
						<Input
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10 border-slate-200 focus-visible:ring-blue-500/20 focus-visible:border-blue-600"
							placeholder="Tìm kiếm mẫu slide..."
						/>
					</div>
					<Button variant="outline" className="border-slate-200">
						<Filter className="w-4 h-4 mr-2" />
						Lọc
					</Button>
				</div>

				{isLoading ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{Array.from({ length: 6 }).map((_, i) => (
							<Skeleton key={i} className="h-72 rounded-xl" />
						))}
					</div>
				) : templates.length === 0 ? (
					<div className="text-center py-12">
						<p className="text-slate-500">Không có mẫu slide nào</p>
						<Button
							onClick={() => navigate({ to: "/templates/create" })}
							className="mt-4"
						>
							Tạo mẫu mới
						</Button>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{templates.map((template) => (
							<TemplateCard
								key={template.id}
								template={template}
								onClick={() => handleViewDetail(template.id)}
								onEdit={() => handleEdit(template.id)}
								onDownload={() => handleDownload(template.url)}
								onDelete={() =>
									setDeleteTarget({ id: template.id, name: template.name })
								}
							/>
						))}
					</div>
				)}

				<div className="mt-12 flex items-center justify-between border-t border-slate-200 pt-6">
					<p className="text-sm text-slate-500">
						Trang {params.page} / {totalPages} — {totalCount} mẫu
					</p>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="icon"
							disabled={params.page === 1}
							onClick={() =>
								setParams({ ...params, page: (params.page || 1) - 1 })
							}
							className="border-slate-200"
						>
							<ChevronLeft className="w-4 h-4" />
						</Button>

						{[...Array(totalPages)].map((_, i) => {
							const pageNum = i + 1;
							if (
								pageNum === 1 ||
								pageNum === totalPages ||
								(pageNum >= (params.page || 1) - 1 &&
									pageNum <= (params.page || 1) + 1)
							) {
								return (
									<Button
										key={i}
										size="icon"
										variant={params.page === pageNum ? "default" : "outline"}
										className={
											params.page === pageNum
												? "bg-primary text-white hover:bg-blue-700"
												: "border-slate-200"
										}
										onClick={() => setParams({ ...params, page: pageNum })}
									>
										{pageNum}
									</Button>
								);
							} else if (
								pageNum === (params.page || 1) - 2 ||
								pageNum === (params.page || 1) + 2
							) {
								return (
									<span key={i} className="text-slate-400 px-2">
										...
									</span>
								);
							}
							return null;
						})}

						<Button
							variant="outline"
							size="icon"
							disabled={params.page === totalPages}
							onClick={() =>
								setParams({ ...params, page: (params.page || 1) + 1 })
							}
							className="border-slate-200"
						>
							<ChevronRight className="w-4 h-4" />
						</Button>
					</div>
				</div>

				<DeleteConfirmModal
					open={!!deleteTarget}
					itemName={deleteTarget?.name}
					isPending={deleteTemplate.isPending}
					onConfirm={handleDelete}
					onClose={() => setDeleteTarget(undefined)}
				/>
			</div>
		</>
	);
};
