import React, { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Edit,
  Eye,
  FileText,
  GripVertical,
  HelpCircle,
  Plus,
  Settings,
  Trash2,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCourseDetail, useValidateCourse } from "../queries/useCourse";
import { useDeleteLecture } from "../queries/useLecture";
import { useSectionsByCourse, useDeleteSection } from "../queries/useSection";
import type { LectureDetail, SectionDetail } from "../types/course.type";
import { LectureDetailModal } from "../components/LectureDetailModal";
import { EditCourseModal } from "../components/EditCourseModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import LectureModal from "../components/LectureModal";
import SectionModal from "../components/SectionModal";

type ModalState =
  | { type: "none" }
  | { type: "create-lecture"; sectionId: number }
  | { type: "view-lecture"; lecture: LectureDetail }
  | { type: "edit-lecture"; lecture: LectureDetail }
  | { type: "edit-section"; section: SectionDetail }
  | { type: "add-section" }
  | { type: "edit-course" };

type DeleteModalState =
  | { type: "none" }
  | { type: "section"; id: number; name: string }
  | { type: "lecture"; id: number; name: string };

export const CourseDetailPage: React.FC = () => {
  const { id } = useParams({ from: "/_authenticated/courses/$id" });
  const courseId = Number(id);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [modalState, setModalState] = useState<ModalState>({ type: "none" });
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({ type: "none" });

  const navigate = useNavigate();

  const { data: course, isLoading: courseLoading, refetch: refetchCourse } = useCourseDetail(courseId);
  const { data: sections, isLoading: sectionsLoading } = useSectionsByCourse(courseId);
  const deleteSectionMutation = useDeleteSection();
  const deleteLectureMutation = useDeleteLecture();
  const validateCourseMutation = useValidateCourse();

  const toggleSection = (sectionId: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) newExpanded.delete(sectionId);
    else newExpanded.add(sectionId);
    setExpandedSections(newExpanded);
  };

  const openDeleteSectionModal = (sectionId: number, sectionName: string) => {
    setDeleteModal({ type: "section", id: sectionId, name: sectionName });
  };

  const openDeleteLectureModal = (lectureId: number, lectureName: string) => {
    setDeleteModal({ type: "lecture", id: lectureId, name: lectureName });
  };

  const closeDeleteModal = () => setDeleteModal({ type: "none" });

  const handleConfirmDelete = async () => {
    if (deleteModal.type === "section") {
      try {
        await deleteSectionMutation.mutateAsync(deleteModal.id);
        closeDeleteModal();
      } catch (error) {
        console.error("Failed to delete section:", error);
      }
    } else if (deleteModal.type === "lecture") {
      try {
        await deleteLectureMutation.mutateAsync(deleteModal.id);
        closeDeleteModal();
      } catch (error) {
        console.error("Failed to delete lecture:", error);
      }
    }
  };

  const closeModal = () => setModalState({ type: "none" });

  const handleViewLecture = (lecture: LectureDetail) => setModalState({ type: "view-lecture", lecture });

  const handleEditLecture = (lecture: LectureDetail) => {
    if (lecture.type === "QUIZ") {
      navigate({
        to: "/courses/quiz",
        search: {
          mode: "edit",
          sectionId: lecture.sectionId,
          courseId,
          lectureId: lecture.id,
          orderIndex: lecture.orderIndex,
        },
      });
    } else {
      setModalState({ type: "edit-lecture", lecture });
    }
  };

  const handleEditSection = (section: SectionDetail) => setModalState({ type: "edit-section", section });

  const handleEditFromView = () => {
    if (modalState.type === "view-lecture") {
      const lecture = modalState.lecture;
      if (lecture.type === "QUIZ") {
        navigate({
          to: "/courses/quiz",
          search: {
            mode: "edit",
            sectionId: lecture.sectionId,
            courseId,
            lectureId: lecture.id,
            orderIndex: lecture.orderIndex,
          },
        });
        closeModal();
      } else {
        setModalState({ type: "edit-lecture", lecture });
      }
    }
  };

  const handleTogglePublish = async () => {
    if (!course) return;
    try {
      await validateCourseMutation.mutateAsync({ id: courseId, isAccepted: course.status !== "PUBLISHED" });
      refetchCourse();
    } catch (error) {
      console.error("Failed to toggle publish status:", error);
    }
  };

  if (courseLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <Card className="p-12 text-center">
          <h3 className="text-xl font-semibold">Không tìm thấy khóa học</h3>
        </Card>
      </div>
    );
  }

  const getDeleteModalProps = () => {
    if (deleteModal.type === "section") {
      return {
        title: "Xóa chương",
        description: "Tất cả bài học trong chương này cũng sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác!",
      };
    }
    if (deleteModal.type === "lecture") {
      return {
        title: "Xóa bài học",
        description: "Bài học này sẽ bị xóa vĩnh viễn khỏi khóa học. Hành động này không thể hoàn tác!",
      };
    }
    return { title: "Xóa", description: "" };
  };

  const deleteModalProps = getDeleteModalProps();
  const isPublished = course.status === "PUBLISHED";
  const canTogglePublish = ["PUBLISHED", "PENDING"].includes(course.status || "");

  return (
    <div className="min-h-screen space-y-4 p-8">
      <Button
        variant="outline"
        size="lg"
        className="gap-2 border-gray-300 bg-white shadow-sm transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
        onClick={() => navigate({ to: "/courses" })}
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Quay lại danh sách</span>
      </Button>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="mt-1 text-gray-600">{course.subtitle}</p>
          </div>
          {course.status && (
            <Badge variant={isPublished ? "default" : "secondary"} className="h-fit">
              {isPublished ? "Đã xuất bản" : "Chưa xuất bản"}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          {canTogglePublish && !isPublished && (
            <Button
              onClick={handleTogglePublish}
              size="lg"
              disabled={validateCourseMutation.isPending}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              {validateCourseMutation.isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Xuất bản
                </>
              )}
            </Button>
          )}
          <Button
            onClick={() => setModalState({ type: "edit-course" })}
            size="lg"
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Settings className="h-4 w-4" />
            Chỉnh sửa khóa học
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <p className="text-sm text-gray-600">Giá</p>
            <p className="text-xl font-bold text-blue-600">
              {course.price === 0 ? "Miễn phí" : `${course.price.toLocaleString("vi-VN")} ₫`}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Cấp độ</p>
            <p className="font-semibold">{course.level}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Khối lớp</p>
            <p className="font-semibold">Lớp {course.grade}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Ngôn ngữ</p>
            <p className="font-semibold">{course.language}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Nội dung khóa học</h2>
        </div>

        <div className="mb-4">
          <Button onClick={() => setModalState({ type: "add-section" })} variant="outline" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Thêm chương mới
          </Button>
        </div>

        <div className="space-y-3">
          {sectionsLoading ? (
            <p className="py-8 text-center text-gray-600">Đang tải chương...</p>
          ) : !sections || sections.length === 0 ? (
            <div className="py-8 text-center text-gray-600">
              <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <p className="mb-2 text-lg font-medium">Chưa có chương nào</p>
              <p className="text-sm">Hãy thêm chương đầu tiên để bắt đầu!</p>
            </div>
          ) : (
            sections.map((section, index) => (
              <Card key={section.id} className="overflow-hidden p-0 border-l-4 border-l-blue-500">
                <div
                  className="flex cursor-pointer items-center justify-between bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex flex-1 items-center gap-3">
                    <GripVertical className="h-5 w-5 cursor-move text-gray-400" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">
                          Chương {index + 1}: {section.title}
                        </h3>
                        <Badge variant={section.isPublished ? "secondary" : "default"}>
                          {section.isPublished ? "Công khai" : "Riêng tư"}
                        </Badge>
                      </div>
                      {section.description && <p className="mt-1 text-sm text-gray-600">{section.description}</p>}
                      <p className="mt-2 text-xs text-gray-500">{section.lectures?.length || 0} bài học</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditSection(section as SectionDetail);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteSectionModal(section.id, section.title);
                      }}
                      disabled={deleteSectionMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                    {expandedSections.has(section.id) ? (
                      <ChevronUp className="h-5 w-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                </div>

                {expandedSections.has(section.id) && (
                  <div className="space-y-3 border-t bg-white p-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setModalState({ type: "create-lecture", sectionId: section.id })}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Thêm bài học
                    </Button>

                    {!section.lectures || section.lectures.length === 0 ? (
                      <p className="py-6 text-center text-sm text-gray-500">
                        Chưa có bài học nào. Click "Thêm bài học" để bắt đầu.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {section.lectures.map((lecture, lIdx) => (
                          <div
                            key={lecture.id}
                            className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                          >
                            <div className="flex items-center gap-3">
                              {lecture.type === "VIDEO" ? (
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                                  <Video className="h-5 w-5 text-blue-600" />
                                </div>
                              ) : lecture.type === "TEXT" ? (
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                                  <FileText className="h-5 w-5 text-green-600" />
                                </div>
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                                  <HelpCircle className="h-5 w-5 text-purple-600" />
                                </div>
                              )}
                              <div className="flex-1">
                                <p className="font-medium">
                                  Bài {lIdx + 1}: {lecture.title}
                                </p>
                                {lecture.description && (
                                  <p className="mt-0.5 text-sm text-gray-600">{lecture.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewLecture(lecture as LectureDetail)}
                              >
                                <Eye className="mr-1 h-4 w-4" />
                                <span className="hidden sm:inline">Xem</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditLecture(lecture as LectureDetail)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDeleteLectureModal(lecture.id, lecture.title)}
                                disabled={deleteLectureMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </Card>

      {modalState.type === "add-section" && <SectionModal mode="create" courseId={courseId} onClose={closeModal} />}

      {modalState.type === "create-lecture" && (
        <LectureModal
          mode="create"
          courseId={courseId}
          sectionId={modalState.sectionId}
          existingLectures={sections?.find((s) => s.id === modalState.sectionId)?.lectures || []}
          onClose={closeModal}
        />
      )}

      {modalState.type === "view-lecture" && (
        <LectureDetailModal lecture={modalState.lecture} onClose={closeModal} onEdit={handleEditFromView} />
      )}

      {modalState.type === "edit-lecture" && (
        <LectureModal mode="edit" lecture={modalState.lecture} onClose={closeModal} />
      )}

      {modalState.type === "edit-section" && (
        <SectionModal mode="edit" section={modalState.section} courseId={courseId} onClose={closeModal} />
      )}

      {modalState.type === "edit-course" && (
        <EditCourseModal course={course} onClose={closeModal} onSuccess={refetchCourse} />
      )}

      <DeleteConfirmModal
        open={deleteModal.type !== "none"}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title={deleteModalProps.title}
        description={deleteModalProps.description}
        itemName={deleteModal.type !== "none" ? deleteModal.name : undefined}
        isPending={deleteSectionMutation.isPending || deleteLectureMutation.isPending}
      />
    </div>
  );
};
