import { useState, useEffect, useMemo } from "react";
import { X, Save, Loader2, BookOpen, AlertCircle } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import {
	useMatrixVersionDetail,
	useUpdateMatrixDetail,
} from "../queries/useMatrix";

interface Props {
	isOpen: boolean;
	onClose: () => void;
	versionId: number | null;
	matrixTotalScore: number;
	defaultEditing?: boolean;
}

type DetailRow = {
	id: number;
	easyMCQ: number;
	mediumMCQ: number;
	hardMCQ: number;
	easyEssay: number;
	mediumEssay: number;
	hardEssay: number;
	easyMCQScore: number;
	mediumMCQScore: number;
	hardMCQScore: number;
	easyEssayScore: number;
	mediumEssayScore: number;
	hardEssayScore: number;
};

type EditableField = keyof Omit<DetailRow, "id">;
type DetailMap = Record<number, DetailRow>;

const COUNT_FIELDS: EditableField[] = [
	"easyMCQ",
	"mediumMCQ",
	"hardMCQ",
	"easyEssay",
	"mediumEssay",
	"hardEssay",
];

const PAIR_FIELDS: [EditableField, EditableField][] = [
	["easyMCQ", "easyMCQScore"],
	["mediumMCQ", "mediumMCQScore"],
	["hardMCQ", "hardMCQScore"],
	["easyEssay", "easyEssayScore"],
	["mediumEssay", "mediumEssayScore"],
	["hardEssay", "hardEssayScore"],
];

const calculateScore = (d: DetailRow): number =>
	d.easyMCQ * d.easyMCQScore +
	d.mediumMCQ * d.mediumMCQScore +
	d.hardMCQ * d.hardMCQScore +
	d.easyEssay * d.easyEssayScore +
	d.mediumEssay * d.mediumEssayScore +
	d.hardEssay * d.hardEssayScore;

const VersionDetailModal: React.FC<Props> = ({
	isOpen,
	onClose,
	versionId,
	matrixTotalScore,
	defaultEditing = false,
}) => {
	const [editMap, setEditMap] = useState<DetailMap>({});
	const [dirtyIds, setDirtyIds] = useState<Set<number>>(new Set());

	const { data: version, isLoading } = useMatrixVersionDetail(
		versionId ?? undefined,
	);
	const { mutate: updateDetail, isPending: saving } = useUpdateMatrixDetail();

	useEffect(() => {
		if (!version?.matrixDetails) return;
		const map: DetailMap = {};
		for (const d of version.matrixDetails) {
			map[d.id] = {
				id: d.id,
				easyMCQ: d.easyMCQ,
				mediumMCQ: d.mediumMCQ,
				hardMCQ: d.hardMCQ,
				easyEssay: d.easyEssay,
				mediumEssay: d.mediumEssay,
				hardEssay: d.hardEssay,
				easyMCQScore: Number(d.easyMCQScore),
				mediumMCQScore: Number(d.mediumMCQScore),
				hardMCQScore: Number(d.hardMCQScore),
				easyEssayScore: Number(d.easyEssayScore),
				mediumEssayScore: Number(d.mediumEssayScore),
				hardEssayScore: Number(d.hardEssayScore),
			};
		}
		setEditMap(map);
		setDirtyIds(
			defaultEditing ? new Set(Object.keys(map).map(Number)) : new Set(),
		);
	}, [version, defaultEditing]);

	useEffect(() => {
		if (!isOpen) setDirtyIds(new Set());
	}, [isOpen]);

	const totalDetails: any[] = useMemo(
		() => version?.matrixDetails ?? [],
		[version],
	);

	const totalScore = useMemo(
		() => Object.values(editMap).reduce((s, d) => s + calculateScore(d), 0),
		[editMap],
	);

	const totalQuestions = useMemo(
		() =>
			Object.values(editMap).reduce(
				(s, d) =>
					s +
					d.easyMCQ +
					d.mediumMCQ +
					d.hardMCQ +
					d.easyEssay +
					d.mediumEssay +
					d.hardEssay,
				0,
			),
		[editMap],
	);

	const isScoreMismatch =
		dirtyIds.size > 0 && Math.abs(totalScore - matrixTotalScore) > 0.001;
	const scoreDiff = totalScore - matrixTotalScore;
	const hasDirty = dirtyIds.size > 0;

	if (!isOpen || !versionId) return null;

	const updateField = (id: number, field: EditableField, raw: string) => {
		const isCount = COUNT_FIELDS.includes(field);
		const value = isCount ? parseInt(raw) || 0 : parseFloat(raw) || 0;
		setEditMap((prev) => ({ ...prev, [id]: { ...prev[id]!, [field]: value } }));
		setDirtyIds((prev) => new Set(prev).add(id));
	};

	const saveAll = () => {
		if (isScoreMismatch || !hasDirty) return;
		const dirtyList = [...dirtyIds];
		let remaining = dirtyList.length;
		for (const id of dirtyList) {
			const d = editMap[id];
			if (!d) continue;
			const lessonId: number =
				totalDetails.find((x) => x.id === id)?.lesson?.id ?? 0;
			updateDetail(
				{
					id,
					data: {
						lessonId,
						easyMCQ: d.easyMCQ,
						mediumMCQ: d.mediumMCQ,
						hardMCQ: d.hardMCQ,
						easyEssay: d.easyEssay,
						mediumEssay: d.mediumEssay,
						hardEssay: d.hardEssay,
						easyMCQScore: d.easyMCQScore,
						mediumMCQScore: d.mediumMCQScore,
						hardMCQScore: d.hardMCQScore,
						easyEssayScore: d.easyEssayScore,
						mediumEssayScore: d.mediumEssayScore,
						hardEssayScore: d.hardEssayScore,
					},
				},
				{
					onSuccess: () => {
						if (--remaining === 0) setDirtyIds(new Set());
						onClose();
					},
				},
			);
		}
	};

	const NumInput = ({ id, field }: { id: number; field: EditableField }) => {
		const isCount = COUNT_FIELDS.includes(field);
		return (
			<input
				type="number"
				min={0}
				step={isCount ? 1 : 0.01}
				value={editMap[id]?.[field] ?? 0}
				onChange={(e) => updateField(id, field, e.target.value)}
				className={`w-14 px-1 py-1 text-center text-xs border rounded outline-none focus:ring-1 focus:ring-blue-500 ${
					isCount
						? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
						: "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
				}`}
			/>
		);
	};

	return (
		<div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4">
			<div className="w-full max-w-360 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl my-8 flex flex-col max-h-[calc(100vh-4rem)]">
				<div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
					<div>
						<div className="flex items-center gap-2">
							<BookOpen className="h-5 w-5 text-blue-700" />
							<h2 className="text-xl font-bold text-slate-900 dark:text-white">
								{isLoading
									? "Đang tải..."
									: `Phiên bản ${version?.versionNo} — ${version?.name ?? "Không có tên"}`}
							</h2>
						</div>
						{version?.notes && (
							<p className="text-sm text-slate-500 mt-1 ml-7">
								{version.notes}
							</p>
						)}
					</div>
					<button
						onClick={onClose}
						className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{!isLoading && version && (
					<div className="grid grid-cols-3 gap-px bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 shrink-0">
						{[
							{ label: "Số bài học", value: totalDetails.length, unit: "bài" },
							{ label: "Tổng số câu", value: totalQuestions, unit: "câu" },
							{
								label: "Tổng điểm",
								value: totalScore.toFixed(2),
								unit: `/ ${matrixTotalScore}`,
							},
						].map(({ label, value, unit }) => (
							<div
								key={label}
								className="bg-white dark:bg-slate-900 px-6 py-3 flex items-center gap-3"
							>
								<div>
									<p className="text-sm font-bold uppercase tracking-wider text-slate-500">
										{label}
									</p>
									<p className="text-lg font-bold text-slate-900 dark:text-white">
										{value}{" "}
										<span className="text-sm font-normal text-slate-500">
											{unit}
										</span>
									</p>
								</div>
							</div>
						))}
					</div>
				)}

				<div className="overflow-y-auto flex-1 p-6">
					{isLoading ? (
						<div className="flex items-center justify-center py-16">
							<Loader2 className="h-8 w-8 animate-spin text-blue-500" />
						</div>
					) : !totalDetails.length ? (
						<div className="text-center py-16 text-slate-500">
							Phiên bản này chưa có chi tiết nào
						</div>
					) : (
						<>
							{isScoreMismatch && (
								<div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3">
									<AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
									<p className="text-sm text-red-700 dark:text-red-300 font-medium">
										Tổng điểm hiện tại là{" "}
										<span className="font-bold">{totalScore.toFixed(2)}</span> —{" "}
										{scoreDiff > 0
											? `vượt quá ${matrixTotalScore} điểm (+${scoreDiff.toFixed(2)})`
											: `chưa đủ ${matrixTotalScore} điểm (${scoreDiff.toFixed(2)})`}
										. Vui lòng điều chỉnh để tổng điểm bằng đúng{" "}
										<span className="font-bold">{matrixTotalScore}</span>.
									</p>
								</div>
							)}

							<div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
								<table className="w-full text-sm">
									<thead>
										<tr className="bg-slate-50 dark:bg-slate-800">
											<th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider text-slate-500 w-60">
												Bài học
											</th>
											<th
												colSpan={3}
												className="px-2 py-3 text-center text-sm font-bold text-blue-600 dark:text-blue-400"
											>
												MCQ — Trắc nghiệm
											</th>
											<th
												colSpan={3}
												className="px-2 py-3 text-center text-sm font-bold text-orange-600 dark:text-orange-400"
											>
												Essay — Tự luận
											</th>
											<th className="px-2 py-3 text-center text-sm font-bold text-slate-600 dark:text-slate-400">
												Điểm
											</th>
										</tr>
										<tr className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
											<th />
											{["Dễ", "TB", "Khó", "Dễ", "TB", "Khó"].map((l, i) => (
												<th
													key={i}
													className="px-2 py-2 text-center text-xs font-medium text-slate-500"
												>
													{l}
												</th>
											))}
											<th />
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-100 dark:divide-slate-800">
										{totalDetails.map((detail) => {
											const d = editMap[detail.id as number];
											if (!d) return null;
											const rowScore = calculateScore(d);
											const isDirty = dirtyIds.has(detail.id as number);

											return (
												<tr
													key={detail.id as number}
													className={`transition-colors ${isDirty ? "bg-yellow-50/40 dark:bg-yellow-900/10" : "hover:bg-slate-50 dark:hover:bg-slate-800/30"}`}
												>
													<td className="px-4 py-3">
														<div className="flex items-center gap-2">
															{isDirty && (
																<span
																	className="w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0"
																	title="Chưa lưu"
																/>
															)}
															<div>
																<p className="font-medium text-slate-800 dark:text-slate-200 text-sm">
																	{detail.lesson?.name as string}
																</p>
																<p className="text-xs text-slate-400">
																	{detail.chapter?.name as string}
																</p>
															</div>
														</div>
													</td>
													{PAIR_FIELDS.map(([countField, scoreField]) => (
														<td
															key={countField}
															className="px-2 py-3 text-center"
														>
															<div className="flex flex-col items-center gap-1">
																<NumInput
																	id={detail.id as number}
																	field={countField}
																/>
																<div className="flex items-center gap-1">
																	<span className="text-[10px] text-slate-400">
																		×
																	</span>
																	<NumInput
																		id={detail.id as number}
																		field={scoreField}
																	/>
																</div>
															</div>
														</td>
													))}
													<td className="px-2 py-3 text-center">
														<span
															className={`text-base font-bold ${isScoreMismatch && isDirty ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-white"}`}
														>
															{rowScore.toFixed(2)}
														</span>
													</td>
												</tr>
											);
										})}
									</tbody>
									<tfoot>
										<tr className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
											<td className="px-4 py-3 text-md font-bold text-slate-700 dark:text-slate-300">
												Tổng
											</td>
											{COUNT_FIELDS.map((f) => (
												<td key={f} className="px-2 py-3 text-center">
													<span className="text-sm font-bold text-slate-700 dark:text-slate-300">
														{Object.values(editMap).reduce(
															(s, d) => s + (d[f] as number),
															0,
														)}
													</span>
												</td>
											))}
											<td className="px-2 py-3 text-center">
												<span
													className={`text-base font-bold ${
														isScoreMismatch
															? "text-red-600 dark:text-red-400"
															: Math.abs(totalScore - matrixTotalScore) < 0.01
																? "text-green-600 dark:text-green-400"
																: "text-slate-700 dark:text-slate-300"
													}`}
												>
													{totalScore.toFixed(2)}
												</span>
											</td>
										</tr>
									</tfoot>
								</table>
							</div>
						</>
					)}
				</div>

				<div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
					<p className="text-sm text-slate-400">
						{hasDirty
							? `${dirtyIds.size} bài học có thay đổi chưa lưu`
							: "Chưa có thay đổi"}
					</p>
					<div className="flex gap-3">
						<Button
							onClick={onClose}
							className="px-6 py-5 text-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 rounded-lg font-medium transition-all"
						>
							Đóng
						</Button>
						<button
							type="button"
							onClick={saveAll}
							disabled={!hasDirty || isScoreMismatch || saving}
							title={
								isScoreMismatch
									? `Tổng điểm phải bằng ${matrixTotalScore}`
									: undefined
							}
							className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
						>
							{saving ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Save className="h-4 w-4" />
							)}
							Lưu tất cả
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default VersionDetailModal;
