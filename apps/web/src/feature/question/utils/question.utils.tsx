import { ApprovalStatus, QuestionLevel, QuestionType } from "../types/question.type";

export const getDifficultyBadge = (level: QuestionLevel) => {
  const variants: Record<QuestionLevel, { className: string; label: string }> = {
    [QuestionLevel.EASY]: { className: "bg-green-100 text-green-700", label: "Dễ" },
    [QuestionLevel.MEDIUM]: { className: "bg-yellow-100 text-yellow-700", label: "Trung bình" },
    [QuestionLevel.HARD]: { className: "bg-red-100 text-red-700", label: "Khó" },
  };
  const config = variants[level];
  return <span className={`px-2 py-1 rounded text-sm font-medium ${config.className}`}>{config.label}</span>;
};

export const getTypeBadge = (type: QuestionType) =>
  ({ [QuestionType.MCQ]: "Trắc nghiệm", [QuestionType.ESSAY]: "Tự luận" })[type];

export const getStatusBadge = (status: ApprovalStatus) => {
  const variants: Record<ApprovalStatus, { className: string; label: string }> = {
    [ApprovalStatus.NONE]: { className: "bg-gray-100 text-gray-700", label: "Chưa gửi" },
    [ApprovalStatus.PENDING]: { className: "bg-blue-100 text-blue-700", label: "Chờ duyệt" },
    [ApprovalStatus.APPROVED]: { className: "bg-green-100 text-green-700", label: "Đã duyệt" },
    [ApprovalStatus.REJECTED]: { className: "bg-red-100 text-red-700", label: "Từ chối" },
  };
  const config = variants[status];
  return <span className={`px-2 py-1 rounded text-sm font-medium ${config.className}`}>{config.label}</span>;
};
