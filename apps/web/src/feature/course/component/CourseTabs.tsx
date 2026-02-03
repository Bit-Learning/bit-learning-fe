import { Button } from "@workspace/ui/components/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/update/tabs";
import { Award, CheckCircle, Star, Users } from "lucide-react";
import type React from "react";
import CourseCurriculum from "@/feature/course/component/CourseCurriculum";
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

const CourseTabs: React.FC<CourseTabsProps> = ({
  course,
  activeTab,
  onTabChange,
  hasAccess,
  onEnroll,
  enrollPending,
}) => {
  return (
    <div className="rounded-3xl bg-white shadow-xl">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <div className="border-b border-gray-100">
          <TabsList className="grid w-full grid-cols-4 bg-transparent p-2">
            <TabsTrigger
              value="overview"
              className="rounded-xl cursor-pointer data-[state=active]:bg-linear-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              Tổng quan
            </TabsTrigger>
            <TabsTrigger
              value="curriculum"
              className="rounded-xl cursor-pointer data-[state=active]:bg-linear-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              Nội dung
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-xl cursor-pointer data-[state=active]:bg-linear-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <Star className="mr-1.5 h-4 w-4" />
              Đánh giá
            </TabsTrigger>
            <TabsTrigger
              value="instructor"
              className="rounded-xl cursor-pointer data-[state=active]:bg-linear-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              Giảng viên
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="p-8">
          <TabsContent value="overview" className="space-y-8">
            <div>
              <h3 className="mb-4 text-2xl font-bold text-gray-900">Mô tả khóa học</h3>
              <p className="leading-relaxed text-gray-700">{course.description}</p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="rounded-2xl bg-linear-to-br from-green-50 to-emerald-50 p-6">
                <h4 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  Bạn sẽ học được gì?
                </h4>
                <div className="space-y-3">
                  {course.outcome.split("\n").map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-linear-to-br from-blue-50 to-indigo-50 p-6">
                <h4 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
                  <Award className="h-6 w-6 text-blue-600" />
                  Yêu cầu
                </h4>
                <div className="space-y-3">
                  {course.requirement.split("\n").map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-linear-to-br from-purple-50 to-pink-50 p-6">
              <h4 className="mb-4 text-xl font-semibold text-gray-900">Khóa học này dành cho ai?</h4>
              <p className="leading-relaxed text-gray-700">{course.audience}</p>
            </div>
          </TabsContent>

          <TabsContent value="curriculum">
            <CourseCurriculum courseId={course.id} />
          </TabsContent>

          <TabsContent value="reviews">
            {hasAccess ? (
              <CourseReviews courseId={course.id} />
            ) : (
              <div className="rounded-2xl bg-linear-to-br from-gray-50 to-blue-50 p-12 text-center">
                <Star className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                <h3 className="mb-2 text-xl font-semibold text-gray-900">Đăng ký để đánh giá</h3>
                <p className="mb-6 text-gray-600">Bạn cần đăng ký khóa học để xem và viết đánh giá</p>
                <Button
                  onClick={onEnroll}
                  isDisabled={enrollPending}
                  className="bg-linear-to-r from-blue-600 to-indigo-600 px-8 py-3 text-white shadow-lg hover:from-blue-700 hover:to-indigo-700"
                >
                  Đăng ký ngay
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="instructor">
            <div className="rounded-2xl bg-linear-to-br from-blue-50 to-indigo-50 p-8">
              <h3 className="mb-6 text-2xl font-bold text-gray-900">Giảng viên</h3>
              <div className="flex items-start gap-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-indigo-500 shadow-xl">
                  <Users className="h-12 w-12 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="mb-2 text-2xl font-bold text-gray-900">{course.instructorName}</h4>
                  <p className="mb-4 text-sm font-medium text-blue-600">ID: {course.instructorId}</p>
                  <p className="leading-relaxed text-gray-700">
                    Giảng viên giàu kinh nghiệm trong lĩnh vực tin học, đã có nhiều năm giảng dạy và đào tạo học sinh.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default CourseTabs;
