import { ApprovalStatus, QuestionLevel, QuestionType } from "../types/question.type";

export const levelColors: Record<QuestionLevel, string> = {
  [QuestionLevel.EASY]: "bg-green-100 text-green-700",
  [QuestionLevel.MEDIUM]: "bg-yellow-100 text-yellow-700",
  [QuestionLevel.HARD]: "bg-red-100 text-red-700",
};

export const levelLabels: Record<QuestionLevel, string> = {
  [QuestionLevel.EASY]: "Dễ",
  [QuestionLevel.MEDIUM]: "Trung bình",
  [QuestionLevel.HARD]: "Khó",
};

export const getDifficultyBadge = (level: QuestionLevel) => (
  <span className={`px-2 py-1 rounded text-sm font-medium ${levelColors[level]}`}>{levelLabels[level]}</span>
);

export const typeLabels: Record<QuestionType, string> = {
  [QuestionType.MCQ]: "Trắc nghiệm",
  [QuestionType.ESSAY]: "Tự luận",
};

export const typeColors: Record<QuestionType, string> = {
  [QuestionType.MCQ]: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  [QuestionType.ESSAY]: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};

export const getTypeLabel = (type: QuestionType): string => typeLabels[type];

export const getTypeBadge = (type: QuestionType) => (
  <span className={`px-2 py-1 rounded text-sm font-medium ${typeColors[type]}`}>{typeLabels[type]}</span>
);

export const statusConfig: Record<
  ApprovalStatus,
  { label: string; color: string; bgColor: string; className: string }
> = {
  [ApprovalStatus.NONE]: {
    label: "Chưa gửi",
    color: "text-slate-700",
    bgColor: "bg-slate-100",
    className: "bg-slate-100 text-slate-700",
  },
  [ApprovalStatus.PENDING]: {
    label: "Chờ duyệt",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    className: "bg-blue-100 text-blue-700",
  },
  [ApprovalStatus.APPROVED]: {
    label: "Đã duyệt",
    color: "text-green-700",
    bgColor: "bg-green-100",
    className: "bg-green-100 text-green-700",
  },
  [ApprovalStatus.REJECTED]: {
    label: "Từ chối",
    color: "text-red-700",
    bgColor: "bg-red-100",
    className: "bg-red-100 text-red-700",
  },
};

export const getStatusBadge = (status: ApprovalStatus) => (
  <span className={`px-2 py-1 rounded text-sm font-medium ${statusConfig[status].className}`}>
    {statusConfig[status].label}
  </span>
);
