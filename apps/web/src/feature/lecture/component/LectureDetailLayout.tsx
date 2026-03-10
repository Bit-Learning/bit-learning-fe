import { useNavigate } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import { CheckCircle, ChevronLeft, ChevronRight, Lock, Menu, X } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useSectionsByCourse } from "../queries/useSection";
import { useMultipleLecturesCompleted, LEARNING_KEYS } from "../queries/useLearning";
import { useQueryClient } from "@tanstack/react-query";
import { LectureType } from "../types/lecture.type";
import CourseSidebar from "./CourseSidebar";
import QuizPlayer from "./QuizPlayer";
import TextContent from "./TextContent";
import VideoPlayerWithNotes from "./VideoPlayerWithNotes";
import LectureQA from "./LectureQA";
import { useCourseAccess } from "@/feature/course/queries/useEnroll";
import { useCourseDetail } from "@/feature/course/queries/useCourse";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";

interface LectureDetailLayoutProps {
  courseId: number;
  lectureId: number;
}

const LectureDetailLayout: React.FC<LectureDetailLayoutProps> = ({ courseId, lectureId }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [localCompletedLectures, setLocalCompletedLectures] = useState<number[]>([]);
  const [lectureProgress, setLectureProgress] = useState<Record<number, number>>({});

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { userInfo } = useSelector(selectAuthStateInfo);
  const { data: course } = useCourseDetail(courseId);
  const isOwner = !!userInfo && !!course && course.instructorId === userInfo.id;

  const { data: enrollAccess = false } = useCourseAccess(courseId);
  const hasAccess = isOwner || enrollAccess;

  const { data: sections, isLoading } = useSectionsByCourse(courseId);

  const lectureIdRef = useRef(lectureId);
  useEffect(() => {
    lectureIdRef.current = lectureId;
  }, [lectureId]);

  const allLectureIds = useMemo(() => {
    if (!sections || isOwner) return [];
    return sections.flatMap((s) => s.lectures?.map((l) => l.id) || []);
  }, [sections, isOwner]);

  const { completedIds: serverCompletedIds } = useMultipleLecturesCompleted(allLectureIds);

  const completedLectures = useMemo(() => {
    if (isOwner) return [];
    return [...new Set([...serverCompletedIds, ...localCompletedLectures])];
  }, [isOwner, serverCompletedIds, localCompletedLectures]);

  const currentLecture = useMemo(() => {
    if (!sections) return null;
    for (const section of sections) {
      const lecture = section.lectures?.find((l) => l.id === lectureId);
      if (lecture)
        return {
          ...lecture,
          sectionTitle: section.title,
          sectionId: section.id,
        };
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
    if (isOwner) return true;
    return hasAccess || currentLecture.isPreviewable;
  }, [isOwner, hasAccess, currentLecture]);

  const goToLecture = useCallback(
    (newLectureId: number) => {
      navigate({ to: "/lectures/$id", params: { id: String(newLectureId) } });
    },
    [navigate],
  );

  const handleVideoComplete = useCallback(() => {
    if (isOwner) return;
    const currentLectureId = lectureIdRef.current;
    setLocalCompletedLectures((prev) => {
      if (prev.includes(currentLectureId)) return prev;
      return [...prev, currentLectureId];
    });
    queryClient.setQueryData(LEARNING_KEYS.isCompleted(currentLectureId), true);
  }, [isOwner, queryClient]);

  const handleProgressUpdate = useCallback(
    (percent: number) => {
      if (isOwner) return;
      const currentLectureId = lectureIdRef.current;
      setLectureProgress((prev) => {
        if (Math.abs((prev[currentLectureId] || 0) - percent) < 1) return prev;
        return { ...prev, [currentLectureId]: percent };
      });
    },
    [isOwner],
  );

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case "ArrowLeft":
          if (e.shiftKey && previousLecture) {
            const canAccessPrev = isOwner || hasAccess || previousLecture.isPreviewable;
            if (canAccessPrev) goToLecture(previousLecture.id);
          }
          break;
        case "ArrowRight":
          if (e.shiftKey && nextLecture) {
            const canAccessNext = isOwner || hasAccess || nextLecture.isPreviewable;
            if (canAccessNext) goToLecture(nextLecture.id);
          }
          break;
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [previousLecture, nextLecture, goToLecture, hasAccess, isOwner]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500" />
          <p className="mt-4 text-gray-400">Đang tải bài học...</p>
        </div>
      </div>
    );
  }

  const isCompleted = !isOwner && completedLectures.includes(lectureId);
  const canAccessPrevious = previousLecture && (isOwner || hasAccess || previousLecture.isPreviewable);
  const canAccessNext = nextLecture && (isOwner || hasAccess || nextLecture.isPreviewable);

  return (
    <div className="flex h-screen flex-col bg-gray-900">
      <header className="flex items-center justify-between border-b border-gray-800 bg-gray-950 px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="cursor-pointer text-gray-400 transition-colors hover:text-white"
            onClick={() => navigate({ to: "/courses/$id", params: { id: String(courseId) } })}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="max-w-md">
            <p className="truncate text-xs text-gray-500">{currentLecture?.sectionTitle}</p>
            <h1 className="truncate text-sm font-semibold text-white">{currentLecture?.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOwner && (
            <span className="rounded-md font-bold bg-blue-900/50 px-3 py-1 text-lg text-blue-400">Giảng viên</span>
          )}
          {!hasAccess && currentLecture?.isPreviewable && (
            <span className="text-lg font-bold text-yellow-400">Học thử</span>
          )}
          {isCompleted && (
            <span className="flex items-center gap-1 text-sm text-green-400">
              <CheckCircle className="h-4 w-4" />
              Đã hoàn thành
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onPress={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-400 hover:text-white lg:hidden"
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="shrink-0 bg-black">
            {!isCurrentLectureAccessible ? (
              <div className="flex aspect-video w-full items-center justify-center bg-gray-800">
                <div className="text-center">
                  <Lock className="mx-auto mb-4 h-16 w-16 text-gray-500" />
                  <h3 className="mb-2 text-xl font-semibold text-white">Bài học bị khóa</h3>
                  <p className="mb-4 text-gray-400">Vui lòng đăng ký khóa học để xem bài học này</p>
                  <Button
                    className="bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => navigate({ to: "/courses/$id", params: { id: String(courseId) } })}
                  >
                    Xem thông tin khóa học
                  </Button>
                </div>
              </div>
            ) : currentLecture?.type === LectureType.VIDEO ? (
              <div className="aspect-video w-full">
                <VideoPlayerWithNotes
                  lectureId={lectureId}
                  onComplete={handleVideoComplete}
                  onProgressUpdate={handleProgressUpdate}
                />
              </div>
            ) : currentLecture?.type === LectureType.QUIZ ? (
              <QuizPlayer lectureId={lectureId} isOwner={isOwner} onComplete={handleVideoComplete} />
            ) : currentLecture?.type === LectureType.TEXT ? (
              <TextContent lectureId={lectureId} isOwner={isOwner} onComplete={handleVideoComplete} />
            ) : (
              <div className="flex h-96 items-center justify-center text-gray-400">
                <p>Nội dung đang được cập nhật</p>
              </div>
            )}
          </div>

          {isCurrentLectureAccessible && (
            <div className="bg-gray-50 p-6">
              <div className="mx-auto max-w-4xl">
                <LectureQA lectureId={lectureId} />
              </div>
            </div>
          )}

          <div className="sticky bottom-0 flex items-center justify-between border-t border-gray-800 bg-gray-950 px-4 py-3">
            <Button
              variant="outline"
              size="sm"
              isDisabled={!canAccessPrevious}
              onPress={() => previousLecture && goToLecture(previousLecture.id)}
              className="border-gray-700 bg-gray-800/50 text-white hover:bg-gray-700"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">Bài trước</span>
            </Button>

            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>{currentIndex + 1}</span>
              <span>/</span>
              <span>{allLectures.length}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              isDisabled={!canAccessNext}
              onPress={() => nextLecture && goToLecture(nextLecture.id)}
              className="border-gray-700 bg-gray-800/50 text-white hover:bg-gray-700"
            >
              <span className="hidden sm:inline">Bài tiếp</span>
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>

        <CourseSidebar
          lectureId={lectureId}
          sections={sections}
          isOpen={isSidebarOpen}
          onNavigate={goToLecture}
          completedLectures={completedLectures}
          lectureProgress={lectureProgress}
          hasAccess={hasAccess}
        />
      </div>
    </div>
  );
};

export default LectureDetailLayout;
