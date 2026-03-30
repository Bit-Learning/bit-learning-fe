import type { LectureDetail } from "./course.type";

export interface CreateSectionRequest {
  courseId: number;
  title: string;
  description?: string;
  isPublished?: boolean;
  orderIndex: number;
}

export interface UpdateSectionRequest {
  title: string;
  description?: string;
  isPublished?: boolean;
  orderIndex: number;
}

export interface SectionDetail {
  id: number;
  title: string;
  description: string;
  isPublished: boolean;
  orderIndex: number;
  totalLectures: number;
  totalDuration: number;
  isDeleted: boolean;
  lectures: LectureDetail[];
  progressPercentage: number;
}
