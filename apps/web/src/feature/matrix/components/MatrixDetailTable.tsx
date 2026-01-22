import { Plus, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@workspace/ui/components/Button";
import { Input } from "@workspace/ui/components/Input";
import { Card } from "@workspace/ui/components/Card";
import type { TMatrixDetailRequest } from "../types/matrix.type";
import { useLessons } from "../queries/useLesson";
import { TLessonBriefResponse } from "../types/lesson.type";

interface Props {
  value: TMatrixDetailRequest[];
  onChange: (value: TMatrixDetailRequest[]) => void;
  targetTotalScore: number;
}

const emptyDetail: TMatrixDetailRequest = {
  lessonId: 0,
  easyMCQ: 0,
  mediumMCQ: 0,
  hardMCQ: 0,
  easyEssay: 0,
  mediumEssay: 0,
  hardEssay: 0,
  easyMCQScore: 0.25,
  mediumMCQScore: 0.5,
  hardMCQScore: 1,
  easyEssayScore: 1,
  mediumEssayScore: 2,
  hardEssayScore: 3,
};

const MatrixDetailTable: React.FC<Props> = ({ value, onChange, targetTotalScore }) => {
  const { data: lessons } = useLessons();
  const addRow = () => onChange([...value, { ...emptyDetail }]);

  const removeRow = (index: number) => onChange(value.filter((_, i) => i !== index));

  const updateRow = (index: number, field: keyof TMatrixDetailRequest, val: number) => {
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: val } as TMatrixDetailRequest;
    onChange(updated);
  };

  const calculateRowScore = (row: TMatrixDetailRequest) => {
    return (
      row.easyMCQ * row.easyMCQScore +
      row.mediumMCQ * row.mediumMCQScore +
      row.hardMCQ * row.hardMCQScore +
      row.easyEssay * row.easyEssayScore +
      row.mediumEssay * row.mediumEssayScore +
      row.hardEssay * row.hardEssayScore
    );
  };

  const totalScore = value.reduce((sum, row) => sum + calculateRowScore(row), 0);
  const isScoreMatch = Math.abs(totalScore - targetTotalScore) < 0.01;

  return (
    <div className="space-y-4">
      <div
        className={`flex items-center justify-between p-3 rounded-lg ${
          isScoreMatch ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        }`}
      >
        <div className="flex items-center gap-2">
          {isScoreMatch ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>
            Tổng điểm: <strong>{totalScore.toFixed(2)}</strong> / {targetTotalScore}
          </span>
        </div>
        <Button variant="outline" size="sm" onPress={addRow}>
          <Plus className="h-4 w-4 mr-1" />
          Thêm dòng
        </Button>
      </div>

      {value.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">Chưa có dữ liệu. Nhấn "Thêm dòng" để bắt đầu.</div>
      ) : (
        <div className="space-y-3">
          {value.map((row, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="text-sm font-medium">Lesson ID</label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={row.lessonId}
                      onChange={(e) => updateRow(i, "lessonId", Number(e.target.value))}
                    >
                      <option value="">-- Chọn Lesson --</option>

                      {lessons?.map((lesson: TLessonBriefResponse) => (
                        <option key={lesson.id} value={lesson.id}>
                          {lesson.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <span className="text-xs text-muted-foreground">Trắc nghiệm Dễ</span>
                      <Input
                        type="number"
                        min={0}
                        className="text-center"
                        value={row.easyMCQ}
                        onChange={(e) => updateRow(i, "easyMCQ", parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="text-center">
                      <span className="text-xs text-muted-foreground">Trắc nghiệm TB</span>
                      <Input
                        type="number"
                        min={0}
                        className="text-center"
                        value={row.mediumMCQ}
                        onChange={(e) => updateRow(i, "mediumMCQ", parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="text-center">
                      <span className="text-xs text-muted-foreground">Trắc nghiệm Khó</span>
                      <Input
                        type="number"
                        min={0}
                        className="text-center"
                        value={row.hardMCQ}
                        onChange={(e) => updateRow(i, "hardMCQ", parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <span className="text-xs text-muted-foreground">Tự luận Dễ</span>
                      <Input
                        type="number"
                        min={0}
                        className="text-center"
                        value={row.easyEssay}
                        onChange={(e) => updateRow(i, "easyEssay", parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="text-center">
                      <span className="text-xs text-muted-foreground">Tự luận TB</span>
                      <Input
                        type="number"
                        min={0}
                        className="text-center"
                        value={row.mediumEssay}
                        onChange={(e) => updateRow(i, "mediumEssay", parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="text-center">
                      <span className="text-xs text-muted-foreground">Tự luận Khó</span>
                      <Input
                        type="number"
                        min={0}
                        className="text-center"
                        value={row.hardEssay}
                        onChange={(e) => updateRow(i, "hardEssay", parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="text-sm font-medium">{calculateRowScore(row).toFixed(2)} đ</span>
                  <Button variant="ghost" size="sm" onPress={() => removeRow(i)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatrixDetailTable;
