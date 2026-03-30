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

export interface UpdateCourseRequest {
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

export interface CoursePreview {
  id: number;
  code: string;
  title: string;
  description: string;
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
  isDeleted: boolean;
  status: CourseStatus;
  progressPercentage: number;
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

export interface LectureDetail {
  id: number;
  sectionId: number;
  title: string;
  description: string;
  type: LectureType;
  isPreviewable: boolean;
  orderIndex: number;
  isDeleted: boolean;
  isCompleted: boolean;
}

export interface MyCourse {
  id: number;
  code: string;
  title: string;
  description: string;
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
  progressPercentage: number;
}

export enum CourseLevel {
  BEGINNING = "BEGINNING",
  INTERMEDIATE = "INTERMEDIATE",
  ADVANCED = "ADVANCED",
}

export enum Language {
  VIETNAMESE = "VIETNAMESE",
  ENGLISH = "ENGLISH",
}

export enum LectureType {
  VIDEO = "VIDEO",
  TEXT = "TEXT",
  QUIZ = "QUIZ",
  EMPTY = "EMPTY",
}

export enum CourseStatus {
  PENDING = "PENDING",
  PUBLISHED = "PUBLISHED",
  REJECTED = "REJECTED",
}
