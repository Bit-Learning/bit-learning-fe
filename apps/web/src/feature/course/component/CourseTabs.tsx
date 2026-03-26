import { Award, CheckCircle } from "lucide-react";
import type React from "react";
import CourseCurriculum from "./CourseCurriculum";
import CourseReviews from "./CourseReviews";

interface CourseTabsProps {
  course: {
    id: number;
    description: string;
    outcome: string;
    requirement: string;
    audience: string;
    instructorName: string;
    instructorId: number;
  };
  hasAccess?: boolean;
}

export const CourseTabs: React.FC<CourseTabsProps> = ({ course, hasAccess }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-blue-200 dark:border-slate-800 p-8 space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Mô tả khóa học</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{course.description}</p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
            <h3 className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold mb-4">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              Bạn sẽ học được gì?
            </h3>
            <ul className="space-y-3">
              {course.outcome.split("\n").map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-blue-700 dark:text-blue-400/80">
                  <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
            <h3 className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold mb-4">
              <Award className="w-5 h-5 text-blue-600" />
              Yêu cầu
            </h3>
            <ul className="space-y-3">
              {course.requirement.split("\n").map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-blue-700 dark:text-blue-400/80">
                  <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
          <h3 className="text-blue-800 dark:text-blue-300 font-bold mb-2">Khóa học này dành cho ai?</h3>
          <p className="text-sm text-blue-700 dark:text-blue-400/80">{course.audience}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-blue-200 dark:border-slate-800 p-8">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Nội dung khóa học</h2>
        <CourseCurriculum courseId={course.id} />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-blue-200 dark:border-slate-800 p-8">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Đánh giá</h2>
        <CourseReviews courseId={course.id} hasAccess={hasAccess} />
      </div>
    </div>
  );
};
