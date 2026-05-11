import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuestionLevel, QuestionType } from "../types/question.type";
import { useCurriculumsList } from "@/features/curriculum/queries/useCurriculum";
import { useChaptersBySubject } from "@/features/curriculum/queries/useChapter";
import { useLessonsByChapter } from "@/features/curriculum/queries/useLesson";
import { useSubjectsByCurriculum } from "@/features/curriculum/queries/useSubject";

export type FilterState = {
  curriculumId: number | null;
  subjectId: number | null;
  chapterId: number | null;
  lessonId: number | null;
  questionType: QuestionType | null;
  questionLevel: QuestionLevel | null;
};

export const EMPTY_FILTERS: FilterState = {
  curriculumId: null,
  subjectId: null,
  chapterId: null,
  lessonId: null,
  questionType: null,
  questionLevel: null,
};

export function FilterPanel({
  filters,
  onChange,
  onClose,
}: {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onClose: () => void;
}) {
  const [local, setLocal] = useState<FilterState>(filters);

  const { data: curriculums, isLoading: loadingCurriculums } = useCurriculumsList();
  const { data: subjects, isLoading: loadingSubjects } = useSubjectsByCurriculum(local.curriculumId ?? undefined);
  const { data: chapters, isLoading: loadingChapters } = useChaptersBySubject(local.subjectId ?? undefined);
  const { data: lessons, isLoading: loadingLessons } = useLessonsByChapter(local.chapterId ?? undefined);

  const set = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setLocal((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "curriculumId") {
        next.subjectId = null;
        next.chapterId = null;
        next.lessonId = null;
      } else if (key === "subjectId") {
        next.chapterId = null;
        next.lessonId = null;
      } else if (key === "chapterId") {
        next.lessonId = null;
      }
      return next;
    });
  };

  const backendFilterCount = [
    local.subjectId,
    local.chapterId,
    local.lessonId,
    local.questionType,
    local.questionLevel,
  ].filter(Boolean).length;

  const canApply = backendFilterCount > 0;
  return (
    <div
      className="absolute right-0 top-full mt-2 z-50 w-120 bg-background border rounded-xl shadow-xl p-4 space-y-4"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm">Bộ lọc nâng cao</span>
        <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Chương trình</Label>
        <Select
          value={local.curriculumId?.toString() ?? "all"}
          onValueChange={(v) => set("curriculumId", v === "all" ? null : Number(v))}
          disabled={loadingCurriculums}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {curriculums?.map((c: any) => (
              <SelectItem key={c.id} value={c.id.toString()}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Môn học</Label>
        <Select
          value={local.subjectId?.toString() ?? "all"}
          onValueChange={(v) => set("subjectId", v ? Number(v) : null)}
          disabled={!local.curriculumId || loadingSubjects}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder={!local.curriculumId ? "Chọn chương trình trước" : "Tất cả"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {subjects?.map((s: any) => (
              <SelectItem key={s.id} value={s.id.toString()}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Chương</Label>
        <Select
          value={local.chapterId?.toString() ?? "all"}
          onValueChange={(v) => set("chapterId", v ? Number(v) : null)}
          disabled={!local.subjectId || loadingChapters}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder={!local.subjectId ? "Chọn môn học trước" : "Tất cả"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {chapters?.map((c: any) => (
              <SelectItem key={c.id} value={c.id.toString()}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Bài học</Label>
        <Select
          value={local.lessonId?.toString() ?? "all"}
          onValueChange={(v) => set("lessonId", v ? Number(v) : null)}
          disabled={!local.chapterId || loadingLessons}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder={!local.chapterId ? "Chọn chương trước" : "Tất cả"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {lessons?.map((l: any) => (
              <SelectItem key={l.id} value={l.id.toString()}>
                {l.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Loại câu hỏi</Label>
          <Select
            value={local.questionType ?? "all"}
            onValueChange={(v) => set("questionType", v ? (v as QuestionType) : null)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value={QuestionType.MCQ}>Trắc nghiệm</SelectItem>
              <SelectItem value={QuestionType.ESSAY}>Tự luận</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Mức độ</Label>
          <Select
            value={local.questionLevel ?? "all"}
            onValueChange={(v) => set("questionLevel", v ? (v as QuestionLevel) : null)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value={QuestionLevel.EASY}>Dễ</SelectItem>
              <SelectItem value={QuestionLevel.MEDIUM}>Trung bình</SelectItem>
              <SelectItem value={QuestionLevel.HARD}>Khó</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => {
            setLocal(EMPTY_FILTERS);
            onChange(EMPTY_FILTERS);
          }}
        >
          Xoá bộ lọc
        </Button>
        <Button
          size="sm"
          className="flex-1"
          disabled={!canApply}
          onClick={() => {
            if (!canApply) return;
            onChange(local);
            onClose();
          }}
        >
          Áp dụng
          {backendFilterCount > 0 && (
            <Badge className="ml-1.5 h-4 px-1 text-[10px] bg-white text-primary">{backendFilterCount}</Badge>
          )}
        </Button>
      </div>
    </div>
  );
}
