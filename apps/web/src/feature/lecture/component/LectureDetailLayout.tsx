import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import { CheckCircle, ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useSectionsByCourse } from "../queries/useSection";
import { LectureType } from "../types/lecture.type";
import CourseSidebar from "./CourseSidebar";
import QuizPlayer from "./QuizPlayer";
import TextContent from "./TextContent";
import VideoPlayerWithNotes from "./VideoPlayerWithNotes";

interface LectureDetailLayoutProps {
  courseId: number;
  lectureId: number;
}

const LectureDetailLayout: React.FC<LectureDetailLayoutProps> = ({ courseId, lectureId }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [completedLectures, setCompletedLectures] = useState<number[]>([]);
  const [lectureProgress, setLectureProgress] = useState<Record<number, number>>({});

  const navigate = useNavigate();
  const { data: sections, isLoading } = useSectionsByCourse(courseId);

  // Use ref to store lectureId for callbacks
  const lectureIdRef = useRef(lectureId);
  useEffect(() => {
    lectureIdRef.current = lectureId;
  }, [lectureId]);

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

  const goToLecture = useCallback(
    (newLectureId: number) => {
      navigate({ to: "/lectures/$id", params: { id: String(newLectureId) } });
    },
    [navigate]
  );

  // FIXED: Use ref inside callback to get current lectureId
  const handleVideoComplete = useCallback(() => {
    const currentLectureId = lectureIdRef.current;
    setCompletedLectures((prev) => {
      if (prev.includes(currentLectureId)) return prev;
      return [...prev, currentLectureId];
    });
  }, []);

  // FIXED: Use ref inside callback to get current lectureId
  const handleProgressUpdate = useCallback((percent: number) => {
    const currentLectureId = lectureIdRef.current;
    setLectureProgress((prev) => {
      // Only update if changed significantly
      if (Math.abs((prev[currentLectureId] || 0) - percent) < 1) {
        return prev;
      }
      return { ...prev, [currentLectureId]: percent };
    });
  }, []);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case "ArrowLeft":
          if (e.shiftKey && previousLecture) goToLecture(previousLecture.id);
          break;
        case "ArrowRight":
          if (e.shiftKey && nextLecture) goToLecture(nextLecture.id);
          break;
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [previousLecture, nextLecture, goToLecture]);

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

  const isCompleted = completedLectures.includes(lectureId);

  return (
    <div className="flex h-screen flex-col bg-gray-900">
      <header className="flex items-center justify-between border-b border-gray-800 bg-gray-950 px-4 py-3">
        <div className="flex items-center gap-4">
          <Link
            to="/courses/$id"
            params={{ id: String(courseId) }}
            className="text-gray-400 transition-colors hover:text-white"
          >
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <div className="max-w-md">
            <p className="truncate text-xs text-gray-500">{currentLecture?.sectionTitle}</p>
            <h1 className="truncate text-sm font-semibold text-white">{currentLecture?.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
        <div className="flex flex-1 flex-col">
          <div className="flex-1 bg-black">
            {currentLecture?.type === LectureType.VIDEO ? (
              <VideoPlayerWithNotes
                lectureId={lectureId}
                onComplete={handleVideoComplete}
                onProgressUpdate={handleProgressUpdate}
              />
            ) : currentLecture?.type === LectureType.QUIZ ? (
              <QuizPlayer lectureId={lectureId} />
            ) : currentLecture?.type === LectureType.TEXT ? (
              <TextContent lectureId={lectureId} />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                <p>Nội dung đang được cập nhật</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-gray-800 bg-gray-950 px-4 py-3">
            <Button
              variant="outline"
              size="sm"
              isDisabled={!previousLecture}
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
              isDisabled={!nextLecture}
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
        />
      </div>
    </div>
  );
};

export default LectureDetailLayout;
