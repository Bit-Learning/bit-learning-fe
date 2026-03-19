import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, X, Plus, BarChart3, CheckCircle, Star } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { useCreateVersion } from "../queries/useMatrix";
import type { TMatrixDetailRequest } from "../types/matrix.type";
import ChapterGroup, { TChapterGroup } from "./ChapterGroup";

const formSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên phiên bản"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  matrixId: number;
  totalScore: number;
  subjectId: number;
}

const emptyDetail: TMatrixDetailRequest = {
  lessonId: 0,
  easyMCQ: 0,
  mediumMCQ: 0,
  hardMCQ: 0,
  easyEssay: 0,
  mediumEssay: 0,
  hardEssay: 0,
  easyMCQScore: 0.2,
  mediumMCQScore: 0.2,
  hardMCQScore: 0.2,
  easyEssayScore: 1.0,
  mediumEssayScore: 1.0,
  hardEssayScore: 1.0,
};

const calculateRowScore = (row: TMatrixDetailRequest): number =>
  row.easyMCQ * row.easyMCQScore +
  row.mediumMCQ * row.mediumMCQScore +
  row.hardMCQ * row.hardMCQScore +
  row.easyEssay * row.easyEssayScore +
  row.mediumEssay * row.mediumEssayScore +
  row.hardEssay * row.hardEssayScore;

const VersionFormModal: React.FC<Props> = ({ isOpen, onClose, matrixId, totalScore, subjectId }) => {
  const [groups, setGroups] = useState<TChapterGroup[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", notes: "" },
  });

  const { mutate: createVersion, isPending } = useCreateVersion();

  useEffect(() => {
    if (isOpen) {
      form.reset({ name: "", notes: "" });
      setGroups([]);
    }
  }, [isOpen]);

  const addGroup = () => setGroups((prev) => [...prev, { chapterId: 0, details: [{ ...emptyDetail }] }]);

  const removeGroup = (gIdx: number) => setGroups((prev) => prev.filter((_, i) => i !== gIdx));

  const addDetailToGroup = (gIdx: number) =>
    setGroups((prev) => {
      const updated = [...prev];
      const group = updated[gIdx];
      if (!group) return prev;
      updated[gIdx] = { ...group, details: [...group.details, { ...emptyDetail }] };
      return updated;
    });

  const removeDetailFromGroup = (gIdx: number, dIdx: number) =>
    setGroups((prev) => {
      const updated = [...prev];
      const group = updated[gIdx];
      if (!group) return prev;
      updated[gIdx] = { ...group, details: group.details.filter((_, i) => i !== dIdx) };
      return updated;
    });

  const updateDetail = (gIdx: number, dIdx: number, field: keyof TMatrixDetailRequest, value: number) =>
    setGroups((prev) => {
      const updated = [...prev];
      const group = updated[gIdx];
      if (!group) return prev;
      const details = [...group.details];
      const detail = details[dIdx];
      if (!detail) return prev;
      details[dIdx] = { ...detail, [field]: value } as TMatrixDetailRequest;
      updated[gIdx] = { ...group, details };
      return updated;
    });

  const updateGroupChapter = (gIdx: number, chapterId: number) =>
    setGroups((prev) => {
      const updated = [...prev];
      if (!updated[gIdx]) return prev;
      updated[gIdx] = { chapterId, details: [{ ...emptyDetail }] };
      return updated;
    });

  const allDetails = groups.flatMap((g) => g.details.filter((d) => d.lessonId > 0));
  const totalMCQ = allDetails.reduce((s, r) => s + r.easyMCQ + r.mediumMCQ + r.hardMCQ, 0);
  const totalEssay = allDetails.reduce((s, r) => s + r.easyEssay + r.mediumEssay + r.hardEssay, 0);
  const totalQuestions = totalMCQ + totalEssay;
  const calculatedScore = allDetails.reduce((s, r) => s + calculateRowScore(r), 0);
  const isScoreMatch = Math.abs(calculatedScore - totalScore) < 0.01;

  const onSubmit = (values: FormValues) => {
    createVersion(
      { matrixId, name: values.name, notes: values.notes, matrixDetails: allDetails },
      { onSuccess: onClose },
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4">
      <div className="w-full max-w-7xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl my-8 flex flex-col max-h-[calc(100vh-4rem)]">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tạo phiên bản ma trận mới</h2>
          </div>
          <Button onClick={onClose} className="text-white dark:hover:text-slate-200 transition-colors">
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tên phiên bản
                </label>
                <input
                  {...form.register("name")}
                  placeholder="Phiên bản kiểm tra cuối kỳ"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-red-500 mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Ghi chú thêm
                </label>
                <input
                  {...form.register("notes")}
                  placeholder="Nhập ghi chú cho phiên bản này..."
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Cấu hình chi tiết ma trận</h3>

              {groups.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                  <p className="text-slate-500 dark:text-slate-400 mb-4">Chưa có chương nào được thêm</p>
                  <Button
                    type="button"
                    onClick={addGroup}
                    className="cursor-pointer px-5 py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-md font-medium flex items-center gap-2 mx-auto transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    Thêm chương
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {groups.map((group, gIdx) => (
                    <ChapterGroup
                      key={gIdx}
                      group={group}
                      gIdx={gIdx}
                      subjectId={subjectId}
                      onUpdateChapter={updateGroupChapter}
                      onAddDetail={addDetailToGroup}
                      onRemoveDetail={removeDetailFromGroup}
                      onUpdateDetail={updateDetail}
                      onRemoveGroup={removeGroup}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={addGroup}
                    className="cursor-pointer w-full py-2.5 border-2 border-dashed border-slate-400 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 rounded-md text-md font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Thêm chương
                  </button>
                </div>
              )}
            </div>

            {groups.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                <div className="grid grid-cols-3 gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Tổng số câu</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {totalQuestions} <span className="text-sm text-slate-500">câu hỏi</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <Star className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Tổng điểm</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {calculatedScore.toFixed(2)} <span className="text-sm text-slate-500">/ {totalScore}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${isScoreMatch ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}
                    >
                      <CheckCircle
                        className={`h-6 w-6 ${isScoreMatch ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Trạng thái</p>
                      <p
                        className={`text-sm font-bold ${isScoreMatch ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}
                      >
                        {isScoreMatch ? "✓ Cấu hình hợp lệ" : "✗ Chưa đủ điểm"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                onClick={onClose}
                className="px-6 py-5 border border-slate-200 dark:border-slate-700 hover:bg-slate-800 dark:hover:bg-slate-800 rounded-lg text-sm font-medium transition-all"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                isDisabled={isPending || !isScoreMatch}
                className="px-6 py-5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/30"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Tạo phiên bản →
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VersionFormModal;
