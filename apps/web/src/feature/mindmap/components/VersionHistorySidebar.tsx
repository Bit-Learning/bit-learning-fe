import { useState } from "react";
import { History, X, RotateCcw, Eye, Loader2 } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { toast } from "@/shared/components/Sonner";
import { extractApiErrorMessage } from "@/shared/lib/api-error";
import { mindmapApi } from "../apis/mindmap.api";
import {
	useGetMindMapVersions,
	useRestoreMindMapVersion,
} from "../queries/use-mindmap-queries";
import type {
	MindMapGenerateResponse,
	MindMapVersionDto,
} from "../types/mindmap.type";

interface VersionHistorySidebarProps {
	mindMapId: number;
	currentVersion: number;
	previewVersionNumber?: number | null;
	onPreview: (detail: MindMapVersionDto) => void;
	onRestored: (response: MindMapGenerateResponse) => void;
	onClose: () => void;
}

function formatDate(dateStr: string) {
	try {
		return new Date(dateStr).toLocaleDateString("vi-VN", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch {
		return dateStr;
	}
}

export default function VersionHistorySidebar({
	mindMapId,
	currentVersion,
	previewVersionNumber,
	onPreview,
	onRestored,
	onClose,
}: VersionHistorySidebarProps) {
	const [loadingVersion, setLoadingVersion] = useState<number | null>(null);

	const { data, isLoading } = useGetMindMapVersions(mindMapId);
	const { mutate: restore, isPending: isRestoring } =
		useRestoreMindMapVersion();

	const versions = data?.data?.data ?? [];

	const handlePreview = async (versionNumber: number) => {
		setLoadingVersion(versionNumber);
		try {
			const res = await mindmapApi.getVersion(mindMapId, versionNumber);
			const detail = res.data.data;
			if (detail) onPreview(detail);
		} catch (error) {
			toast.error({
				title: "Lỗi khi tải phiên bản",
				description: extractApiErrorMessage(error, "Không thể tải phiên bản."),
			});
			return;
			toast.error({ title: "Lỗi khi tải phiên bản" });
		} finally {
			setLoadingVersion(null);
		}
	};

	const handleRestore = (versionNumber: number) => {
		restore(
			{ id: mindMapId, versionNumber },
			{
				onSuccess: (res) => {
					const responseData = res.data.data;
					if (responseData) onRestored(responseData);
					toast.success({ title: `Đã khôi phục về v${versionNumber}` });
				},
				onError: (error) => {
					toast.error({
						title: "Lỗi khi khôi phục phiên bản",
						description: extractApiErrorMessage(
							error,
							"Không thể khôi phục phiên bản.",
						),
					});
					return;
					toast.error({ title: "Lỗi khi khôi phục phiên bản" });
				},
			},
		);
	};

	return (
		<div className="flex w-72 shrink-0 flex-col border-l border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
			{/* Header */}
			<div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
				<div className="flex items-center gap-2">
					<History className="h-4 w-4 text-slate-600 dark:text-slate-400" />
					<span className="text-sm font-semibold text-slate-900 dark:text-white">
						Lịch sử phiên bản
					</span>
				</div>
				<button
					onClick={onClose}
					className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
				>
					<X className="h-4 w-4" />
				</button>
			</div>

			{/* Version list */}
			<div className="flex-1 overflow-y-auto p-3">
				{isLoading ? (
					<div className="flex justify-center py-8">
						<Loader2 className="h-5 w-5 animate-spin text-slate-400" />
					</div>
				) : versions.length === 0 ? (
					<p className="py-8 text-center text-sm text-slate-400">
						Chưa có lịch sử phiên bản
					</p>
				) : (
					<ol className="relative border-l border-slate-200 pl-4 dark:border-slate-700">
						{versions.map((v) => {
							const isCurrent = v.version_number === currentVersion;
							const isPreviewing = v.version_number === previewVersionNumber;
							const isLoadingThis = loadingVersion === v.version_number;

							return (
								<li key={v.id} className="mb-4 last:mb-0">
									{/* Timeline dot */}
									<span
										className={`absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 ${
											isPreviewing
												? "border-amber-500 bg-amber-500"
												: isCurrent
													? "border-indigo-600 bg-indigo-600"
													: "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900"
										}`}
									/>

									<div
										className={`rounded-lg border p-3 ${
											isPreviewing
												? "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/40"
												: "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50"
										}`}
									>
										<div className="flex items-center gap-2">
											<span
												className={`text-xs font-semibold ${
													isPreviewing
														? "text-amber-700 dark:text-amber-400"
														: isCurrent
															? "text-indigo-600 dark:text-indigo-400"
															: "text-slate-700 dark:text-slate-300"
												}`}
											>
												v{v.version_number}
											</span>
											{isPreviewing && (
												<span className="flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900 dark:text-amber-300">
													<Eye className="h-2.5 w-2.5" />
													Đang xem
												</span>
											)}
											{isCurrent && !isPreviewing && (
												<span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
													Hiện tại
												</span>
											)}
										</div>

										<p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
											{v.change_description}
										</p>
										<p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
											{formatDate(v.created_at)}
										</p>

										{!isCurrent && (
											<div className="mt-2 flex gap-1.5">
												<Button
													variant="outline"
													onPress={() => handlePreview(v.version_number)}
													isDisabled={isLoadingThis || isRestoring}
													className={`flex h-7 flex-1 items-center justify-center gap-1 text-xs ${
														isPreviewing
															? "border-amber-400 text-amber-700 dark:border-amber-600 dark:text-amber-400"
															: ""
													}`}
												>
													{isLoadingThis ? (
														<Loader2 className="h-3 w-3 animate-spin" />
													) : (
														<Eye className="h-3 w-3" />
													)}
													{isPreviewing ? "Xem lại" : "Xem"}
												</Button>
												<Button
													onPress={() => handleRestore(v.version_number)}
													isDisabled={isLoadingThis || isRestoring}
													className="flex h-7 flex-1 items-center justify-center gap-1 text-xs"
												>
													{isRestoring ? (
														<Loader2 className="h-3 w-3 animate-spin" />
													) : (
														<RotateCcw className="h-3 w-3" />
													)}
													Khôi phục
												</Button>
											</div>
										)}
									</div>
								</li>
							);
						})}
					</ol>
				)}
			</div>
		</div>
	);
}
