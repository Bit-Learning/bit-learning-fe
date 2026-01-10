import { ChevronDown, ChevronRight, Plus, Pencil, Trash2, Book, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import type { TCurriculumResponse } from "../types/curriculum.type";
import type { TSubjectResponse } from "../types/subject.type";

interface Props {
  curriculum: TCurriculumResponse;
  subjects: TSubjectResponse[];
  isExpanded: boolean;
  isLoading?: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddSubject: () => void;
  onEditSubject: (subject: TSubjectResponse) => void;
  onDeleteSubject: (subject: TSubjectResponse) => void;
  onSubjectClick: (subject: TSubjectResponse) => void;
}

const CurriculumItem: React.FC<Props> = ({
  curriculum,
  subjects,
  isExpanded,
  isLoading,
  onToggle,
  onEdit,
  onDelete,
  onAddSubject,
  onEditSubject,
  onDeleteSubject,
  onSubjectClick,
}) => {
  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4">
            <CollapsibleTrigger asChild>
              <div className="flex items-center gap-3 cursor-pointer flex-1">
                {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                <div className="p-2 rounded-lg bg-primary/10">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{curriculum.name}</h3>
                    <Badge variant="secondary">{curriculum.code}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {subjects.length} môn học
                    {curriculum.description && ` • ${curriculum.description}`}
                  </p>
                </div>
              </div>
            </CollapsibleTrigger>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onAddSubject}>
                <Plus className="h-4 w-4 mr-1" />
                Thêm môn
              </Button>
              <Button variant="ghost" size="icon" onClick={onEdit}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-destructive" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <CollapsibleContent>
            <div className="border-t px-4 py-3 bg-muted/30">
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : !subjects.length ? (
                <p className="text-sm text-muted-foreground text-center py-4">Chưa có môn học nào</p>
              ) : (
                <div className="space-y-2">
                  {subjects.map((subject) => (
                    <div
                      key={subject.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-background border hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => onSubjectClick(subject)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded bg-blue-100 dark:bg-blue-900">
                          <Book className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{subject.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {subject.code}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">Lớp {subject.classLevel}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditSubject(subject);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSubject(subject);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  );
};

export default CurriculumItem;
