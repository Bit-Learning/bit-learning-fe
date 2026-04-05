import { Award, CheckCircle, MessageCircle } from "lucide-react";
import type React from "react";
import { useState } from "react";
import CourseCurriculum from "./CourseCurriculum";
import CourseReviews from "./CourseReviews";
import { CourseCertificate } from "./CourseCertificate";

interface CourseTabsProps {
  course: {
    id: number;
    description: string;
    outcome: string;
    requirement: string;
    audience: string;
    instructorName: string;
    instructorId: number;
    progressPercentage?: number;
    title: string;
  };
  hasAccess?: boolean;
}

const TABS = [
  { key: "intro", label: "Giới thiệu" },
  { key: "curriculum", label: "Giáo trình" },
  { key: "reviews", label: "Đánh giá" },
  { key: "certificate", label: "Chứng chỉ" },
];

export const CourseTabs: React.FC<CourseTabsProps> = ({ course, hasAccess }) => {
  const [activeTab, setActiveTab] = useState("intro");

  return (
    <div className="space-y-0">
      <div className="border-b border-gray-200 bg-white">
        <div className="flex overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 px-5 py-3.5 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-b-xl p-6">
        <div className={activeTab === "intro" ? "block space-y-6" : "hidden"}>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quyền lợi của học viên</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: "🏆", text: "Nhận chứng chỉ khi hoàn thành khóa học" },
                { icon: "🥇", text: "Tham gia cuộc thi lập trình định kỳ" },
                { icon: "</>", text: "Truy cập linh hoạt, mọi lúc mọi nơi" },
                { icon: "🎁", text: "Nhận nhiều phần quà hấp dẫn" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col items-start gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4"
                >
                  <span className="text-xl">{item.icon}</span>
                  <p className="text-xs text-gray-600 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div
              className="text-gray-600 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: course.description.replace(/\n/g, "<br/>"),
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
              <h4 className="flex items-center gap-2 font-bold text-blue-800 mb-3">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                Bạn sẽ học được gì?
              </h4>
              <ul className="space-y-2">
                {course.outcome
                  .split("\n")
                  .filter(Boolean)
                  .map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-blue-700">
                      <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
                      <span>{item}</span>
                    </li>
                  ))}
              </ul>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
              <h4 className="flex items-center gap-2 font-bold text-blue-800 mb-3">
                <Award className="h-4 w-4 text-blue-600" />
                Yêu cầu
              </h4>
              <ul className="space-y-2">
                {course.requirement
                  .split("\n")
                  .filter(Boolean)
                  .map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-blue-700">
                      <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
                      <span>{item}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
            <h4 className="font-bold text-blue-800 mb-2">Khóa học này dành cho ai?</h4>
            <p className="text-sm text-blue-700">{course.audience}</p>
          </div>
        </div>

        <div className={activeTab === "curriculum" ? "block" : "hidden"}>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Nội dung khóa học</h2>
          <CourseCurriculum courseId={course.id} />
        </div>

        <div className={activeTab === "reviews" ? "block" : "hidden"}>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Đánh giá</h2>
          <CourseReviews courseId={course.id} hasAccess={hasAccess} />
        </div>

        <div className={activeTab === "certificate" ? "block" : "hidden"}>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Chứng chỉ</h2>

          <div className="mb-6 flex flex-col md:flex-row items-center gap-6 rounded-xl border border-gray-200 bg-gray-50 px-6 py-2">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Chứng nhận hoàn thành khóa học</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Bạn sẽ nhận được giấy chứng nhận hoàn thành khóa học sau khi hoàn thành nội dung khóa học.
              </p>
            </div>
            <img
              src="https://cdn-icons-png.flaticon.com/512/3769/3769051.png"
              alt="Certificate"
              className="w-32 h-32 object-contain opacity-90"
            />
          </div>

          {hasAccess && (
            <CourseCertificate
              courseId={course.id}
              courseName={course.title}
              progressPercentage={course.progressPercentage ?? 0}
            />
          )}

          {!hasAccess && <p className="text-sm text-gray-500 text-center py-4">Đăng ký khóa học để nhận chứng chỉ</p>}
        </div>
      </div>
    </div>
  );
};
