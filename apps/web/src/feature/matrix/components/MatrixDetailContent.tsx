import { useState } from "react";
import { useParams, useNavigate, Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	Clock,
	Plus,
	Pencil,
	Trash2,
	Eye,
	Sparkles,
	MoreVertical,
	Fingerprint,
	BookOpen,
	Award,
} from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Card, CardContent } from "@workspace/ui/components/Card";
import { Skeleton } from "@workspace/ui/components/Skeleton";
import {
	useMatrixDetail,
	useMatrixVersions,
	useDeleteMatrix,
	useToggleMatrixActive,
} from "../queries/useMatrix";
import MatrixFormModal from "./MatrixFormModal";
import VersionFormModal from "./VersionFormModal";
import { useExamsByMatrix } from "@/feature/exam/queries/useExam";

const MatrixDetailContent: React.FC = () => {
	const { id } = useParams({ from: "/mentor/matrix/$id/" });
	const navigate = useNavigate();
	const matrixId = parseInt(id);

	const [editModal, setEditModal] = useState(false);
	const [versionModal, setVersionModal] = useState(false);
	const [activeTab, setActiveTab] = useState("versions");

	const { data: matrix, isLoading } = useMatrixDetail(matrixId);
	const { data: versions } = useMatrixVersions(matrixId);
	const { data: exams, isLoading: examsLoading } = useExamsByMatrix(matrixId);
	const { mutate: deleteMatrix, isPending: deleting } = useDeleteMatrix();

	const handleDelete = () => {
		deleteMatrix(matrixId, {
			onSuccess: () => navigate({ to: "/mentor/matrix/my" }),
		});
	};

	const getStatusBadge = (isPublished: boolean) => {
		if (isPublished) {
			return (
				<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50">
					<span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
					Đã xuất bản
				</span>
			);
		}
		return (
			<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
				<span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
				Nháp
			</span>
		);
	};
	if (isLoading) {
		return (
			<main className="flex-1 p-8 min-h-screen bg-white dark:bg-slate-950">
				<div className="mx-auto max-w-7xl">
					<Skeleton className="mb-4 h-8 w-32" />
					<Skeleton className="mb-8 h-48 w-full" />
					<Skeleton className="h-64 w-full" />
				</div>
			</main>
		);
	}

	if (!matrix) {
		return (
			<main className="flex-1 p-8 min-h-screen bg-white dark:bg-slate-950">
				<div className="mx-auto max-w-7xl">
					<Card>
						<CardContent className="flex flex-col items-center justify-center py-16">
							<p className="mb-4 text-muted-foreground">
								Không tìm thấy ma trận
							</p>
							<Button
								variant="outline"
								onClick={() => navigate({ to: "/mentor/matrix/my" })}
							>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Quay lại
							</Button>
						</CardContent>
					</Card>
				</div>
			</main>
		);
	}

	const sortedVersions = [...(versions || [])].sort(
		(a, b) => b.versionNo - a.versionNo,
	);
	const latestVersion = sortedVersions[0];

	return (
		<main className="flex-1 p-8 min-h-screen bg-white dark:bg-slate-950">
			<div className="mx-auto">
				<div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
					<div>
						<Button
							variant="outline"
							size="lg"
							className="mb-2 gap-2 border-gray-200 bg-white shadow-sm transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
							onClick={() => navigate({ to: "/mentor/matrix/my" })}
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Quay lại danh sách
						</Button>
						<h1 className="text-2xl font-bold text-slate-900 dark:text-white">
							{matrix.name}
						</h1>
					</div>
					<div className="flex items-center gap-3">
						<button
							onClick={() => setEditModal(true)}
							className="cursor-pointer flex items-center gap-2 rounded-lg border border-slate-400 bg-white px-4 py-3 text-sm font-medium transition-all hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
						>
							<Pencil className="h-4 w-4" />
							Chỉnh sửa ma trận
						</button>
						<button
							onClick={handleDelete}
							disabled={deleting}
							className="cursor-pointer flex items-center gap-2 rounded-lg border border-red-200 px-4 py-3 text-sm font-medium text-red-600 transition-all hover:bg-red-50 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-950/30"
						>
							<Trash2 className="h-4 w-4" />
							Xóa
						</button>
					</div>
				</div>

				<div className="mb-4 grid grid-cols-2 gap-6 rounded-md border-2 border-slate-400 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:grid-cols-4">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-800 dark:bg-blue-900/20">
							<Fingerprint className="h-5 w-5" />
						</div>
						<div>
							<p className="text-[10px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-500">
								Mã ma trận
							</p>
							<p className="text-sm font-semibold">{matrix.code}</p>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-900/20">
							<BookOpen className="h-5 w-5" />
						</div>
						<div>
							<p className="text-[10px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-500">
								Môn học
							</p>
							<p className="text-sm font-semibold">
								{matrix.subject?.name || "Chưa xác định"}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600 dark:bg-green-900/20">
							<Clock className="h-5 w-5" />
						</div>
						<div>
							<p className="text-[10px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-500">
								Thời gian
							</p>
							<p className="text-sm font-semibold">{matrix.duration} phút</p>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20">
							<Award className="h-5 w-5" />
						</div>
						<div>
							<p className="text-[10px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-500">
								Tổng điểm
							</p>
							<p className="text-sm font-semibold">{matrix.totalScore}</p>
						</div>
					</div>
				</div>

				<div className="mb-6 flex items-center justify-between border-b border-slate-300 dark:border-slate-800">
					<div className="flex gap-8">
						<button
							onClick={() => setActiveTab("versions")}
							className={`cursor-pointer not-even:pb-4 text-sm font-bold transition-colors ${
								activeTab === "versions"
									? "border-b-2 border-blue-800 text-blue-800"
									: "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
							}`}
						>
							Phiên bản ma trận
						</button>
						<button
							onClick={() => setActiveTab("exams")}
							className={`cursor-pointer pb-4 text-sm font-medium transition-colors ${
								activeTab === "exams"
									? "border-b-2 border-blue-800 text-blue-800"
									: "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
							}`}
						>
							Đề thi đã tạo ({exams?.page?.totalElements || 0})
						</button>
					</div>
					<button
						onClick={() => setVersionModal(true)}
						className="cursor-pointer mb-4 flex items-center gap-2 rounded-lg bg-blue-800 px-4 py-3 text-sm font-medium text-white shadow-sm shadow-blue-500/30 transition-all hover:bg-blue-700"
					>
						<Plus className="h-4 w-4" />
						Tạo phiên bản mới
					</button>
				</div>

				{activeTab === "versions" && (
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						{sortedVersions.map((version, index) => {
							const isLatest = index === 0;
							return (
								<div
									key={version.id}
									className={`group relative overflow-hidden rounded-xl bg-white p-6 dark:bg-slate-900 ${
										isLatest
											? "border-2 border-blue-800 shadow-md"
											: "border border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
									} transition-all`}
								>
									{isLatest && (
										<div className="absolute right-0 top-0">
											<div className="bg-blue-800 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white">
												Mới nhất
											</div>
										</div>
									)}
									<div className="mb-4 flex items-start justify-between">
										<div>
											<h3 className="text-lg font-bold text-slate-900 dark:text-white">
												Phiên bản {version.versionNo} -{" "}
												{version.name || "Không có tên"}
											</h3>
											<p className="mt-1 text-xs text-slate-500">
												Cập nhật lúc:{" "}
												{new Date(version.updatedAt).toLocaleString("vi-VN")}
											</p>
										</div>
										{!isLatest && (
											<button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
												<MoreVertical className="h-5 w-5" />
											</button>
										)}
									</div>
									<div className="mb-6 grid grid-cols-2 gap-4">
										<div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
											<p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
												Số câu hỏi
											</p>
											<p className="text-xl font-bold text-slate-900 dark:text-white">
												{version.matrixDetails?.reduce(
													(sum, d) =>
														sum +
														(d.easyMCQ || 0) +
														(d.mediumMCQ || 0) +
														(d.hardMCQ || 0) +
														(d.easyEssay || 0) +
														(d.mediumEssay || 0) +
														(d.hardEssay || 0),
													0,
												) || 0}
											</p>
										</div>
										<div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
											<p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
												Điểm tính toán
											</p>
											<p
												className={`text-xl font-bold ${isLatest ? "text-blue-800" : "text-slate-900 dark:text-white"}`}
											>
												{matrix.totalScore.toFixed(1) || "0.0"}
											</p>
										</div>
									</div>
									<div className="flex flex-col gap-3 sm:flex-row">
										<Button
											className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-5 text-sm font-bold transition-all ${
												isLatest
													? "bg-blue-50 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40"
													: "border border-slate-600 bg-white text-blue-700 hover:border-blue-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
											}`}
										>
											<Eye className="h-4 w-4" />
											Xem chi tiết
										</Button>
										<Button
											className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-5 text-sm font-bold transition-all ${
												isLatest
													? "bg-blue-50 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40"
													: "border border-slate-600 bg-white text-blue-700 hover:border-blue-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
											}`}
										>
											<Pencil className="h-4 w-4" />
											Chỉnh sửa
										</Button>
										<Button
											onClick={() =>
												navigate({
													to: "/mentor/matrix/$id/generate",
													params: { id: matrix.id.toString() },
													search: { versionId: version.id },
												})
											}
											className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-5 text-sm font-bold transition-all ${
												isLatest
													? "bg-blue-800 text-white shadow-sm shadow-blue-500/20 hover:bg-blue-700"
													: "border border-slate-600 bg-white text-blue-700 hover:border-blue-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
											}`}
										>
											<Sparkles className="h-4 w-4" />
											Tạo đề thi
										</Button>
									</div>
								</div>
							);
						})}

						<div
							onClick={() => setVersionModal(true)}
							className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-8 text-center transition-all hover:border-blue-800 hover:bg-blue-50/30 dark:border-slate-800 dark:hover:bg-blue-900/5"
						>
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 transition-colors group-hover:bg-blue-800 group-hover:text-white dark:bg-slate-800">
								<Plus className="h-6 w-6" />
							</div>
							<h4 className="font-bold text-slate-700 dark:text-slate-200">
								Tạo phiên bản mới
							</h4>
							<p className="mt-1 max-w-60 text-sm text-slate-500 dark:text-slate-400">
								Sao chép từ phiên bản hiện tại hoặc tạo mới từ đầu
							</p>
						</div>
					</div>
				)}

				{activeTab === "exams" && (
					<div className="overflow-hidden rounded-md border border-slate-400 bg-white dark:border-slate-800 dark:bg-slate-900">
						{examsLoading ? (
							<div className="p-8 text-center">
								<div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
								<p className="mt-4 text-sm text-slate-500">Đang tải...</p>
							</div>
						) : !exams || exams?.page?.totalElements === 0 ? (
							<div className="p-12 text-center">
								<p className="text-slate-600 dark:text-slate-400">
									Chưa có đề thi nào được tạo từ ma trận này
								</p>
							</div>
						) : (
							<table className="w-full">
								<thead className="border-b border-slate-400 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
											Thông tin đề thi
										</th>
										<th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
											Mã đề
										</th>
										<th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
											Thời gian
										</th>
										<th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
											Thang điểm
										</th>
										<th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
											Trạng thái
										</th>
										<th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
											Thao tác
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-200 dark:divide-slate-800">
									{exams.data?.map((exam) => {
										return (
											<tr
												key={exam.id}
												className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30"
												onClick={() =>
													navigate({ to: `/mentor/exam/${exam.id}` })
												}
											>
												<td className="px-6 py-4">
													<div className="flex items-center gap-4">
														<div>
															<p className="font-semibold text-slate-900 dark:text-slate-100">
																{exam.name}
															</p>
															<p className="text-xs text-slate-500">
																{new Date(exam.createdAt).toLocaleDateString(
																	"vi-VN",
																)}
															</p>
														</div>
													</div>
												</td>
												<td className="px-6 py-4">
													<span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
														{exam.code}
													</span>
												</td>
												<td className="px-6 py-4 text-slate-600 dark:text-slate-400">
													<div className="flex items-center gap-1.5 text-sm">
														<Clock className="h-4 w-4 opacity-70" />
														{exam.durationInMinutes} ph
													</div>
												</td>
												<td className="px-6 py-4 text-center font-medium text-slate-700 dark:text-slate-300">
													{exam.totalScore}
												</td>
												<td className="px-6 py-4">
													{getStatusBadge(exam.isPublished)}
												</td>

												<td className="px-6 py-4 text-right">
													<div className="flex items-center justify-end gap-2">
														<button
															onClick={(e) => {
																e.stopPropagation();
																navigate({ to: `/mentor/exam/${exam.id}` });
															}}
															className="cursor-pointer p-2 text-slate-800 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
															title="Xem"
														>
															<Eye className="h-5 w-5" />
														</button>
													</div>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						)}
					</div>
				)}
			</div>

			<MatrixFormModal
				isOpen={editModal}
				onClose={() => setEditModal(false)}
				data={matrix}
			/>
			<VersionFormModal
				isOpen={versionModal}
				onClose={() => setVersionModal(false)}
				matrixId={matrixId}
				totalScore={matrix.totalScore}
				subjectId={matrix.subject.id}
			/>
		</main>
	);
};

export default MatrixDetailContent;
