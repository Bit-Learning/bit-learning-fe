import React, { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
	ChevronRight,
	Download,
	Calendar,
	FileText,
	CheckCircle,
	ExternalLink,
} from "lucide-react";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTemplate, useDeleteTemplate } from "../queries/useTemplate";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { formatDate } from "../components/TemplateCard";

export const TemplateDetailPage: React.FC = () => {
	const navigate = useNavigate();
	const { id } = useParams({ from: "/_authenticated/templates/$id/" });
	const templateId = parseInt(id);

	const [isDeleteOpen, setIsDeleteOpen] = useState(false);

	const { data: templateData, isLoading, isError } = useTemplate(templateId);
	const deleteTemplate = useDeleteTemplate();

	const template = templateData?.data;

	const handleDownload = () => {
		if (template?.url) window.open(template.url, "_blank");
	};

	const handleDelete = () => {
		deleteTemplate.mutate(templateId, {
			onSuccess: () => {
				setIsDeleteOpen(false);
				navigate({ to: "/templates" });
			},
		});
	};

	if (isLoading) {
		return (
			<main className="flex-1 overflow-y-auto bg-white">
				<div className="max-w-7xl mx-auto px-10 py-8 space-y-6">
					<Skeleton className="h-10 w-64" />
					<div className="grid grid-cols-12 gap-8">
						<Skeleton className="col-span-8 h-150 rounded-xl" />
						<Skeleton className="col-span-4 h-96 rounded-xl" />
					</div>
				</div>
			</main>
		);
	}

	if (isError || !template) {
		return (
			<main className="flex-1 flex items-center justify-center bg-white">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-slate-900 mb-2">
						Template không tồn tại
					</h2>
					<Button onClick={() => navigate({ to: "/templates" })}>
						Quay lại danh sách
					</Button>
				</div>
			</main>
		);
	}

	return (
		<>
			<main className="flex-1 overflow-y-auto bg-white">
				<div className=" mx-auto p-8">
					<div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-8">
						<div>
							<nav className="flex text-sm text-slate-500 mb-2 items-center gap-2">
								<button
									onClick={() => navigate({ to: "/templates" })}
									className="hover:text-blue-600 transition-colors"
								>
									Quản lý Mẫu Slide
								</button>
								<ChevronRight className="w-4 h-4" />
								<span className="text-slate-900 font-semibold">
									Chi tiết mẫu
								</span>
							</nav>
							<h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
								Chi tiết mẫu slide
							</h2>
						</div>
						<div className="flex items-center gap-3">
							<Button
								variant="secondary"
								className="bg-slate-100 hover:bg-slate-200 text-slate-600"
								onClick={handleDownload}
							>
								<Download className="w-4 h-4 mr-2" />
								Tải file gốc
							</Button>
							<Button
								variant="outline"
								className="text-red-600 border-red-200 hover:bg-red-50"
								onClick={() => setIsDeleteOpen(true)}
							>
								Xóa mẫu
							</Button>
							<Button
								className="bg-primary hover:bg-blue-700 shadow-md shadow-blue-100"
								onClick={() =>
									navigate({ to: "/templates/$id/edit", params: { id } })
								}
							>
								Cập nhật
							</Button>
						</div>
					</div>

					<div className="grid grid-cols-12 gap-8">
						<div className="col-span-12 lg:col-span-8">
							<Card
								className="overflow-hidden border-slate-200 shadow-sm p-0"
								style={{ height: 680 }}
							>
								{template.previewPdfUrl ? (
									<iframe
										src={template.previewPdfUrl}
										title={`Preview - ${template.name}`}
										className="h-full w-full border-0"
									/>
								) : (
									<div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-300">
										<FileText className="w-16 h-16" />
										<p className="text-sm text-slate-400">
											Không có file để hiển thị
										</p>
									</div>
								)}
							</Card>
						</div>

						<div className="col-span-12 lg:col-span-4 space-y-6">
							<Card className="border-slate-200 shadow-sm">
								<CardContent className="p-8">
									<h3 className="text-2xl font-bold mb-4 text-slate-900 leading-tight">
										{template.name}
									</h3>
									<p className="text-slate-600 leading-relaxed mb-8 font-medium">
										{template.description || "Không có mô tả cho mẫu này."}
									</p>
									<div className="space-y-5 border-t border-slate-50 pt-8">
										<div className="flex justify-between items-center">
											<span className="text-sm text-slate-500 font-medium flex items-center gap-3">
												<Calendar className="w-5 h-5 text-slate-400" />
												Ngày tạo
											</span>
											<span className="text-sm font-bold text-slate-900">
												{formatDate(template.createdAt)}
											</span>
										</div>
										<div className="flex justify-between items-center">
											<span className="text-sm text-slate-500 font-medium flex items-center gap-3">
												<Calendar className="w-5 h-5 text-slate-400" />
												Cập nhật
											</span>
											<span className="text-sm font-bold text-slate-900">
												{formatDate(template.updatedAt)}
											</span>
										</div>
										<div className="flex justify-between items-center">
											<span className="text-sm text-slate-500 font-medium flex items-center gap-3">
												<FileText className="w-5 h-5 text-slate-400" />
												Định dạng
											</span>
											<span className="text-sm font-bold text-slate-900">
												.pdf
											</span>
										</div>
										<div className="flex justify-between items-center">
											<span className="text-sm text-slate-500 font-medium flex items-center gap-3">
												<CheckCircle className="w-5 h-5 text-slate-400" />
												Trạng thái
											</span>
											<Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[11px] font-extrabold uppercase tracking-wider">
												Đang kích hoạt
											</Badge>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card className="border-slate-200 shadow-sm">
								<CardContent className="p-6">
									<a
										href={template.previewPdfUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
									>
										<ExternalLink className="w-4 h-4" />
										Mở PDF trong tab mới
									</a>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</main>

			<DeleteConfirmModal
				open={isDeleteOpen}
				itemName={template.name}
				isPending={deleteTemplate.isPending}
				onConfirm={handleDelete}
				onClose={() => setIsDeleteOpen(false)}
			/>
		</>
	);
};
