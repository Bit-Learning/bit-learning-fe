import { useNavigate } from "@tanstack/react-router";
import { Badge } from "@workspace/ui/components/Badge";
import { Button } from "@workspace/ui/components/Button";
import { Card } from "@workspace/ui/components/Card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/Form";
import { Input } from "@workspace/ui/components/Input";
import { Textarea } from "@workspace/ui/components/Textarea";
import {
  ArrowLeft,
  BookOpen,
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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCourseDetail } from "@/feature/course/queries/useCourse";
import { useSectionsByCourse } from "@/feature/lecture/queries/useSection";
import type { LectureDetail } from "@/feature/lecture/types/lecture.type";
import { useAppDispatch } from "@/shared/redux/store";
import { useValidateCourse } from "../queries/useCourse";
import { useDeleteLecture } from "../queries/useLecture";
import { useCreateSection, useDeleteSection } from "../queries/useSection";
import { setEditQuizContextAction } from "../stores/mlecture.store";
import type { SectionDetail } from "../types/msection.api";
import { CreateLectureModal } from "./CreateLectureModal";
import { DeleteConfirmModal, type DeleteItemType } from "./DeleteConfirmModal";
import { EditCourseModal } from "./EditCourseModal";
import { EditLectureModal } from "./EditLectureModal";
import { EditSectionModal } from "./EditSectionModal";
import { LectureDetailModal } from "./LectureDetailModal";

interface CourseDetailViewProps {
  courseId: number;
}

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

export const CourseDetailView = ({ courseId }: CourseDetailViewProps) => {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [modalState, setModalState] = useState<ModalState>({ type: "none" });
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({ type: "none" });

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { data: course, isLoading: courseLoading, refetch: refetchCourse } = useCourseDetail(courseId);
  const { data: sections, isLoading: sectionsLoading, refetch: refetchSections } = useSectionsByCourse(courseId);
  const createSectionMutation = useCreateSection();
  const deleteSectionMutation = useDeleteSection();
  const deleteLectureMutation = useDeleteLecture();

  const sectionForm = useForm<{ title: string; description: string }>({
    defaultValues: { title: "", description: "" },
  });

  const toggleSection = (sectionId: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) newExpanded.delete(sectionId);
    else newExpanded.add(sectionId);
    setExpandedSections(newExpanded);
  };

  const handleCreateSection = async (data: { title: string; description: string }) => {
    try {
      await createSectionMutation.mutateAsync({
        courseId,
        title: data.title,
        description: data.description,
        isPublished: true,
        orderIndex: (sections?.length || 0) + 1,
      });
      sectionForm.reset();
      setModalState({ type: "none" });
    } catch (error) {
      console.error("Failed to create section:", error);
    }
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
        refetchSections();
        closeDeleteModal();
      } catch (error) {
        console.error("Failed to delete lecture:", error);
      }
    }
  };

  const closeModal = () => {
    sectionForm.reset();
    setModalState({ type: "none" });
  };

  const handleViewLecture = (lecture: LectureDetail) => setModalState({ type: "view-lecture", lecture });

  const handleEditLecture = (lecture: LectureDetail) => {
    if (lecture.type === "QUIZ") {
      dispatch(
        setEditQuizContextAction({
          sectionId: lecture.sectionId,
          courseId,
          lectureId: lecture.id,
          orderIndex: lecture.orderIndex,
        }),
      );
      navigate({ to: "/mentor/course/quiz" });
    } else {
      setModalState({ type: "edit-lecture", lecture });
    }
  };

  const handleEditSection = (section: SectionDetail) => setModalState({ type: "edit-section", section });

  const handleEditFromView = () => {
    if (modalState.type === "view-lecture") {
      const lecture = modalState.lecture;
      if (lecture.type === "QUIZ") {
        dispatch(
          setEditQuizContextAction({
            sectionId: lecture.sectionId,
            courseId,
            lectureId: lecture.id,
            orderIndex: lecture.orderIndex,
          }),
        );
        navigate({ to: "/mentor/course/quiz" });
        closeModal();
      } else {
        setModalState({ type: "edit-lecture", lecture });
      }
    }
  };

  const handleSectionUpdated = () => refetchSections();
  const handleLectureUpdated = () => refetchSections();
  const handleCourseUpdated = () => refetchCourse();

  if (courseLoading) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
        <p className="mt-4 text-gray-600">Đang tải...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <Card className="p-12 text-center">
        <h3 className="text-xl font-semibold">Không tìm thấy khóa học</h3>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        size="lg"
        className="gap-2 border-gray-300 bg-white shadow-sm transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 hover:shadow-md"
        onClick={() => navigate({ to: "/mentor/course/list" })}
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Quay lại danh sách</span>
      </Button>

      <div className="mt-2 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="mt-1 text-gray-600">{course.subtitle}</p>
        </div>
        <div>
          <Button
            onClick={() => setModalState({ type: "edit-course" })}
            size="lg"
            className="bg-linear-to-r mr-3 gap-2 from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
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
              <Card key={section.id} className="overflow-hidden border-l-4 border-l-blue-500">
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
                      isDisabled={deleteSectionMutation.isPending}
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
                                Xem
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
                                isDisabled={deleteLectureMutation.isPending}
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

      {modalState.type === "add-section" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6">
            <h2 className="mb-4 text-xl font-bold">Thêm chương mới</h2>
            <Form {...sectionForm}>
              <form onSubmit={sectionForm.handleSubmit(handleCreateSection)} className="space-y-4">
                <FormField
                  control={sectionForm.control}
                  name="title"
                  rules={{
                    required: "Tên chương là bắt buộc",
                    maxLength: { value: 100, message: "Tối đa 100 ký tự" },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên chương *</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: Chương 1: Giới thiệu" autoFocus {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={sectionForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả</FormLabel>
                      <FormControl>
                        <Textarea rows={3} placeholder="Mô tả chương (tùy chọn)" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={closeModal}>
                    Hủy
                  </Button>
                  <Button type="submit" isDisabled={createSectionMutation.isPending}>
                    {createSectionMutation.isPending ? "Đang thêm..." : "Thêm chương"}
                  </Button>
                </div>
              </form>
            </Form>
          </Card>
        </div>
      )}

      {modalState.type === "create-lecture" && (
        <CreateLectureModal
          courseId={courseId}
          sectionId={modalState.sectionId}
          onClose={closeModal}
          existingLectures={sections?.find((s) => s.id === modalState.sectionId)?.lectures || []}
        />
      )}
      {modalState.type === "view-lecture" && (
        <LectureDetailModal lecture={modalState.lecture} onClose={closeModal} onEdit={handleEditFromView} />
      )}
      {modalState.type === "edit-lecture" && (
        <EditLectureModal lecture={modalState.lecture} onClose={closeModal} onSuccess={handleLectureUpdated} />
      )}
      {modalState.type === "edit-section" && (
        <EditSectionModal section={modalState.section} onClose={closeModal} onSuccess={handleSectionUpdated} />
      )}
      {modalState.type === "edit-course" && (
        <EditCourseModal course={course as any} onClose={closeModal} onSuccess={handleCourseUpdated} />
      )}

      <DeleteConfirmModal
        isOpen={deleteModal.type !== "none"}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        itemType={deleteModal.type === "none" ? "lecture" : (deleteModal.type as DeleteItemType)}
        itemName={deleteModal.type !== "none" ? deleteModal.name : undefined}
        isLoading={deleteSectionMutation.isPending || deleteLectureMutation.isPending}
      />
    </div>
  );
};
