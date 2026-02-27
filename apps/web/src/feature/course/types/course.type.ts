export enum CourseLevel {
  BEGINNING = "BEGINNING",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED = "ADVANCED",
}

export enum CourseStatus {
  PENDING = "PENDING",
  PUBLISHED = "PUBLISHED",
  REJECTED = "REJECTED",
}

export enum Language {
  VIETNAMESE = "VIETNAMESE",
  ENGLISH = "ENGLISH",
}

export interface SectionDetail {
  id: number;
  title: string;
  order: number;
  lectures: any[];
}

export interface CoursePreview {
  id: number;
  code: string;
  title: string;
  thumbnailUrl: string;
  instructorId: number;
  instructorName: string;
  ratingStar: number;
  ratingCount: number;
  level: CourseLevel;
  grade: number;
  price: number;
  isDeleted: boolean;
  status: CourseStatus;
}

export interface CourseDetail {
  id: number;
  code: string;
  title: string;
  instructorId: number;
  instructorName: string;
  subtitle: string;
  thumbnailUrl: string;
  language: Language;
  outcome: string;
  requirement: string;
  audience: string;
  level: CourseLevel;
  description: string;
  ratingStar: number;
  ratingCount: number;
  totalSections: number;
  totalLectures: number;
  totalDuration: number;
  grade: number;
  price: number;
  sections: SectionDetail[];
  status: CourseStatus;
}

export interface CreateCourseRequest {
  title: string;
  subtitle: string;
  description: string;
  price: number;
  language: Language;
  outcome: string;
  requirement: string;
  audience: string;
  level: CourseLevel;
  grade: number;
}

export interface UpdateCourseRequest extends CreateCourseRequest {}
