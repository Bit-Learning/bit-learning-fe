import { CheckCircle2Icon, ChevronDown, FileText, HelpCircle, Lock, PlayCircle, Video } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import type { LectureDetail } from "../types/lecture.type";
import type { SectionDetail } from "../types/section.type";

interface CourseSidebarProps {
  lectureId: number;
  sections?: SectionDetail[];
  onNavigate: (lectureId: number) => void;
  completedLectures?: number[];
  lectureProgress?: Record<number, number>;
  hasAccess?: boolean;
}

const COMPLETION_THRESHOLD = 90;

const formatDuration = (seconds?: number) => {
  if (!seconds) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h} giờ ${m} phút`;
  return `${m} phút`;
};

const CourseSidebar: React.FC<CourseSidebarProps> = ({
  lectureId,
  sections,
  onNavigate,
  completedLectures = [],
  lectureProgress = {},
  hasAccess = false,
}) => {
  const [expandedSections, setExpandedSections] = useState<number[]>([]);

  const toggleSection = (sectionId: number) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId],
    );
  };

  useEffect(() => {
    if (sections) {
      for (const section of sections) {
        const hasCurrentLecture = section.lectures?.some((l) => l.id === lectureId);
        if (hasCurrentLecture && !expandedSections.includes(section.id)) {
          setExpandedSections((prev) => [...prev, section.id]);
          break;
        }
      }
    }
  }, [lectureId, sections]);

  const isLectureCompleted = (id: number) =>
    completedLectures.includes(id) || (lectureProgress[id] ?? 0) >= COMPLETION_THRESHOLD;

  const getLectureTypeIcon = (lecture: LectureDetail, isActive: boolean, isCompleted: boolean, isLocked: boolean) => {
    const baseClass = "h-4 w-4 shrink-0";

    if (isCompleted) {
      return (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-green-500">
          <CheckCircle2Icon className={`${baseClass} text-white`} />
        </span>
      );
    }
    if (isLocked) return <Lock className={`${baseClass} text-gray-500`} />;

    switch (lecture.type) {
      case "VIDEO":
        return (
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${isActive ? "bg-blue-500" : "bg-blue-900/60"}`}
          >
            <PlayCircle className={`${baseClass} ${isActive ? "text-white" : "text-blue-300"}`} />
          </span>
        );
      case "TEXT":
        return (
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${isActive ? "bg-green-500" : "bg-green-900/60"}`}
          >
            <FileText className={`${baseClass} ${isActive ? "text-white" : "text-green-300"}`} />
          </span>
        );
      case "QUIZ":
        return (
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${isActive ? "bg-yellow-500" : "bg-yellow-900/60"}`}
          >
            <HelpCircle className={`${baseClass} ${isActive ? "text-white" : "text-yellow-300"}`} />
          </span>
        );
      default:
        return <Video className={`${baseClass} text-gray-400`} />;
    }
  };

  return (
    <div className="flex h-full w-100 shrink-0 flex-col overflow-hidden border-r border-gray-800 bg-[#1a1f2e]">
      <div className="flex-1 overflow-y-auto">
        {sections?.map((section, sectionIndex) => {
          const completedCount = section.lectures?.filter((l) => isLectureCompleted(l.id)).length || 0;
          const totalCount = section.lectures?.length || 0;
          const totalSeconds = section.totalDuration || 0;
          const durationLabel = formatDuration(totalSeconds);
          const isExpanded = expandedSections.includes(section.id);

          return (
            <div key={sectionIndex} className="border-b border-gray-800/60">
              <button
                onClick={() => toggleSection(section.id)}
                className="cursor-pointer flex w-full items-start justify-between px-4 py-3 text-left hover:bg-white/5"
              >
                <div className="flex-1 pr-2">
                  <p className="text-sm font-semibold text-white">{section.title}</p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {completedCount}/{totalCount}
                    {durationLabel && ` • ${durationLabel}`}
                  </p>
                  {totalCount > 0 && (
                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-gray-700">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${Math.round((completedCount / totalCount) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>
                <ChevronDown
                  className={`mt-0.5 h-4 w-4 shrink-0 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                />
              </button>

              {isExpanded && (
                <div>
                  {section.lectures?.map((lecture) => {
                    const isActive = lecture.id === lectureId;
                    const isLocked = !hasAccess && !lecture.isPreviewable;
                    const isCompleted = isLectureCompleted(lecture.id);
                    const duration = (lecture as any).duration;

                    return (
                      <button
                        key={lecture.id}
                        onClick={() => !isLocked && onNavigate(lecture.id)}
                        disabled={isLocked}
                        className={`cursor-pointer flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                          isActive
                            ? "bg-blue-600/20 border-l-2 border-blue-500"
                            : isLocked
                              ? "cursor-not-allowed opacity-50"
                              : "hover:bg-white/5"
                        }`}
                      >
                        <div className="mt-0.5">{getLectureTypeIcon(lecture, isActive, isCompleted, isLocked)}</div>

                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate text-sm leading-snug ${
                              isActive ? "font-medium text-white" : isCompleted ? "text-green-400" : "text-gray-300"
                            }`}
                          >
                            {lecture.title}
                          </p>
                          <div className="mt-0.5 flex items-center gap-2">
                            {duration && <span className="text-xs text-gray-500">{formatDuration(duration)}</span>}
                            {lecture.isPreviewable && !hasAccess && !isActive && (
                              <span className="rounded bg-green-900/60 px-1.5 py-0.5 text-[10px] font-medium text-green-400">
                                Xem trước
                              </span>
                            )}
                            {isLocked && <span className="text-xs text-gray-500">Cần đăng ký</span>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseSidebar;
