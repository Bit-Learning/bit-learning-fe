import { Plus, Trash2 } from "lucide-react";
import { useChaptersBySubject } from "../queries/useChapter";
import { useLessonsByChapter } from "../queries/useLesson";
import { TMatrixDetailRequest } from "../types/matrix.type";
import { TChapterBriefResponse } from "../types/chapter.type";
import { TLessonBriefResponse } from "../types/lesson.type";

const calculateRowScore = (row: TMatrixDetailRequest): number =>
  row.easyMCQ * row.easyMCQScore +
  row.mediumMCQ * row.mediumMCQScore +
  row.hardMCQ * row.hardMCQScore +
  row.easyEssay * row.easyEssayScore +
  row.mediumEssay * row.mediumEssayScore +
  row.hardEssay * row.hardEssayScore;

export interface TChapterGroup {
  chapterId: number;
  details: TMatrixDetailRequest[];
}

interface GroupProps {
  group: TChapterGroup;
  gIdx: number;
  subjectId: number;
  onUpdateChapter: (gIdx: number, chapterId: number) => void;
  onAddDetail: (gIdx: number) => void;
  onRemoveDetail: (gIdx: number, dIdx: number) => void;
  onUpdateDetail: (gIdx: number, dIdx: number, field: keyof TMatrixDetailRequest, value: number) => void;
  onRemoveGroup: (gIdx: number) => void;
}

const ChapterGroup: React.FC<GroupProps> = ({
  group,
  gIdx,
  subjectId,
  onUpdateChapter,
  onAddDetail,
  onRemoveDetail,
  onUpdateDetail,
  onRemoveGroup,
}) => {
  const { data: chapters } = useChaptersBySubject(subjectId);
  const { data: lessons } = useLessonsByChapter(group.chapterId || undefined);

  return (
    <div className="border-2 border-slate-200 dark:border-slate-700 rounded-md overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b-2 border-slate-200 bg-slate-50 dark:bg-slate-800/50">
        <select
          value={group.chapterId}
          onChange={(e) => onUpdateChapter(gIdx, Number(e.target.value))}
          className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-400 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value={0}>-- Chọn chương --</option>
          {chapters?.map((chapter: TChapterBriefResponse, index) => (
            <option key={index} value={chapter.id}>
              Chương {index + 1}: {chapter.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onRemoveGroup(gIdx)}
          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1.5 shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {group.chapterId ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <th className="px-4 py-2 text-left text-sm font-semibold text-slate-600 dark:text-slate-400 w-64">
                  Bài học
                </th>
                <th className="px-2 py-2 text-center text-sm  font-bold text-blue-600 dark:text-blue-400" colSpan={3}>
                  MCQ - Trắc nghiệm
                </th>
                <th
                  className="px-2 py-2 text-center text-sm  font-bold text-orange-600 dark:text-orange-400"
                  colSpan={3}
                >
                  Essay - Tự luận
                </th>
                <th className="px-2 py-2 text-center text-sm  font-semibold text-slate-800 dark:text-slate-400">
                  Điểm
                </th>
                <th className="w-10"></th>
              </tr>
              <tr className="border-t border-b border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900">
                <th></th>
                {["Dễ", "TB", "Khó", "Dễ", "TB", "Khó"].map((label, i) => (
                  <th key={i} className="px-2 py-2 text-center text-xs font-medium text-slate-800 dark:text-slate-400">
                    {label}
                  </th>
                ))}
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {group.details.map((detail, dIdx) => (
                <tr key={dIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="px-2 py-2">
                    <select
                      value={detail.lessonId}
                      onChange={(e) => onUpdateDetail(gIdx, dIdx, "lessonId", Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value={0}>-- Chọn bài học --</option>
                      {lessons?.map((lesson: TLessonBriefResponse) => (
                        <option key={lesson.id} value={lesson.id}>
                          {lesson.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-2 py-3">
                    <div className="flex flex-col items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        value={detail.easyMCQ}
                        onChange={(e) => onUpdateDetail(gIdx, dIdx, "easyMCQ", Number(e.target.value) || 0)}
                        className="w-16 px-2 py-1.5 text-center bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="0"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400">×</span>
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={detail.easyMCQScore}
                          onChange={(e) => onUpdateDetail(gIdx, dIdx, "easyMCQScore", Number(e.target.value) || 0)}
                          className="w-12 px-1 py-1 text-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-[10px] focus:ring-1 focus:ring-orange-500 outline-none"
                        />
                      </div>
                    </div>
                  </td>

                  <td className="px-2 py-3">
                    <div className="flex flex-col items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        value={detail.mediumMCQ}
                        onChange={(e) => onUpdateDetail(gIdx, dIdx, "mediumMCQ", Number(e.target.value) || 0)}
                        className="w-16 px-2 py-1.5 text-center bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="0"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400">×</span>
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={detail.mediumMCQScore}
                          onChange={(e) => onUpdateDetail(gIdx, dIdx, "mediumMCQScore", Number(e.target.value) || 0)}
                          className="w-12 px-1 py-1 text-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-[10px] focus:ring-1 focus:ring-orange-500 outline-none"
                        />
                      </div>
                    </div>
                  </td>

                  <td className="px-2 py-3">
                    <div className="flex flex-col items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        value={detail.hardMCQ}
                        onChange={(e) => onUpdateDetail(gIdx, dIdx, "hardMCQ", Number(e.target.value) || 0)}
                        className="w-16 px-2 py-1.5 text-center bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="0"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400">×</span>
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={detail.hardMCQScore}
                          onChange={(e) => onUpdateDetail(gIdx, dIdx, "hardMCQScore", Number(e.target.value) || 0)}
                          className="w-12 px-1 py-1 text-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-[10px] focus:ring-1 focus:ring-orange-500 outline-none"
                        />
                      </div>
                    </div>
                  </td>

                  <td className="px-2 py-3">
                    <div className="flex flex-col items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        value={detail.easyEssay}
                        onChange={(e) => onUpdateDetail(gIdx, dIdx, "easyEssay", Number(e.target.value) || 0)}
                        className="w-16 px-2 py-1.5 text-center bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                        placeholder="0"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400">×</span>
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={detail.easyEssayScore}
                          onChange={(e) => onUpdateDetail(gIdx, dIdx, "easyEssayScore", Number(e.target.value) || 0)}
                          className="w-12 px-1 py-1 text-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-[10px] focus:ring-1 focus:ring-orange-500 outline-none"
                        />
                      </div>
                    </div>
                  </td>

                  <td className="px-2 py-3">
                    <div className="flex flex-col items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        value={detail.mediumEssay}
                        onChange={(e) => onUpdateDetail(gIdx, dIdx, "mediumEssay", Number(e.target.value) || 0)}
                        className="w-16 px-2 py-1.5 text-center bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                        placeholder="0"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400">×</span>
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={detail.mediumEssayScore}
                          onChange={(e) => onUpdateDetail(gIdx, dIdx, "mediumEssayScore", Number(e.target.value) || 0)}
                          className="w-12 px-1 py-1 text-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-[10px] focus:ring-1 focus:ring-orange-500 outline-none"
                        />
                      </div>
                    </div>
                  </td>

                  <td className="px-2 py-3">
                    <div className="flex flex-col items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        value={detail.hardEssay}
                        onChange={(e) => onUpdateDetail(gIdx, dIdx, "hardEssay", Number(e.target.value) || 0)}
                        className="w-16 px-2 py-1.5 text-center bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                        placeholder="0"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400">×</span>
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={detail.hardEssayScore}
                          onChange={(e) => onUpdateDetail(gIdx, dIdx, "hardEssayScore", Number(e.target.value) || 0)}
                          className="w-12 px-1 py-1 text-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-[10px] focus:ring-1 focus:ring-orange-500 outline-none"
                        />
                      </div>
                    </div>
                  </td>

                  <td className="px-2 py-3 text-center">
                    <span className="text-lg font-semibold text-slate-900 dark:text-white">
                      {calculateRowScore(detail).toFixed(2)}
                    </span>
                  </td>

                  <td className="px-2 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => onRemoveDetail(gIdx, dIdx)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors p-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            type="button"
            onClick={() => onAddDetail(gIdx)}
            className="cursor-pointer w-full py-2 text-md font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all flex items-center justify-center gap-1.5 border-t border-slate-100 dark:border-slate-800"
          >
            <Plus className="h-3.5 w-3.5" />
            Thêm bài học
          </button>
        </div>
      ) : (
        <div className="px-4 py-6 text-center text-sm text-slate-400 italic border-t border-slate-100 dark:border-slate-800">
          Chọn chương để tiếp tục cấu hình...
        </div>
      )}
    </div>
  );
};

export default ChapterGroup;
