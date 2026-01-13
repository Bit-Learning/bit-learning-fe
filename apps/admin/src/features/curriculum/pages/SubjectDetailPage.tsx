import { useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { Plus, BookOpen, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubjectDetail } from "../queries/useSubject";
import { useChaptersBySubject, useDeleteChapter } from "../queries/useChapter";
import { useDeleteLesson } from "../queries/useLesson";
import ChapterItem from "../components/ChapterItem";
import ChapterFormModal from "../components/ChapterFormModal";
import LessonFormModal from "../components/LessonFormModal";
import DeleteConfirmModal from "../../../components/DeleteConfirmModal";
import type { TChapterResponse } from "../types/chapter.type";
import type { TLessonResponse } from "../types/lesson.type";

const SubjectDetailPage: React.FC = () => {
  const { id: subjectId } = useParams({ from: "/_authenticated/subject/$id" });
  const navigate = useNavigate();
  const id = parseInt(subjectId);

  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [chapterModal, setChapterModal] = useState<{ open: boolean; data?: TChapterResponse | null }>({ open: false });
  const [lessonModal, setLessonModal] = useState<{ open: boolean; data?: TLessonResponse | null; chapterId: number }>({
    open: false,
    chapterId: 0,
  });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; type: "chapter" | "lesson"; item: any }>({
    open: false,
    type: "chapter",
    item: null,
  });

  const { data: subject, isLoading: loadingSubject } = useSubjectDetail(id);
  const { data: chapters, isLoading: loadingChapters } = useChaptersBySubject(id);
  const { mutate: deleteChapter, isPending: deletingChapter } = useDeleteChapter();
  const { mutate: deleteLesson, isPending: deletingLesson } = useDeleteLesson();

  const sortedChapters = chapters?.sort((a, b) => a.chapterNo - b.chapterNo) || [];
  const nextChapterNo = (chapters?.length || 0) + 1;
  const totalLessons = chapters?.reduce((acc, c) => acc + (c.lessons?.length || 0), 0) || 0;

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleDelete = () => {
    if (deleteModal.type === "chapter") {
      deleteChapter(deleteModal.item.id, { onSuccess: () => setDeleteModal({ ...deleteModal, open: false }) });
    } else {
      deleteLesson(deleteModal.item.id, { onSuccess: () => setDeleteModal({ ...deleteModal, open: false }) });
    }
  };

  if (loadingSubject) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Không tìm thấy môn học</p>
            <Button className="mt-4" variant="outline" onClick={() => navigate({ to: "/curriculum" })}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate({ to: "/curriculum" })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{subject.name}</h1>
              <Badge variant="secondary">{subject.code}</Badge>
              <Badge variant="outline">Lớp {subject.classLevel}</Badge>
            </div>
            {subject.curriculum && <p className="text-muted-foreground">Chương trình: {subject.curriculum.name}</p>}
            {subject.description && <p className="text-sm text-muted-foreground mt-1">{subject.description}</p>}
          </div>
          <Button onClick={() => setChapterModal({ open: true })}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm chương
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{chapters?.length || 0}</div>
            <p className="text-sm text-muted-foreground">Chương</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{totalLessons}</div>
            <p className="text-sm text-muted-foreground">Bài học</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Danh sách chương
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingChapters ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !sortedChapters.length ? (
            <div className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Chưa có chương nào</p>
              <Button className="mt-4" onClick={() => setChapterModal({ open: true })}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo chương đầu tiên
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedChapters.map((chapter) => (
                <ChapterItem
                  key={chapter.id}
                  chapter={chapter}
                  isExpanded={expandedIds.includes(chapter.id)}
                  onToggle={() => toggleExpand(chapter.id)}
                  onEdit={() => setChapterModal({ open: true, data: chapter })}
                  onDelete={() => setDeleteModal({ open: true, type: "chapter", item: chapter })}
                  onAddLesson={() => setLessonModal({ open: true, chapterId: chapter.id })}
                  onEditLesson={(lesson) => setLessonModal({ open: true, data: lesson, chapterId: chapter.id })}
                  onDeleteLesson={(lesson) => setDeleteModal({ open: true, type: "lesson", item: lesson })}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ChapterFormModal
        open={chapterModal.open}
        onClose={() => setChapterModal({ open: false })}
        data={chapterModal.data}
        subjectId={id}
        nextChapterNo={nextChapterNo}
      />

      <LessonFormModal
        open={lessonModal.open}
        onClose={() => setLessonModal({ open: false, chapterId: 0 })}
        data={lessonModal.data}
        chapterId={lessonModal.chapterId}
      />

      <DeleteConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ ...deleteModal, open: false })}
        onConfirm={handleDelete}
        itemName={deleteModal.item?.name}
        isPending={deletingChapter || deletingLesson}
      />
    </div>
  );
};

export default SubjectDetailPage;
