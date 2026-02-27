import { Button } from "@workspace/ui/components/Button";
import { Award, CheckCircle, Star, Users } from "lucide-react";
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
  activeTab: string;
  onTabChange: (value: string) => void;
  hasAccess?: boolean;
  onEnroll: () => void;
  enrollPending: boolean;
}

export const CourseTabs: React.FC<CourseTabsProps> = ({
  course,
  activeTab,
  onTabChange,
  hasAccess,
  onEnroll,
  enrollPending,
}) => {
  const tabs = [
    { id: "overview", label: "Tổng quan" },
    { id: "curriculum", label: "Nội dung" },
    { id: "reviews", label: "Đánh giá", icon: Star },
    { id: "instructor", label: "Giảng viên" },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800">
      <div className="flex border-b border-slate-100 dark:border-slate-800 px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`cursor-pointer px-6 py-4 text-sm font-bold transition-colors relative ${
              activeTab === tab.id
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            }`}
          >
            <span className="flex items-center gap-1">
              {tab.icon && <tab.icon className="w-4 h-4" />}
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      <div className="p-8 space-y-8">
        {activeTab === "overview" && (
          <>
            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Mô tả khóa học</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{course.description}</p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                <h3 className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold mb-4">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  Bạn sẽ học được gì?
                </h3>
                <ul className="space-y-3">
                  {course.outcome.split("\n").map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-sm text-emerald-700 dark:text-emerald-400/80"
                    >
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

            <div className="p-6 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/20">
              <h3 className="text-rose-800 dark:text-rose-300 font-bold mb-2">Khóa học này dành cho ai?</h3>
              <p className="text-sm text-rose-700 dark:text-rose-400/80">{course.audience}</p>
            </div>
          </>
        )}

        {activeTab === "curriculum" && (
          <div className="text-center py-8 text-slate-500">
            <CourseCurriculum courseId={course.id} />
          </div>
        )}

        {activeTab === "reviews" &&
          (hasAccess ? (
            <div className="text-center py-8 text-slate-500">
              <CourseReviews courseId={course.id} />
            </div>
          ) : (
            <div className="rounded-2xl bg-linear-to-br from-gray-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 p-12 text-center">
              <Star className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Đăng ký để đánh giá</h3>
              <p className="mb-6 text-gray-600 dark:text-gray-400">Bạn cần đăng ký khóa học để xem và viết đánh giá</p>
              <Button
                onClick={onEnroll}
                isDisabled={enrollPending}
                className="bg-linear-to-r from-blue-600 to-indigo-600 px-8 py-3 text-white rounded-xl font-bold shadow-lg hover:from-blue-700 hover:to-indigo-700"
              >
                Đăng ký ngay
              </Button>
            </div>
          ))}

        {activeTab === "instructor" && (
          <div className="rounded-2xl bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 p-8">
            <h3 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Giảng viên</h3>
            <div className="flex items-start gap-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-indigo-500 shadow-xl shrink-0">
                <Users className="h-12 w-12 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">{course.instructorName}</h4>
                <p className="mb-4 text-sm font-medium text-blue-600">ID: {course.instructorId}</p>
                <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                  Giảng viên giàu kinh nghiệm trong lĩnh vực tin học, đã có nhiều năm giảng dạy và đào tạo học sinh.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
