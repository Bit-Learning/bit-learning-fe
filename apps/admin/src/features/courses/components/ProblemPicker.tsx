import React, { useEffect, useRef, useState } from "react";
import { BookOpen, Code2, Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProblems } from "@/features/problems/queries/useProblem";
import { Difficulty } from "@/features/problems/types/problem.type";

export const difficultyLabel: Record<Difficulty, { label: string; color: string }> = {
  EASY: { label: "Dễ", color: "text-green-600 bg-green-50 border-green-200" },
  MEDIUM: { label: "Trung bình", color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
  HARD: { label: "Khó", color: "text-red-600 bg-red-50 border-red-200" },
};

const DIFFICULTY_FILTERS = [
  { value: undefined, label: "Tất cả" },
  { value: Difficulty.EASY, label: "Dễ" },
  { value: Difficulty.MEDIUM, label: "Trung bình" },
  { value: Difficulty.HARD, label: "Khó" },
] as const;

const CLASS_LEVEL_OPTIONS = [
  { value: undefined, label: "Tất cả lớp" },
  { value: 10, label: "Lớp 10" },
  { value: 11, label: "Lớp 11" },
  { value: 12, label: "Lớp 12" },
];

interface ProblemPickerModalProps {
  currentValue?: string;
  onSelect: (id: string | undefined) => void;
  onClose: () => void;
}

export const ProblemPickerModal: React.FC<ProblemPickerModalProps> = ({ currentValue, onSelect, onClose }) => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | undefined>(undefined);
  const [classLevelFilter, setClassLevelFilter] = useState<number | undefined>(undefined);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedSearch(e.target.value), 400);
  };

  const { data: problemsData, isLoading } = useProblems({
    search: debouncedSearch || undefined,
    difficulty: difficultyFilter,
    classLevel: classLevelFilter,
    size: 20,
  });

  const problems = problemsData?.data ?? [];

  const handleSelect = (id: string) => {
    onSelect(id === currentValue ? undefined : id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
      <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Chọn bài tập lập trình</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 border-b px-6 py-4">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-gray-400" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Tìm theo tên bài tập…"
              className="flex-1 bg-transparent text-base outline-none placeholder:text-gray-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setDebouncedSearch("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {DIFFICULTY_FILTERS.map((f) => (
              <button
                key={String(f.value)}
                type="button"
                onClick={() => setDifficultyFilter(f.value)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors
                  ${difficultyFilter === f.value ? "bg-blue-500 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {f.label}
              </button>
            ))}

            <div className="mx-1 w-px self-stretch bg-gray-200" />

            {CLASS_LEVEL_OPTIONS.map((c) => (
              <button
                key={String(c.value)}
                type="button"
                onClick={() => setClassLevelFilter(c.value)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors
                  ${classLevelFilter === c.value ? "bg-indigo-500 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {c.value && <BookOpen className="h-3.5 w-3.5" />}
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-105 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : problems.length === 0 ? (
            <div className="py-16 text-center">
              <Code2 className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="text-base text-gray-400">Không tìm thấy bài tập</p>
            </div>
          ) : (
            problems.map((problem) => {
              const isSelected = problem.id === currentValue;
              return (
                <button
                  key={problem.id}
                  type="button"
                  onClick={() => handleSelect(problem.id)}
                  className={`group flex w-full items-start gap-4 border-b border-gray-50 px-6 py-4 text-left transition-colors last:border-0
                    ${isSelected ? "bg-blue-50" : "hover:bg-gray-50"}`}
                >
                  <div
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors
                      ${isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300 group-hover:border-blue-400"}`}
                  >
                    {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        className={`truncate text-base font-semibold ${isSelected ? "text-blue-700" : "text-gray-800"}`}
                      >
                        {problem.title}
                      </p>
                      <span
                        className={`shrink-0 rounded border px-2 py-0.5 text-xs font-semibold ${difficultyLabel[problem.difficulty]?.color ?? ""}`}
                      >
                        {difficultyLabel[problem.difficulty]?.label}
                      </span>
                      {problem.classLevel && (
                        <span className="flex shrink-0 items-center gap-1 rounded border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600">
                          <BookOpen className="h-3 w-3" />
                          Lớp {problem.classLevel}
                        </span>
                      )}
                    </div>
                    {problem.createdBy && (
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-400">
                        {problem.createdBy.avatar ? (
                          <img src={problem.createdBy.avatar} alt="" className="h-4 w-4 rounded-full object-cover" />
                        ) : (
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 text-[10px] font-bold text-gray-500">
                            {problem.createdBy.firstName?.[0]}
                          </span>
                        )}
                        {problem.createdBy.firstName} {problem.createdBy.lastName}
                      </p>
                    )}
                    {problem.tags?.length > 0 && (
                      <p className="mt-1 truncate text-sm text-gray-400">
                        {problem.tags
                          .slice(0, 4)
                          .map((t) => t.name)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t px-6 py-3">
          <p className="text-sm text-gray-400">
            {problems.length > 0 ? `${problems.length} bài tập` : ""}
            <span className="ml-2 text-gray-300">·</span>
            <span className="ml-2">Chỉ chọn được 1 bài</span>
          </p>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};

interface ProblemPickerProps {
  value?: string;
  onChange: (id: string | undefined) => void;
}

const ProblemPicker: React.FC<ProblemPickerProps> = ({ value, onChange }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const { data: fallbackData } = useProblems({ size: 100 }, { enabled: !!value });
  const problems = fallbackData?.data ?? [];
  const selected = value ? problems.find((p) => p.id === value) : undefined;

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-base font-medium text-gray-700">
            Thêm bài tập lập trình
            <span className="text-sm font-normal text-gray-400">(tùy chọn)</span>
          </label>
          {value && (
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-red-500"
            >
              <X className="h-3.5 w-3.5" />
              Bỏ chọn
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex w-full items-center gap-3 rounded-xl border border-gray-300 px-4 py-3.5 text-left transition-all hover:border-blue-400 hover:bg-blue-50/30 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          {selected ? (
            <>
              <Code2 className="h-5 w-5 shrink-0 text-blue-500" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-gray-800">{selected.title}</p>
                <div className="mt-0.5 flex items-center gap-2">
                  {selected.createdBy && (
                    <span className="text-sm text-gray-400">
                      {selected.createdBy.firstName} {selected.createdBy.lastName}
                    </span>
                  )}
                  {selected.classLevel && (
                    <span className="flex items-center gap-1 text-sm text-indigo-500">
                      <BookOpen className="h-3.5 w-3.5" />
                      Lớp {selected.classLevel}
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`shrink-0 rounded border px-2.5 py-1 text-sm font-semibold ${difficultyLabel[selected.difficulty]?.color ?? ""}`}
              >
                {difficultyLabel[selected.difficulty]?.label}
              </span>
            </>
          ) : (
            <>
              <Search className="h-5 w-5 shrink-0 text-gray-400" />
              <span className="flex-1 text-base text-gray-400">Chọn bài tập lập trình…</span>
              <span className="text-sm text-blue-500">Chọn</span>
            </>
          )}
        </button>
      </div>

      {modalOpen && <ProblemPickerModal currentValue={value} onSelect={onChange} onClose={() => setModalOpen(false)} />}
    </>
  );
};

export default ProblemPicker;
