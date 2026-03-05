import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, X, Plus, Trash2, BarChart3, DollarSign, CheckCircle } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Input } from "@workspace/ui/components/Input";
import { useCreateVersion } from "../queries/useMatrix";
import type { TMatrixDetailRequest } from "../types/matrix.type";
import { useLessons } from "../queries/useLesson";
import { TLessonBriefResponse } from "../types/lesson.type";

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

const VersionFormModal: React.FC<Props> = ({ isOpen, onClose, matrixId, totalScore }) => {
  const [matrixDetails, setMatrixDetails] = useState<TMatrixDetailRequest[]>([]);
  const { data: lessons } = useLessons();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", notes: "" },
  });

  const { mutate: createVersion, isPending } = useCreateVersion();

  useEffect(() => {
    if (isOpen) {
      form.reset({ name: "", notes: "" });
      setMatrixDetails([]);
    }
  }, [isOpen, form]);

  const updateDetail = (index: number, field: keyof TMatrixDetailRequest, value: number) => {
    const updated = [...matrixDetails];
    updated[index] = { ...updated[index], [field]: value } as TMatrixDetailRequest;
    setMatrixDetails(updated);
  };

  const addLesson = () => {
    setMatrixDetails([...matrixDetails, { ...emptyDetail }]);
  };

  const removeLesson = (index: number) => {
    setMatrixDetails(matrixDetails.filter((_, i) => i !== index));
  };

  const calculateRowScore = (row: TMatrixDetailRequest) => {
    return (
      row.easyMCQ * row.easyMCQScore +
      row.mediumMCQ * row.mediumMCQScore +
      row.hardMCQ * row.hardMCQScore +
      row.easyEssay * row.easyEssayScore +
      row.mediumEssay * row.mediumEssayScore +
      row.hardEssay * row.hardEssayScore
    );
  };

  const totalQuestions = matrixDetails.reduce(
    (sum, row) => sum + row.easyMCQ + row.mediumMCQ + row.hardMCQ + row.easyEssay + row.mediumEssay + row.hardEssay,
    0,
  );

  const totalMCQ = matrixDetails.reduce((sum, row) => sum + row.easyMCQ + row.mediumMCQ + row.hardMCQ, 0);

  const totalEssay = matrixDetails.reduce((sum, row) => sum + row.easyEssay + row.mediumEssay + row.hardEssay, 0);

  const calculatedScore = matrixDetails.reduce((sum, row) => sum + calculateRowScore(row), 0);

  const isScoreMatch = Math.abs(calculatedScore - totalScore) < 0.01;

  const onSubmit = (values: FormValues) => {
    createVersion(
      {
        matrixId,
        name: values.name,
        notes: values.notes,
        matrixDetails: matrixDetails.filter((d) => d.lessonId),
      },
      { onSuccess: onClose },
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl my-8">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tạo phiên bản ma trận mới</h2>
          </div>
          <Button onClick={onClose} className="text-white  dark:hover:text-slate-200 transition-colors">
            <X className="h-6 w-6" />
          </Button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tên phiên bản</label>
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
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ghi chú thêm</label>
              <input
                {...form.register("notes")}
                placeholder="Nhập ghi chú cho phiên bản này..."
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>

          {/* Matrix Configuration */}
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
              Cấu hình chi tiết ma trận (Tin học 12)
            </h3>

            {matrixDetails.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-slate-500 dark:text-slate-400 mb-4">Chưa có chương/bài học nào được thêm</p>
                <Button
                  type="button"
                  onClick={addLesson}
                  className="cursor-pointer px-4 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 mx-auto transition-all"
                >
                  <Plus className="h-4 w-4" />
                  Thêm chương/bài học
                </Button>
              </div>
            ) : (
              <>
                {/* Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Chương / Bài học
                        </th>
                        <th className="px-2 py-3 text-center" colSpan={3}>
                          <div className="text-sm font-bold text-blue-600 dark:text-blue-400">MCQ (Số câu x Điểm)</div>
                        </th>
                        <th className="px-2 py-3 text-center" colSpan={3}>
                          <div className="text-sm font-bold text-orange-600 dark:text-orange-400">
                            Essay (Số câu x Điểm)
                          </div>
                        </th>
                        <th className="w-12"></th>
                      </tr>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                        <th></th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-slate-600 dark:text-slate-400">
                          Dễ
                        </th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-slate-600 dark:text-slate-400">
                          TB
                        </th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-slate-600 dark:text-slate-400">
                          Khó
                        </th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-slate-600 dark:text-slate-400">
                          Dễ
                        </th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-slate-600 dark:text-slate-400">
                          TB
                        </th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-slate-600 dark:text-slate-400">
                          Khó
                        </th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {matrixDetails.map((detail, index) => (
                        <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                          <td className="px-4 py-3">
                            <select
                              value={detail.lessonId}
                              onChange={(e) => updateDetail(index, "lessonId", Number(e.target.value))}
                              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                              <option value={0}>-- Chọn chương/bài học --</option>
                              {lessons?.map((lesson: TLessonBriefResponse) => (
                                <option key={lesson.id} value={lesson.id}>
                                  {lesson.name}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* MCQ Inputs */}
                          <td className="px-2 py-3">
                            <div className="flex flex-col items-center gap-1">
                              <input
                                type="number"
                                min={0}
                                value={detail.easyMCQ}
                                onChange={(e) => updateDetail(index, "easyMCQ", Number(e.target.value) || 0)}
                                className="w-20 px-2 py-1.5 text-center bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                              <span className="text-[10px] text-slate-400">x {detail.easyMCQScore}</span>
                            </div>
                          </td>
                          <td className="px-2 py-3">
                            <div className="flex flex-col items-center gap-1">
                              <input
                                type="number"
                                min={0}
                                value={detail.mediumMCQ}
                                onChange={(e) => updateDetail(index, "mediumMCQ", Number(e.target.value) || 0)}
                                className="w-20 px-2 py-1.5 text-center bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                              <span className="text-[10px] text-slate-400">x {detail.mediumMCQScore}</span>
                            </div>
                          </td>
                          <td className="px-2 py-3">
                            <div className="flex flex-col items-center gap-1">
                              <input
                                type="number"
                                min={0}
                                value={detail.hardMCQ}
                                onChange={(e) => updateDetail(index, "hardMCQ", Number(e.target.value) || 0)}
                                className="w-20 px-2 py-1.5 text-center bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                              <span className="text-[10px] text-slate-400">x {detail.hardMCQScore}</span>
                            </div>
                          </td>

                          {/* Essay Inputs */}
                          <td className="px-2 py-3">
                            <div className="flex flex-col items-center gap-1">
                              <input
                                type="number"
                                min={0}
                                value={detail.easyEssay}
                                onChange={(e) => updateDetail(index, "easyEssay", Number(e.target.value) || 0)}
                                className="w-20 px-2 py-1.5 text-center bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                              />
                              <span className="text-[10px] text-slate-400">x {detail.easyEssayScore}</span>
                            </div>
                          </td>
                          <td className="px-2 py-3">
                            <div className="flex flex-col items-center gap-1">
                              <input
                                type="number"
                                min={0}
                                value={detail.mediumEssay}
                                onChange={(e) => updateDetail(index, "mediumEssay", Number(e.target.value) || 0)}
                                className="w-20 px-2 py-1.5 text-center bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                              />
                              <span className="text-[10px] text-slate-400">x {detail.mediumEssayScore}</span>
                            </div>
                          </td>
                          <td className="px-2 py-3">
                            <div className="flex flex-col items-center gap-1">
                              <input
                                type="number"
                                min={0}
                                value={detail.hardEssay}
                                onChange={(e) => updateDetail(index, "hardEssay", Number(e.target.value) || 0)}
                                className="w-20 px-2 py-1.5 text-center bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                              />
                              <span className="text-[10px] text-slate-400">x {detail.hardEssayScore}</span>
                            </div>
                          </td>

                          <td className="px-2 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeLesson(index)}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors p-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 dark:bg-slate-800/50 border-t-2 border-slate-300 dark:border-slate-600">
                      <tr>
                        <td className="px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                          Tổng hợp nội dung
                        </td>
                        <td colSpan={3} className="px-2 py-3 text-center">
                          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {totalMCQ} Câu Trắc Nghiệm (MCQ)
                          </div>
                        </td>
                        <td colSpan={3} className="px-2 py-3 text-center">
                          <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                            {totalEssay} Bài Tự Luận (Essay)
                          </div>
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <button
                  type="button"
                  onClick={addLesson}
                  className="mt-4 w-full py-2.5 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Thêm chương/bài học
                </button>
              </>
            )}
          </div>

          {/* Summary */}
          {matrixDetails.length > 0 && (
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
                    <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Tổng điểm</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {calculatedScore.toFixed(1)} <span className="text-sm text-slate-500">/ {totalScore}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      isScoreMatch ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"
                    }`}
                  >
                    <CheckCircle
                      className={`h-6 w-6 ${
                        isScoreMatch ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Trạng thái</p>
                    <p
                      className={`text-sm font-bold ${
                        isScoreMatch ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
                      }`}
                    >
                      {isScoreMatch ? "✓ Cấu hình hợp lệ" : "✗ Chưa đủ điểm"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
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
  );
};

export default VersionFormModal;
