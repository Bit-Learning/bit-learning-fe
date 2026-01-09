import { useState } from "react";
import { Plus, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import CurriculumItem from "../components/CurriculumItem";
import CurriculumFormModal from "../components/CurriculumFormModal";
import SubjectFormModal from "../components/SubjectFormModal";
import type { TCurriculumResponse } from "../types/curriculum.type";
import type { TSubjectResponse } from "../types/subject.type";
import { useCurriculumsList } from "../queries/useCurriculum";
import { useSubjectsList } from "../queries/useSubject";

const CurriculumListPage: React.FC = () => {
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [curriculumModal, setCurriculumModal] = useState<{ open: boolean; data?: TCurriculumResponse | null }>({
    open: false,
  });
  const [subjectModal, setSubjectModal] = useState<{
    open: boolean;
    data?: TSubjectResponse | null;
    curriculumId: number;
  }>({ open: false, curriculumId: 0 });

  const { data: curriculums, isLoading: loadingCurriculums } = useCurriculumsList();
  const { data: subjects, isLoading: loadingSubjects } = useSubjectsList();

  const getSubjectsByCurriculum = (curriculumId: number) =>
    subjects?.filter((s) => s.curriculum?.id === curriculumId) || [];

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  if (loadingCurriculums) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quản lý chương trình học</h1>
          <p className="text-muted-foreground">Quản lý các chương trình học và môn học</p>
        </div>
        <Button onClick={() => setCurriculumModal({ open: true })}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm chương trình
        </Button>
      </div>

      {!curriculums?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Chưa có chương trình học nào</p>
            <Button className="mt-4" onClick={() => setCurriculumModal({ open: true })}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo chương trình đầu tiên
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {curriculums.map((curriculum) => (
            <CurriculumItem
              key={curriculum.id}
              curriculum={curriculum}
              subjects={getSubjectsByCurriculum(curriculum.id)}
              isExpanded={expandedIds.includes(curriculum.id)}
              isLoading={loadingSubjects}
              onToggle={() => toggleExpand(curriculum.id)}
              onEdit={() => setCurriculumModal({ open: true, data: curriculum })}
              onAddSubject={() => setSubjectModal({ open: true, curriculumId: curriculum.id })}
              onEditSubject={(subject) => setSubjectModal({ open: true, data: subject, curriculumId: curriculum.id })}
            />
          ))}
        </div>
      )}

      <CurriculumFormModal
        open={curriculumModal.open}
        onClose={() => setCurriculumModal({ open: false })}
        data={curriculumModal.data}
      />

      <SubjectFormModal
        open={subjectModal.open}
        onClose={() => setSubjectModal({ open: false, curriculumId: 0 })}
        data={subjectModal.data}
        curriculumId={subjectModal.curriculumId}
      />
    </div>
  );
};

export default CurriculumListPage;
