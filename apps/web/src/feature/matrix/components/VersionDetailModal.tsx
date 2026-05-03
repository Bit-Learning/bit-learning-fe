import { useState, useEffect } from "react";
import { X, Pencil, Save, Loader2, BookOpen, AlertCircle } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { useMatrixVersionDetail, useUpdateMatrixDetail } from "../queries/useMatrix";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  versionId: number | null;
  matrixTotalScore: number;
}

type EditingDetail = {
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

const calculateScore = (d: EditingDetail | any): number =>
  d.easyMCQ * d.easyMCQScore +
  d.mediumMCQ * d.mediumMCQScore +
  d.hardMCQ * d.hardMCQScore +
  d.easyEssay * d.easyEssayScore +
  d.mediumEssay * d.mediumEssayScore +
  d.hardEssay * d.hardEssayScore;

const VersionDetailModal: React.FC<Props> = ({ isOpen, onClose, versionId, matrixTotalScore }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<EditingDetail | null>(null);

  const { data: version, isLoading } = useMatrixVersionDetail(versionId ?? undefined);
  const { mutate: updateDetail, isPending: saving } = useUpdateMatrixDetail();

  useEffect(() => {
    if (!isOpen) {
      setEditingId(null);
      setEditData(null);
    }
  }, [isOpen]);

  if (!isOpen || !versionId) return null;

  const startEdit = (detail: any) => {
    setEditingId(detail.id);
    setEditData({
      id: detail.id,
      easyMCQ: detail.easyMCQ,
      mediumMCQ: detail.mediumMCQ,
      hardMCQ: detail.hardMCQ,
      easyEssay: detail.easyEssay,
      mediumEssay: detail.mediumEssay,
      hardEssay: detail.hardEssay,
      easyMCQScore: parseFloat(detail.easyMCQScore),
      mediumMCQScore: parseFloat(detail.mediumMCQScore),
      hardMCQScore: parseFloat(detail.hardMCQScore),
      easyEssayScore: parseFloat(detail.easyEssayScore),
      mediumEssayScore: parseFloat(detail.mediumEssayScore),
      hardEssayScore: parseFloat(detail.hardEssayScore),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData(null);
  };

  const saveEdit = () => {
    if (!editData || isScoreMismatch) return;
    updateDetail(
      {
        id: editData.id,
        data: {
          lessonId: version?.matrixDetails?.find((d: any) => d.id === editData.id)?.lesson?.id ?? 0,
          ...editData,
        },
      },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditData(null);
        },
      },
    );
  };

  const totalDetails = version?.matrixDetails || [];
  const totalQuestions = totalDetails.reduce(
    (s: number, d: any) => s + d.easyMCQ + d.mediumMCQ + d.hardMCQ + d.easyEssay + d.mediumEssay + d.hardEssay,
    0,
  );

  const totalScore = totalDetails.reduce((s: number, d: any) => {
    const isEditing = editingId === d.id && editData;
    return s + calculateScore(isEditing ? editData : d);
  }, 0);

  const isScoreMismatch = editingId !== null && Math.abs(totalScore - matrixTotalScore) > 0.001;
  const scoreDiff = totalScore - matrixTotalScore;

  const updateField = (field: keyof EditingDetail, value: number) => {
    if (!editData) return;
    setEditData({ ...editData, [field]: value });
  };

  const NumInput = ({ field, isCount }: { field: keyof EditingDetail; isCount?: boolean }) => (
    <input
      type="number"
      min={0}
      step={isCount ? 1 : 0.01}
      value={editData?.[field] ?? 0}
      onChange={(e) => updateField(field, isCount ? parseInt(e.target.value) || 0 : parseFloat(e.target.value) || 0)}
      className={`w-14 px-1 py-1 text-center text-xs border rounded outline-none focus:ring-1 focus:ring-blue-500 ${
        isCount
          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
          : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
      }`}
    />
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4">
      <div className="w-full max-w-360 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl my-8 flex flex-col max-h-[calc(100vh-4rem)]">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-700" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {isLoading ? "Đang tải..." : `Phiên bản ${version?.versionNo} — ${version?.name || "Không có tên"}`}
              </h2>
            </div>
            {version?.notes && <p className="text-sm text-slate-500 mt-1 ml-7">{version.notes}</p>}
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
              { label: "Tổng điểm", value: totalScore.toFixed(2), unit: `/ ${matrixTotalScore}` },
            ].map(({ label, value, unit }) => (
              <div key={label} className="bg-white dark:bg-slate-900 px-6 py-3 flex items-center gap-3">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-500">{label}</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {value} <span className="text-sm font-normal text-slate-500">{unit}</span>
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
            <div className="text-center py-16 text-slate-500">Phiên bản này chưa có chi tiết nào</div>
          ) : (
            <>
              {isScoreMismatch && (
                <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                    Tổng điểm hiện tại là <span className="font-bold">{totalScore.toFixed(2)}</span> —{" "}
                    {scoreDiff > 0
                      ? `vượt quá ${matrixTotalScore} điểm (+${scoreDiff.toFixed(2)})`
                      : `chưa đủ ${matrixTotalScore} điểm (${scoreDiff.toFixed(2)})`}
                    . Vui lòng điều chỉnh để tổng điểm bằng đúng <span className="font-bold">{matrixTotalScore}</span>.
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
                      <th className="w-20" />
                    </tr>
                    <tr className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                      <th />
                      {["Dễ", "TB", "Khó", "Dễ", "TB", "Khó"].map((l, i) => (
                        <th key={i} className="px-2 py-2 text-center text-xs font-medium text-slate-500">
                          {l}
                        </th>
                      ))}
                      <th />
                      <th />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {totalDetails.map((detail: any) => {
                      const isEditing = editingId === detail.id;
                      const rowScore = calculateScore(isEditing && editData ? editData : detail);

                      const CellContent = ({
                        countField,
                        scoreField,
                        isEditing,
                      }: {
                        countField: keyof EditingDetail;
                        scoreField: keyof EditingDetail;
                        isEditing: boolean;
                      }) =>
                        isEditing ? (
                          <div className="flex flex-col items-center gap-1">
                            <NumInput field={countField} isCount />
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-slate-400">×</span>
                              <NumInput field={scoreField} />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <span className="font-semibold">{(detail as any)[countField]}</span>
                            <span className="text-[10px] text-slate-400">
                              ×{parseFloat((detail as any)[scoreField]).toFixed(2)}
                            </span>
                          </div>
                        );

                      return (
                        <tr
                          key={detail.id}
                          className={`transition-colors ${
                            isEditing
                              ? "bg-blue-50/50 dark:bg-blue-900/10"
                              : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                          }`}
                        >
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">
                              {detail.lesson?.name}
                            </p>
                            <p className="text-xs text-slate-400">{detail.chapter.name}</p>
                          </td>

                          {(
                            [
                              ["easyMCQ", "easyMCQScore"],
                              ["mediumMCQ", "mediumMCQScore"],
                              ["hardMCQ", "hardMCQScore"],
                              ["easyEssay", "easyEssayScore"],
                              ["mediumEssay", "mediumEssayScore"],
                              ["hardEssay", "hardEssayScore"],
                            ] as [keyof EditingDetail, keyof EditingDetail][]
                          ).map(([countField, scoreField]) => (
                            <td key={countField} className="px-2 py-3 text-center">
                              <CellContent countField={countField} scoreField={scoreField} isEditing={isEditing} />
                            </td>
                          ))}

                          <td className="px-2 py-3 text-center">
                            <span
                              className={`text-base font-bold ${
                                isEditing && isScoreMismatch
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-slate-900 dark:text-white"
                              }`}
                            >
                              {rowScore.toFixed(2)}
                            </span>
                          </td>

                          <td className="px-2 py-3">
                            <div className="flex items-center justify-center gap-1">
                              {isEditing ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={saveEdit}
                                    disabled={saving || isScoreMismatch}
                                    title={isScoreMismatch ? `Tổng điểm phải bằng ${matrixTotalScore}` : undefined}
                                    className="flex items-center gap-1 px-2 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    {saving ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Save className="h-3 w-3" />
                                    )}
                                    Lưu
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="px-2 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                  >
                                    Huỷ
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => startEdit(detail)}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                                  title="Chỉnh sửa"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <td className="px-4 py-3 text-md font-bold text-slate-700 dark:text-slate-300">Tổng</td>
                      {["easyMCQ", "mediumMCQ", "hardMCQ", "easyEssay", "mediumEssay", "hardEssay"].map((f) => (
                        <td key={f} className="px-2 py-3 text-center">
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            {totalDetails.reduce((s: number, d: any) => s + (d[f] || 0), 0)}
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
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end px-6 py-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <Button
            onClick={onClose}
            className="px-6 py-5 text-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 rounded-lg font-medium transition-all"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VersionDetailModal;
