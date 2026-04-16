import { useNavigate } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import { CheckCircle, ChevronLeft, ChevronRight, Edit, Lock } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSectionsByCourse } from "../queries/useSection";
import { LEARNING_KEYS, useMarkAsCompleted, useMultipleLecturesCompleted } from "../queries/useLearning";
import { LectureType } from "../types/lecture.type";
import { useCourseAccess } from "@/feature/course/queries/useEnroll";
import CourseSidebar from "./CourseSidebar";
import QuizPlayer from "./QuizPlayer";
import TextContent from "./TextContent";
import VideoPlayerWithNotes from "./VideoPlayerWithNotes";
import LectureQA from "./LectureQA";

interface LectureDetailLayoutProps {
  courseId: number;
  lectureId: number;
}

const LectureDetailLayout: React.FC<LectureDetailLayoutProps> = ({ courseId, lectureId }) => {
  const [lectureProgress, setLectureProgress] = useState<Record<number, number>>({});

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: enrollAccess = false } = useCourseAccess(courseId);
  const hasAccess = enrollAccess;
  const { mutate: markAsCompleted } = useMarkAsCompleted();

  const { data: sections, isLoading } = useSectionsByCourse(courseId);

  const lectureIdRef = useRef(lectureId);
  useEffect(() => {
    lectureIdRef.current = lectureId;
  }, [lectureId]);

  const allLectureIds = useMemo(() => {
    if (!sections) return [];
    return sections.flatMap((s) => s.lectures?.map((l) => l.id) || []);
  }, [sections]);

  const { completedIds: serverCompletedIds } = useMultipleLecturesCompleted(allLectureIds);

  const completedLectures = serverCompletedIds;

  const currentLecture = useMemo(() => {
    if (!sections) return null;
    for (const section of sections) {
      const lecture = section.lectures?.find((l) => l.id === lectureId);
      if (lecture) return { ...lecture, sectionTitle: section.title, sectionId: section.id };
    }
    return null;
  }, [sections, lectureId]);

  const allLectures = useMemo(() => {
    if (!sections) return [];
    return sections.flatMap((s) => s.lectures?.filter((l) => !l.isDeleted) || []);
  }, [sections]);

  const currentIndex = allLectures.findIndex((l) => l.id === lectureId);
  const previousLecture = currentIndex > 0 ? allLectures[currentIndex - 1] : null;
  const nextLecture = currentIndex < allLectures.length - 1 ? allLectures[currentIndex + 1] : null;

  const isCurrentLectureAccessible = useMemo(() => {
    if (!currentLecture) return false;
    return hasAccess || currentLecture.isPreviewable;
  }, [hasAccess, currentLecture]);

  const goToLecture = useCallback(
    (newLectureId: number) => {
      navigate({ to: "/lectures/$id", params: { id: String(newLectureId) } });
    },
    [navigate],
  );

  const handleVideoComplete = useCallback(() => {
    const currentLectureId = lectureIdRef.current;
    queryClient.invalidateQueries({
      queryKey: LEARNING_KEYS.isCompleted(currentLectureId),
    });
  }, [queryClient]);

  const handleProgressUpdate = useCallback((percent: number) => {
    const currentLectureId = lectureIdRef.current;
    setLectureProgress((prev) => {
      if (Math.abs((prev[currentLectureId] || 0) - percent) < 1) return prev;
      return { ...prev, [currentLectureId]: percent };
    });
  }, []);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.shiftKey && e.key === "ArrowLeft" && previousLecture) {
        if (hasAccess || previousLecture.isPreviewable) goToLecture(previousLecture.id);
      }
      if (e.shiftKey && e.key === "ArrowRight" && nextLecture) {
        if (hasAccess || nextLecture.isPreviewable) goToLecture(nextLecture.id);
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [previousLecture, nextLecture, goToLecture, hasAccess]);

  const currentSection = useMemo(() => {
    if (!sections || !currentLecture) return null;
    return sections.find((s) => s.id === (currentLecture as any).sectionId) ?? null;
  }, [sections, currentLecture]);

  const sectionLectures = useMemo(() => currentSection?.lectures?.filter((l) => !l.isDeleted) ?? [], [currentSection]);

  const currentSectionIndex = sectionLectures.findIndex((l) => l.id === lectureId);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1a1f2e]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-b-2 border-blue-500" />
          <p className="mt-3 text-sm text-gray-400">Đang tải bài học...</p>
        </div>
      </div>
    );
  }

  const isCompleted = completedLectures.includes(lectureId);
  const canAccessPrevious = previousLecture && (hasAccess || previousLecture.isPreviewable);
  const canAccessNext = nextLecture && (hasAccess || nextLecture.isPreviewable);

  return (
    <div className="flex h-screen flex-col bg-[#1a1f2e]">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-gray-800 bg-[#1a1f2e] px-4">
        <button
          type="button"
          onClick={() => navigate({ to: "/courses/$id", params: { id: String(courseId) } })}
          className="cursor-pointer flex items-center gap-2 text-gray-300 transition-colors hover:text-white"
        >
          <ChevronLeft className="h-6 w-6" />
          <span className="max-w-xs truncate text-md font-medium">{currentLecture?.title || ""}</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {sectionLectures.map((l) => {
              const globalIndex = allLectures.findIndex((al) => al.id === l.id);
              const isActive = l.id === lectureId;
              const canAccess = hasAccess || l.isPreviewable;
              return (
                <button
                  key={l.id}
                  onClick={() => canAccess && goToLecture(l.id)}
                  disabled={!canAccess}
                  className={`cursor-pointer flex h-8 w-8 items-center justify-center rounded text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : canAccess
                        ? "text-gray-400 hover:bg-white/10 hover:text-white"
                        : "cursor-not-allowed text-gray-600"
                  }`}
                >
                  {globalIndex + 1}
                </button>
              );
            })}
          </div>

          <div className="mx-1 h-5 w-px bg-gray-700" />

          <Button
            size="sm"
            onClick={() =>
              navigate({
                to: "/courses/$id",
                params: { id: String(courseId) },
              })
            }
            className="h-8 gap-1.5 bg-blue-600 px-3 text-xs text-white hover:bg-blue-700"
          >
            <Edit className="h-3.5 w-3.5" />
            Sửa bài
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <CourseSidebar
          lectureId={lectureId}
          sections={sections}
          onNavigate={goToLecture}
          completedLectures={completedLectures}
          lectureProgress={lectureProgress}
          hasAccess={hasAccess}
        />

        <div className="flex flex-1 flex-col overflow-hidden bg-white">
          <div className="flex-1 overflow-y-auto">
            {!isCurrentLectureAccessible ? (
              <div className="flex h-full items-center justify-center bg-gray-50">
                <div className="text-center">
                  <Lock className="mx-auto mb-4 h-14 w-14 text-gray-300" />
                  <h3 className="mb-2 text-lg font-semibold text-gray-800">Bài học bị khóa</h3>
                  <p className="mb-4 text-sm text-gray-500">Vui lòng đăng ký khóa học để xem bài học này</p>
                  <Button
                    className="bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => navigate({ to: "/courses/$id", params: { id: String(courseId) } })}
                  >
                    Xem thông tin khóa học
                  </Button>
                </div>
              </div>
            ) : currentLecture?.type === LectureType.VIDEO ? (
              <div>
                <div className="w-full bg-black h-150">
                  <VideoPlayerWithNotes
                    lectureId={lectureId}
                    hasAccess={hasAccess}
                    onComplete={handleVideoComplete}
                    onProgressUpdate={handleProgressUpdate}
                  />
                </div>
                {hasAccess && !isCompleted && (
                  <div className="flex justify-end px-6 pt-3">
                    <button
                      type="button"
                      onClick={() => markAsCompleted(lectureId, { onSuccess: handleVideoComplete })}
                      className="flex items-center gap-1.5 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Đánh dấu hoàn thành
                    </button>
                  </div>
                )}
                <div className="p-6">
                  <div className="mx-auto max-w-4xl">
                    <LectureQA lectureId={lectureId} />
                  </div>
                </div>
              </div>
            ) : currentLecture?.type === LectureType.QUIZ ? (
              <div>
                <QuizPlayer lectureId={lectureId} hasAccess={hasAccess} onComplete={handleVideoComplete} />
                <div className="p-6">
                  <div className="mx-auto max-w-4xl">
                    <LectureQA lectureId={lectureId} />
                  </div>
                </div>
              </div>
            ) : currentLecture?.type === LectureType.TEXT ? (
              <div>
                <TextContent lectureId={lectureId} onComplete={handleVideoComplete} />
                {hasAccess && !isCompleted && (
                  <div className="flex justify-end px-6 pb-2">
                    <button
                      type="button"
                      onClick={() => markAsCompleted(lectureId, { onSuccess: handleVideoComplete })}
                      className="flex items-center gap-1.5 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Đánh dấu hoàn thành
                    </button>
                  </div>
                )}
                <div className="border-t border-gray-200 p-6">
                  <div className="mx-auto max-w-4xl">
                    <LectureQA lectureId={lectureId} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                <p>Nội dung đang được cập nhật</p>
              </div>
            )}
          </div>

          <div className="shrink-0 flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3">
            <Button
              variant="outline"
              size="lg"
              isDisabled={!canAccessPrevious}
              onPress={() => previousLecture && goToLecture(previousLecture.id)}
              className="gap-1 border-gray-400 text-gray-700 hover:bg-blue-700 hover:text-white disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Bài học trước
            </Button>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              {isCompleted && (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Đã hoàn thành
                </span>
              )}
              {!hasAccess && currentLecture?.isPreviewable && (
                <span className="font-medium text-yellow-600">Học thử</span>
              )}
            </div>

            <Button
              variant="outline"
              size="lg"
              isDisabled={!canAccessNext}
              onPress={() => nextLecture && goToLecture(nextLecture.id)}
              className="gap-1 border-gray-400 text-gray-700 hover:bg-blue-700 hover:text-white disabled:opacity-40"
            >
              Bài tiếp theo
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LectureDetailLayout;
