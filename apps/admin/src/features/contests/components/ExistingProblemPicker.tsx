import React, { useState, useEffect } from "react";
import { Search, Plus, Check, X, Loader2, ArrowLeft, ChevronLeft, ChevronRight, Eye, BookOpen } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";
import { useAddProblem, useRemoveProblem, useContestProblems } from "../queries/useContest";
import ConfirmModal from "./ConfirmModal";
import { DIFFICULTY_CONFIG, LANG_LABELS } from "../utils/contest.util";
import { Difficulty, Language, ProblemBriefResponse } from "@/features/problems/types/problem.type";
import { useProblemDetail, useProblems } from "@/features/problems/queries/useProblem";
interface ExistingProblemPickerProps {
  contestId: string;
  onBack: () => void;
}

type PreviewTab = "content" | "testcases" | "details";

export const ExistingProblemPicker: React.FC<ExistingProblemPickerProps> = ({ contestId, onBack }) => {
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState<Difficulty | "">("");
  const [activeProblem, setActiveProblem] = useState<ProblemBriefResponse | null>(null);
  const [previewTab, setPreviewTab] = useState<PreviewTab>("content");
  const [previewLang, setPreviewLang] = useState<Language>(Language.PYTHON);
  const [clearAllConfirm, setClearAllConfirm] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, diffFilter]);

  const { data: problemsData, isLoading: loadingProblems } = useProblems({
    page,
    size: 15,
    search: debouncedSearch || undefined,
    difficulty: diffFilter || undefined,
  });

  const { data: contestProblems } = useContestProblems(contestId);
  const addProblem = useAddProblem();
  const removeProblem = useRemoveProblem();

  const { data: previewDetail, isLoading: loadingPreview } = useProblemDetail(activeProblem?.id || "", previewLang, {
    enabled: !!activeProblem,
  });

  const problems = problemsData?.data || [];
  const totalPages = problemsData?.page?.totalPages || 1;
  const totalElements = problemsData?.page?.totalElements || 0;

  useEffect(() => {
    if (!activeProblem && problems.length > 0) {
      setActiveProblem(problems[0]!);
    }
  }, [problems]);

  const isInContest = (problemId: string) => contestProblems?.some((p) => p.problemId === problemId) ?? false;

  const getContestProblem = (problemId: string) => contestProblems?.find((p) => p.problemId === problemId);

  const handleAdd = async (p: ProblemBriefResponse) => {
    if (!contestProblems) return;
    try {
      await addProblem.mutateAsync({
        contestId,
        request: { problemId: p.id, orderIndex: contestProblems.length + 1 },
      });
    } catch (err: any) {
      toast.error("Không thể thêm bài tập", {
        description: err?.response?.data?.message,
      });
    }
  };

  const handleRemove = async (p: ProblemBriefResponse) => {
    const cp = getContestProblem(p.id);
    if (!cp) return;
    try {
      await removeProblem.mutateAsync({ contestId, contestProblemId: cp.contestProblemId });
    } catch (err: any) {
      toast.error("Không thể gỡ bài tập", {
        description: err?.response?.data?.message,
      });
    }
  };

  const handleToggle = (p: ProblemBriefResponse) => {
    if (isInContest(p.id)) handleRemove(p);
    else handleAdd(p);
  };

  const handleClearAll = async () => {
    if (!contestProblems) return;
    for (const cp of contestProblems) {
      await removeProblem.mutateAsync({ contestId, contestProblemId: cp.contestProblemId });
    }
    setClearAllConfirm(false);
  };

  const isProcessing = addProblem.isPending || removeProblem.isPending;

  const diffOptions: { value: Difficulty | ""; label: string }[] = [
    { value: "", label: "Tất cả" },
    { value: Difficulty.EASY, label: "Dễ" },
    { value: Difficulty.MEDIUM, label: "Trung bình" },
    { value: Difficulty.HARD, label: "Khó" },
  ];

  return (
    <>
      <ConfirmModal
        open={clearAllConfirm}
        variant="danger"
        title="Xóa tất cả bài tập"
        description="Bạn có chắc muốn gỡ tất cả bài tập đã chọn khỏi kỳ thi này?"
        confirmLabel="Xóa tất cả"
        onConfirm={handleClearAll}
        onCancel={() => setClearAllConfirm(false)}
      />

      <div className="flex flex-col h-screen bg-gray-50">
        <div className="px-8 py-4 bg-white border-b border-gray-200 flex items-center gap-4 shrink-0">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
          <span className="text-gray-300">|</span>
          <h1 className="text-base font-bold text-gray-900">Chọn bài tập từ ngân hàng</h1>
          {contestProblems && contestProblems.length > 0 && (
            <Badge className="bg-blue-600 text-white text-xs ml-auto">{contestProblems.length} đã chọn</Badge>
          )}
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-96 shrink-0 flex flex-col border-r border-gray-200 bg-white">
            <div className="p-4 border-b border-gray-100 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm bài tập..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {diffOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDiffFilter(opt.value)}
                    className={cn(
                      "px-2.5 py-1 text-xs font-semibold rounded-md border transition-all",
                      diffFilter === opt.value
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-blue-300",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400">{totalElements} bài tập</p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingProblems ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : problems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <BookOpen className="w-8 h-8 text-gray-300" />
                  <p className="text-sm text-gray-400">Không tìm thấy bài tập nào.</p>
                </div>
              ) : (
                problems.map((p) => {
                  const inContest = isInContest(p.id);
                  const cfg = DIFFICULTY_CONFIG[p.difficulty];
                  const isActive = activeProblem?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setActiveProblem(p)}
                      className={cn(
                        "w-full flex items-start gap-3 p-4 border-b border-gray-100 text-left transition-colors",
                        isActive ? "bg-blue-50 border-l-2 border-l-blue-600" : "hover:bg-gray-50",
                      )}
                    >
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggle(p);
                        }}
                        className={cn(
                          "shrink-0 mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer",
                          inContest ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300 hover:border-blue-400",
                        )}
                      >
                        {inContest && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{p.title}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Badge
                            variant="outline"
                            className={cn("text-[10px] font-bold border px-1.5 py-0", cfg?.className)}
                          >
                            {cfg?.label}
                          </Badge>
                          {p.tags.slice(0, 2).map((tag) => (
                            <span key={tag.id} className="text-[10px] text-gray-400">
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white shrink-0">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-gray-600">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            {!activeProblem ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Eye className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">Chọn bài tập để xem chi tiết</p>
                </div>
              </div>
            ) : (
              <>
                <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <h2 className="text-base font-bold text-gray-900">{activeProblem.title}</h2>
                    {activeProblem.difficulty && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs font-bold border",
                          DIFFICULTY_CONFIG[activeProblem.difficulty]?.className,
                        )}
                      >
                        {DIFFICULTY_CONFIG[activeProblem.difficulty]?.label}
                      </Badge>
                    )}
                  </div>
                  {isInContest(activeProblem.id) ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemove(activeProblem)}
                      disabled={isProcessing}
                      className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                      Gỡ khỏi kỳ thi
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleAdd(activeProblem)}
                      disabled={isProcessing}
                      className="gap-1.5 bg-primary hover:bg-blue-700 text-white"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                      Thêm vào kỳ thi
                    </Button>
                  )}
                </div>

                <div className="flex gap-0 px-6 bg-white border-b border-gray-200 shrink-0">
                  {(
                    [
                      { id: "content", label: "Nội dung" },
                      { id: "testcases", label: "Test Cases mẫu" },
                      { id: "details", label: "Thông tin" },
                    ] as { id: PreviewTab; label: string }[]
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setPreviewTab(tab.id)}
                      className={cn(
                        "py-3 px-4 text-xs font-semibold border-b-2 transition-colors",
                        previewTab === tab.id
                          ? "text-blue-600 border-blue-600"
                          : "text-gray-500 border-transparent hover:text-gray-700",
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                  {loadingPreview ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                  ) : previewDetail ? (
                    <>
                      {previewTab === "content" && (
                        <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
                          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                            {previewDetail.description}
                          </div>
                          {previewDetail.constraints && (
                            <div>
                              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Ràng buộc</p>
                              <pre className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-3 text-sm font-mono whitespace-pre-wrap">
                                {previewDetail.constraints}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}

                      {previewTab === "testcases" && (
                        <div className="space-y-4">
                          {previewDetail.sampleTestcases.length === 0 ? (
                            <div className="text-center py-8 bg-white rounded-xl border border-gray-200 text-sm text-gray-400">
                              Không có test case mẫu.
                            </div>
                          ) : (
                            previewDetail.sampleTestcases.map((tc, idx) => (
                              <div key={tc.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="flex items-center px-4 py-2 bg-gray-50 border-b border-gray-200">
                                  <span className="text-xs font-bold text-gray-600">Test Case #{idx + 1}</span>
                                </div>
                                <div className="grid grid-cols-2 divide-x divide-gray-200">
                                  <div className="p-4">
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Input</p>
                                    <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                                      {tc.input}
                                    </pre>
                                  </div>
                                  <div className="p-4">
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Expected Output</p>
                                    <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                                      {tc.expectedOutput}
                                    </pre>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {previewTab === "details" && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white rounded-xl border border-gray-200">
                              <p className="text-xs font-bold text-gray-400 uppercase mb-1.5">Thời gian</p>
                              <p className="text-xl font-bold text-gray-900">{previewDetail.timeLimitMs / 1000}s</p>
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-gray-200">
                              <p className="text-xs font-bold text-gray-400 uppercase mb-1.5">Bộ nhớ</p>
                              <p className="text-xl font-bold text-gray-900">{previewDetail.memoryLimitMb} MB</p>
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-gray-200">
                              <p className="text-xs font-bold text-gray-400 uppercase mb-1.5">Khối lớp</p>
                              <p className="text-xl font-bold text-gray-900">Lớp {previewDetail.classLevel}</p>
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-gray-200">
                              <p className="text-xs font-bold text-gray-400 uppercase mb-1.5">Trạng thái</p>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "font-bold border text-sm",
                                  previewDetail.isPublic
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-gray-100 text-gray-600 border-gray-200",
                                )}
                              >
                                {previewDetail.isPublic ? "Công khai" : "Không công khai"}
                              </Badge>
                            </div>
                          </div>
                          {previewDetail.tags.length > 0 && (
                            <div className="p-4 bg-white rounded-xl border border-gray-200">
                              <p className="text-xs font-bold text-gray-400 uppercase mb-3">Tags</p>
                              <div className="flex flex-wrap gap-2">
                                {previewDetail.tags.map((tag) => (
                                  <Badge
                                    key={tag.id}
                                    variant="outline"
                                    className="bg-blue-50 text-blue-600 border-blue-200 text-xs"
                                  >
                                    {tag.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="p-4 bg-white rounded-xl border border-gray-200">
                            <div className="flex items-center gap-2 mb-3">
                              <p className="text-xs font-bold text-gray-400 uppercase">Code Template</p>
                              <div className="flex gap-1.5 ml-auto">
                                {Object.values(Language).map((lang) => (
                                  <button
                                    key={lang}
                                    onClick={() => setPreviewLang(lang)}
                                    className={cn(
                                      "px-2 py-1 text-[10px] font-bold rounded border transition-all",
                                      previewLang === lang
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "bg-white text-gray-500 border-gray-200 hover:border-blue-400",
                                    )}
                                  >
                                    {LANG_LABELS[lang]}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <pre className="bg-gray-900 text-green-300 p-4 rounded-lg text-xs font-mono whitespace-pre overflow-x-auto max-h-48">
                              {previewDetail.codeTemplate || "Không có template."}
                            </pre>
                          </div>
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="shrink-0 bg-white border-t border-gray-200 px-8 py-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">
              Đã chọn <span className="text-blue-600 font-bold">{contestProblems?.length || 0}</span> bài:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-xl">
              {contestProblems?.map((cp) => (
                <span
                  key={cp.contestProblemId}
                  className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-bold border border-blue-200 whitespace-nowrap"
                >
                  <span className="opacity-60 text-[10px]">{cp.label}</span>
                  {cp.title}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setClearAllConfirm(true)}
              disabled={!contestProblems?.length || isProcessing}
              className="text-xs font-semibold text-gray-400 hover:text-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Xóa tất cả
            </button>
            <Button
              onClick={() => navigate({ to: `/contests/${contestId}` })}
              className="gap-2 bg-primary hover:bg-blue-700 text-white"
            >
              <Check className="w-4 h-4" />
              Hoàn tất ({contestProblems?.length || 0})
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
