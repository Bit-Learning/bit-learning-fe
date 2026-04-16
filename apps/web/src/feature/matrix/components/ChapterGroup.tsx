import { Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
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

interface NumericInputProps {
  value: number;
  onChange: (val: number) => void;
  className?: string;
  min?: number;
  step?: number;
  placeholder?: string;
}

const NumericInput: React.FC<NumericInputProps> = ({
  value,
  onChange,
  min = 0,
  step = 1,
  placeholder = "0",
  className = "",
}) => {
  const [display, setDisplay] = useState<string>(value === 0 ? "" : String(value));

  useEffect(() => {
    setDisplay(value === 0 ? "" : String(value));
  }, [value]);

  return (
    <input
      type="number"
      min={min}
      step={step}
      placeholder={placeholder}
      className={className}
      value={display}
      onChange={(e) => {
        const raw = e.target.value;
        setDisplay(raw);
        const parsed = parseFloat(raw);
        onChange(isNaN(parsed) ? 0 : parsed);
      }}
      onBlur={() => {
        if (display !== "") {
          const parsed = parseFloat(display);
          setDisplay(isNaN(parsed) ? "" : String(parsed));
        }
      }}
    />
  );
};

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
    <div className="border-2 border-gray-200 dark:border-slate-700 rounded-md overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b-2 border-gray-200 bg-slate-50 dark:bg-slate-800/50">
        <select
          value={group.chapterId}
          onChange={(e) => onUpdateChapter(gIdx, Number(e.target.value))}
          className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-400 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value={0}>-- Chọn chương --</option>
          {chapters?.map((chapter: TChapterBriefResponse, index: number) => (
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
                <th className="px-2 py-2 text-center text-sm font-bold text-blue-600 dark:text-blue-400" colSpan={3}>
                  MCQ - Trắc nghiệm
                </th>
                <th
                  className="px-2 py-2 text-center text-sm font-bold text-orange-600 dark:text-orange-400"
                  colSpan={3}
                >
                  Essay - Tự luận
                </th>
                <th className="px-2 py-2 text-center text-sm font-semibold text-slate-800 dark:text-slate-400">Điểm</th>
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
                      <NumericInput
                        value={detail.easyMCQ}
                        onChange={(val) => onUpdateDetail(gIdx, dIdx, "easyMCQ", val)}
                        className="w-16 px-2 py-1.5 text-center bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400">×</span>
                        <NumericInput
                          value={detail.easyMCQScore}
                          onChange={(val) => onUpdateDetail(gIdx, dIdx, "easyMCQScore", val)}
                          step={0.01}
                          className="w-12 px-1 py-1 text-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-[10px] focus:ring-1 focus:ring-orange-500 outline-none"
                        />
                      </div>
                    </div>
                  </td>

                  <td className="px-2 py-3">
                    <div className="flex flex-col items-center gap-1">
                      <NumericInput
                        value={detail.mediumMCQ}
                        onChange={(val) => onUpdateDetail(gIdx, dIdx, "mediumMCQ", val)}
                        className="w-16 px-2 py-1.5 text-center bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400">×</span>
                        <NumericInput
                          value={detail.mediumMCQScore}
                          onChange={(val) => onUpdateDetail(gIdx, dIdx, "mediumMCQScore", val)}
                          step={0.01}
                          className="w-12 px-1 py-1 text-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-[10px] focus:ring-1 focus:ring-orange-500 outline-none"
                        />
                      </div>
                    </div>
                  </td>

                  <td className="px-2 py-3">
                    <div className="flex flex-col items-center gap-1">
                      <NumericInput
                        value={detail.hardMCQ}
                        onChange={(val) => onUpdateDetail(gIdx, dIdx, "hardMCQ", val)}
                        className="w-16 px-2 py-1.5 text-center bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400">×</span>
                        <NumericInput
                          value={detail.hardMCQScore}
                          onChange={(val) => onUpdateDetail(gIdx, dIdx, "hardMCQScore", val)}
                          step={0.01}
                          className="w-12 px-1 py-1 text-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-[10px] focus:ring-1 focus:ring-orange-500 outline-none"
                        />
                      </div>
                    </div>
                  </td>

                  <td className="px-2 py-3">
                    <div className="flex flex-col items-center gap-1">
                      <NumericInput
                        value={detail.easyEssay}
                        onChange={(val) => onUpdateDetail(gIdx, dIdx, "easyEssay", val)}
                        className="w-16 px-2 py-1.5 text-center bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400">×</span>
                        <NumericInput
                          value={detail.easyEssayScore}
                          onChange={(val) => onUpdateDetail(gIdx, dIdx, "easyEssayScore", val)}
                          step={0.01}
                          className="w-12 px-1 py-1 text-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-[10px] focus:ring-1 focus:ring-orange-500 outline-none"
                        />
                      </div>
                    </div>
                  </td>

                  <td className="px-2 py-3">
                    <div className="flex flex-col items-center gap-1">
                      <NumericInput
                        value={detail.mediumEssay}
                        onChange={(val) => onUpdateDetail(gIdx, dIdx, "mediumEssay", val)}
                        className="w-16 px-2 py-1.5 text-center bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400">×</span>
                        <NumericInput
                          value={detail.mediumEssayScore}
                          onChange={(val) => onUpdateDetail(gIdx, dIdx, "mediumEssayScore", val)}
                          step={0.01}
                          className="w-12 px-1 py-1 text-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-[10px] focus:ring-1 focus:ring-orange-500 outline-none"
                        />
                      </div>
                    </div>
                  </td>

                  <td className="px-2 py-3">
                    <div className="flex flex-col items-center gap-1">
                      <NumericInput
                        value={detail.hardEssay}
                        onChange={(val) => onUpdateDetail(gIdx, dIdx, "hardEssay", val)}
                        className="w-16 px-2 py-1.5 text-center bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400">×</span>
                        <NumericInput
                          value={detail.hardEssayScore}
                          onChange={(val) => onUpdateDetail(gIdx, dIdx, "hardEssayScore", val)}
                          step={0.01}
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
