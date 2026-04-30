import { Difficulty, Language } from "@/features/problems/types/problem.type";

export const DIFFICULTY_CONFIG: Record<string, { label: string; className: string }> = {
  [Difficulty.EASY]: { label: "Dễ", className: "bg-green-100 text-green-700 border-green-200" },
  [Difficulty.MEDIUM]: { label: "Trung bình", className: "bg-orange-100 text-orange-700 border-orange-200" },
  [Difficulty.HARD]: { label: "Khó", className: "bg-red-100 text-red-700 border-red-200" },
};

export const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; color: string }[] = [
  { value: Difficulty.EASY, label: "Dễ", color: "text-green-700 bg-green-50 border-green-300" },
  { value: Difficulty.MEDIUM, label: "Trung bình", color: "text-orange-700 bg-orange-50 border-orange-300" },
  { value: Difficulty.HARD, label: "Khó", color: "text-red-700 bg-red-50 border-red-300" },
];

export const LANG_LABELS: Record<Language, string> = {
  [Language.CPP]: "C++",
  [Language.JAVA]: "Java",
  [Language.PYTHON]: "Python",
  [Language.JAVASCRIPT]: "JavaScript",
};

export const removeVietnameseTones = (str: string): string =>
  str
    .toLowerCase()
    .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
    .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
    .replace(/ì|í|ị|ỉ|ĩ/g, "i")
    .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
    .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
    .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
    .replace(/đ/g, "d");

export const toSlug = (title: string): string =>
  removeVietnameseTones(title)
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();

export const calcAcceptanceRate = (accepted: number, total: number): number =>
  total === 0 ? 0 : Math.round((accepted / total) * 100);

export const getAcceptanceColor = (rate: number): string => (rate > 60 ? "#22c55e" : rate > 30 ? "#f59e0b" : "#ef4444");
