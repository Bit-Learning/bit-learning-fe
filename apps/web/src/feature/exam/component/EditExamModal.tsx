import { useState } from "react";
import { X, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import type {
	ExamBriefResponse,
	ExamType,
	ExamUpdateRequest,
} from "../types/exam.type";
import { useUpdateExam } from "../queries/useExam";
import { useSubjectsList } from "@/feature/matrix/queries/useSubject";

interface EditExamModalProps {
	exam: ExamBriefResponse;
	onClose: () => void;
}

export const EditExamModal: React.FC<EditExamModalProps> = ({
	exam,
	onClose,
}) => {
	const { mutate: updateExam, isPending } = useUpdateExam();
	const { data: subjectsData } = useSubjectsList();
	const [name, setName] = useState(exam.name);
	const [code, setCode] = useState(exam.code);
	const [type, setType] = useState<ExamType>(exam.type ?? "EXAM");
	const [durationInMinutes, setDurationInMinutes] = useState(
		exam.durationInMinutes,
	);
	const [totalScore, setTotalScore] = useState(exam.totalScore);
	const [enrollKey, setEnrollKey] = useState(exam.enrollKey ?? "");
	const [subjectId, setSubjectId] = useState<number | undefined>(
		exam.subject?.id,
	);

	const handleSubmit = () => {
		if (!name.trim() || !code.trim() || !subjectId) return;
		const data: ExamUpdateRequest = {
			name: name.trim(),
			code: code.trim(),
			type,
			durationInMinutes,
			totalScore,
			subjectId,
			enrollKey: enrollKey.trim() || undefined,
		};
		updateExam({ id: exam.id, data }, { onSuccess: onClose });
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
			/>
			<div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700">
				<div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
					<h2 className="text-lg font-bold text-slate-900 dark:text-white">
						Chỉnh sửa đề thi
					</h2>
					<button
						onClick={onClose}
						className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
					>
						<X className="h-5 w-5 text-slate-500" />
					</button>
				</div>
				<div className="px-6 py-5 space-y-4">
					<div>
						<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
							Tên đề thi <span className="text-red-500">*</span>
						</label>
						<input
							className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Tên đề thi"
						/>
					</div>
					<div>
						<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
							Môn học <span className="text-red-500">*</span>
						</label>
						<div className="relative">
							<select
								value={subjectId ?? ""}
								onChange={(e) =>
									setSubjectId(
										e.target.value ? Number(e.target.value) : undefined,
									)
								}
								className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
							>
								<option value="">-- Chọn môn học --</option>
								{subjectsData?.map((s) => (
									<option key={s.id} value={s.id}>
										{s.name}
									</option>
								))}
							</select>
							<ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
						</div>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
								Mã đề <span className="text-red-500">*</span>
							</label>
							<input
								className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white text-sm uppercase outline-none focus:ring-2 focus:ring-blue-500 transition-all"
								value={code}
								onChange={(e) => setCode(e.target.value.toUpperCase())}
								placeholder="Mã đề"
							/>
						</div>
						<div>
							<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
								Loại
							</label>
							<div className="relative">
								<select
									value={type}
									onChange={(e) => setType(e.target.value as ExamType)}
									className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
								>
									<option value="EXAM">Chính thức</option>
									<option value="PRACTICE">Luyện tập</option>
								</select>
								<ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
							</div>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
								Thời gian (phút)
							</label>
							<input
								type="number"
								min={1}
								className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
								value={durationInMinutes}
								onChange={(e) => setDurationInMinutes(Number(e.target.value))}
							/>
						</div>
						<div>
							<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
								Tổng điểm
							</label>
							<input
								type="number"
								min={0}
								step={0.5}
								className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
								value={totalScore}
								onChange={(e) => setTotalScore(Number(e.target.value))}
							/>
						</div>
					</div>
					<div>
						<label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
							Mật khẩu vào thi
							{type === "EXAM" ? (
								<span className="text-red-500 ml-1">*</span>
							) : (
								<span className="text-slate-400 text-sm font-normal ml-1">
									(tuỳ chọn)
								</span>
							)}
						</label>
						<input
							className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
							value={enrollKey}
							onChange={(e) => setEnrollKey(e.target.value)}
							placeholder={
								type === "EXAM"
									? "Bắt buộc với đề chính thức"
									: "Để trống nếu không cần mật khẩu"
							}
						/>
					</div>
				</div>
				<div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
					<button
						onClick={onClose}
						disabled={isPending}
						className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-50"
					>
						Hủy
					</button>
					<Button
						onClick={handleSubmit}
						isDisabled={
							isPending ||
							!name.trim() ||
							!code.trim() ||
							!subjectId ||
							(type === "EXAM" && !enrollKey.trim())
						}
						className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
					>
						{isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
						Lưu thay đổi
					</Button>
				</div>
			</div>
		</div>
	);
};
