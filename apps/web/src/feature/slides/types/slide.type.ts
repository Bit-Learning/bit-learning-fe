import React from "react";

export type TabType = "create" | "my-slides";

export interface Template {
  id: string;
  name: string;
  category: string;
  color: string;
  gradient?: string;
  icon?: React.ReactNode;
}

export interface Slide {
  id: string;
  topic: string;
  grade: string;
  slideCount: number;
  createdDate: string;
  template: string;
  icon: React.ReactNode;
  iconColor: string;
  hasExamples: boolean;
  hasExercises: boolean;
  instructorId?: number;
}

export interface CreateSlideRequest {
  topic: string;
  grade: string;
  templateId: string;
  slideCount: number;
  includeExamples: boolean;
  includeExercises: boolean;
  instructorId: number;
}

export interface SlideResponse {
  id: string;
  topic: string;
  grade: string;
  slideCount: number;
  templateName: string;
  createdAt: string;
  hasExamples: boolean;
  hasExercises: boolean;
  downloadUrl?: string;
}

export const GRADE_COLOR_MAP: { [key: string]: string } = {
  "Lớp 3": "bg-pink-100 text-pink-800",
  "Lớp 4": "bg-purple-100 text-purple-800",
  "Lớp 5": "bg-indigo-100 text-indigo-800",
  "Lớp 6": "bg-blue-100 text-blue-800",
  "Lớp 7": "bg-cyan-100 text-cyan-800",
  "Lớp 8": "bg-teal-100 text-teal-800",
  "Lớp 9": "bg-emerald-100 text-emerald-800",
  "Lớp 10": "bg-green-100 text-green-800",
  "Lớp 11": "bg-amber-100 text-amber-800",
  "Lớp 12": "bg-orange-100 text-orange-800",
};

export const GRADE_OPTIONS = [
  { value: "", label: "Chọn lớp" },
  { value: "Lớp 3", label: "Lớp 3" },
  { value: "Lớp 4", label: "Lớp 4" },
  { value: "Lớp 5", label: "Lớp 5" },
  { value: "Lớp 6", label: "Lớp 6" },
  { value: "Lớp 7", label: "Lớp 7" },
  { value: "Lớp 8", label: "Lớp 8" },
  { value: "Lớp 9", label: "Lớp 9" },
  { value: "Lớp 10", label: "Lớp 10" },
  { value: "Lớp 11", label: "Lớp 11" },
  { value: "Lớp 12", label: "Lớp 12" },
];

export const FILTER_GRADE_OPTIONS = [
  { value: "all", label: "Tất cả lớp" },
  { value: "Lớp 3", label: "Lớp 3" },
  { value: "Lớp 4", label: "Lớp 4" },
  { value: "Lớp 5", label: "Lớp 5" },
  { value: "Lớp 6", label: "Lớp 6" },
  { value: "Lớp 7", label: "Lớp 7" },
  { value: "Lớp 8", label: "Lớp 8" },
  { value: "Lớp 9", label: "Lớp 9" },
  { value: "Lớp 10", label: "Lớp 10" },
  { value: "Lớp 11", label: "Lớp 11" },
  { value: "Lớp 12", label: "Lớp 12" },
];
