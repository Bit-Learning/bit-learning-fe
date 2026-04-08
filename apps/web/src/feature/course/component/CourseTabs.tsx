import { Award, CheckCircle } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
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

const SECTIONS = [
  { key: "intro", label: "Giới thiệu" },
  { key: "curriculum", label: "Giáo trình" },
  { key: "reviews", label: "Đánh giá" },
  { key: "certificate", label: "Chứng chỉ" },
];

const BENEFITS = [
  { icon: "🏆", text: "Nhận chứng chỉ khi hoàn thành khóa học" },
  { icon: "🥇", text: "Tham gia cuộc thi lập trình định kỳ" },
  { icon: "</>", text: "Truy cập linh hoạt, mọi lúc mọi nơi" },
  { icon: "🎁", text: "Nhận nhiều phần quà hấp dẫn" },
];

const SectionCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-white dark:bg-slate-900 rounded-md border border-gray-200 dark:border-slate-700 shadow-sm p-6">
    {children}
  </div>
);

export const CourseTabs: React.FC<CourseTabsProps> = ({ course, hasAccess }) => {
  const [activeSection, setActiveSection] = useState("intro");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const navRef = useRef<HTMLDivElement>(null);
  const observing = useRef(true);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    SECTIONS.forEach(({ key }) => {
      const el = sectionRefs.current[key];
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (observing.current && entry?.isIntersecting) setActiveSection(key);
        },
        { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollToSection = (key: string) => {
    const el = sectionRefs.current[key];
    if (!el) return;
    observing.current = false;
    setActiveSection(key);
    const navH = navRef.current?.offsetHeight ?? 56;
    const top = el.getBoundingClientRect().top + window.scrollY - navH - 12;
    window.scrollTo({ top, behavior: "smooth" });
    setTimeout(() => {
      observing.current = true;
    }, 800);
  };

  return (
    <div>
      <div
        ref={navRef}
        className="sticky top-0 z-30 bg-white dark:bg-slate-900 border shadow-sm border-gray-200 dark:border-slate-700"
      >
        <div className="flex overflow-x-auto">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => scrollToSection(s.key)}
              className={`cursor-pointer shrink-0 px-5 py-3.5 text-sm font-medium transition-colors border-b-2 ${
                activeSection === s.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-slate-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <div
          ref={(el) => {
            sectionRefs.current["intro"] = el;
          }}
        >
          <SectionCard>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Quyền lợi của học viên</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                  {BENEFITS.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-xl border border-gray-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950 text-lg">
                        {item.icon}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-slate-200 leading-snug">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-slate-800 pt-6">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">Mô tả khóa học</h3>
                <div
                  className="text-gray-600 dark:text-slate-300 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: course.description.replace(/\n/g, "<br/>") }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
                  <h4 className="flex items-center gap-2 font-bold text-blue-800 mb-3">Bạn sẽ học được gì?</h4>
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
                  <h4 className="flex items-center gap-2 font-bold text-blue-800 mb-3">Yêu cầu</h4>
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
          </SectionCard>
        </div>

        <div
          ref={(el) => {
            sectionRefs.current["curriculum"] = el;
          }}
        >
          <SectionCard>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Giáo trình</h2>
            <CourseCurriculum courseId={course.id} />
          </SectionCard>
        </div>

        <div
          ref={(el) => {
            sectionRefs.current["reviews"] = el;
          }}
        >
          <SectionCard>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Đánh giá</h2>
            <CourseReviews courseId={course.id} hasAccess={hasAccess} />
          </SectionCard>
        </div>

        <div
          ref={(el) => {
            sectionRefs.current["certificate"] = el;
          }}
        >
          <SectionCard>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Chứng chỉ</h2>

            <div className="flex flex-col md:flex-row items-center gap-6 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 px-6 py-4 mb-5">
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">
                  Chứng nhận hoàn thành khóa học
                </h3>
                <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                  Bạn sẽ nhận được giấy chứng nhận hoàn thành khóa học sau khi hoàn thành nội dung khóa học.
                </p>
              </div>
              <img
                src="https://cdn-icons-png.flaticon.com/512/3769/3769051.png"
                alt="Certificate"
                className="w-28 h-28 object-contain opacity-90"
              />
            </div>

            {hasAccess ? (
              <CourseCertificate
                courseId={course.id}
                courseName={course.title}
                progressPercentage={course.progressPercentage ?? 0}
              />
            ) : (
              <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-4">
                Đăng ký khóa học để nhận chứng chỉ
              </p>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
};
