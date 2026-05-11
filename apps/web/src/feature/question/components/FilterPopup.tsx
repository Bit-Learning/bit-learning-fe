import { useState, useRef, useEffect } from "react";
import { SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { QuestionType, QuestionLevel } from "../types/question.type";
import { useSubjectsList } from "@/feature/matrix/queries/useSubject";
import { useChaptersBySubject } from "@/feature/matrix/queries/useChapter";
import { useLessonsByChapter } from "@/feature/matrix/queries/useLesson";
import { cn } from "@workspace/ui/lib/utils";

export interface FilterValues {
  subjectId: number | undefined;
  chapterId: number | undefined;
  lessonId: number | undefined;
  typeFilter: QuestionType | "";
  levelFilter: QuestionLevel | "";
}

interface FilterPopupProps {
  value: FilterValues;
  onChange: (values: FilterValues) => void;
  onClear: () => void;
}

const selectCls =
  "w-full appearance-none pl-3 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer transition-all";

export const FilterPopup: React.FC<FilterPopupProps> = ({ value, onChange, onClear }) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FilterValues>(value);
  const ref = useRef<HTMLDivElement>(null);

  const { data: subjectsData } = useSubjectsList();
  const subjects = subjectsData || [];

  const { data: chaptersData, isLoading: loadingChapters } = useChaptersBySubject(draft.subjectId);
  const chapters = chaptersData || [];

  const { data: lessonsData, isLoading: loadingLessons } = useLessonsByChapter(draft.chapterId);
  const lessons = lessonsData || [];

  const activeCount = [
    value.subjectId !== undefined,
    value.chapterId !== undefined,
    value.lessonId !== undefined,
    value.typeFilter !== "",
    value.levelFilter !== "",
  ].filter(Boolean).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleOpen = () => {
    setDraft(value);
    setOpen((v) => !v);
  };

  const handleApply = () => {
    onChange(draft);
    setOpen(false);
  };

  const handleReset = () => {
    const empty: FilterValues = {
      subjectId: undefined,
      chapterId: undefined,
      lessonId: undefined,
      typeFilter: "",
      levelFilter: "",
    };
    setDraft(empty);
    onChange(empty);
    onClear();
  };

  return (
    <div className="relative flex items-center gap-2 " ref={ref}>
      <button
        onClick={handleOpen}
        className={cn(
          "flex items-center gap-2 pl-3 pr-4 py-3 rounded-md text-sm font-medium border-2 transition-all shadow-sm cursor-pointer",
          activeCount > 0
            ? "bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
            : "bg-white border-gray-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300",
        )}
      >
        <SlidersHorizontal className="h-4 w-4" />
        Bộ lọc
        {activeCount > 0 && (
          <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-white text-blue-600 text-xs font-bold">
            {activeCount}
          </span>
        )}
        <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-120 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-700">
            <span className="text-md font-semibold text-gray-800 dark:text-slate-200">Bộ lọc nâng cao</span>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Loại câu hỏi
              </label>
              <div className="relative">
                <select
                  value={draft.typeFilter}
                  onChange={(e) => setDraft((d) => ({ ...d, typeFilter: e.target.value as QuestionType | "" }))}
                  className={selectCls}
                >
                  <option value="">Tất cả</option>
                  <option value={QuestionType.MCQ}>Trắc nghiệm</option>
                  <option value={QuestionType.ESSAY}>Tự luận</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Mức độ</label>
              <div className="relative">
                <select
                  value={draft.levelFilter}
                  onChange={(e) => setDraft((d) => ({ ...d, levelFilter: e.target.value as QuestionLevel | "" }))}
                  className={selectCls}
                >
                  <option value="">Tất cả</option>
                  <option value={QuestionLevel.EASY}>Dễ</option>
                  <option value={QuestionLevel.MEDIUM}>Trung bình</option>
                  <option value={QuestionLevel.HARD}>Khó</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Môn học
              </label>
              <div className="relative">
                <select
                  value={draft.subjectId ?? ""}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : undefined;
                    setDraft((d) => ({ ...d, subjectId: val, chapterId: undefined, lessonId: undefined }));
                  }}
                  className={selectCls}
                >
                  <option value="">Tất cả</option>
                  {subjects.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {draft.subjectId !== undefined && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Chương
                </label>
                <div className="relative">
                  <select
                    value={draft.chapterId ?? ""}
                    onChange={(e) => {
                      const val = e.target.value ? Number(e.target.value) : undefined;
                      setDraft((d) => ({ ...d, chapterId: val, lessonId: undefined }));
                    }}
                    disabled={loadingChapters}
                    className={cn(selectCls, loadingChapters && "opacity-60 cursor-not-allowed")}
                  >
                    <option value="">{loadingChapters ? "Đang tải..." : "Tất cả"}</option>
                    {chapters.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            )}

            {draft.chapterId !== undefined && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Bài học
                </label>
                <div className="relative">
                  <select
                    value={draft.lessonId ?? ""}
                    onChange={(e) => {
                      const val = e.target.value ? Number(e.target.value) : undefined;
                      setDraft((d) => ({ ...d, lessonId: val }));
                    }}
                    disabled={loadingLessons}
                    className={cn(selectCls, loadingLessons && "opacity-60 cursor-not-allowed")}
                  >
                    <option value="">{loadingLessons ? "Đang tải..." : "Tất cả"}</option>
                    {lessons.map((l: any) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
            <button
              onClick={handleReset}
              className="cursor-pointer px-4 py-2 rounded-lg border border-slate-800 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
            >
              Đặt lại
            </button>
            <button
              onClick={handleApply}
              className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
