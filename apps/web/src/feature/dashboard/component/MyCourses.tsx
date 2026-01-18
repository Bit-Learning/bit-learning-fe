import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen, Clock, CheckCircle, ChevronRight } from "lucide-react";
import { EnrolledCourse } from "../types/dashboard.type";

interface MyCoursesProps {
  courses: EnrolledCourse[];
}

type FilterType = "all" | "inProgress" | "completed";

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hôm nay";
  if (diffDays === 1) return "Hôm qua";
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  return date.toLocaleDateString("vi-VN");
};

const CourseCard: React.FC<{ course: EnrolledCourse }> = ({ course }) => {
  const isCompleted = course.progressPercent === 100;

  return (
    <Link
      to="/courses/$id"
      params={{ id: String(course.id) }}
      className="group flex gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-blue-200 hover:shadow-md"
    >
      <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        {isCompleted && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-500/80">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-gray-900 line-clamp-1 group-hover:text-blue-600">{course.title}</h3>
            <ChevronRight className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-hover:translate-x-1" />
          </div>
          <p className="mt-0.5 text-sm text-gray-500">{course.instructor}</p>
        </div>

        <div className="mt-2">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-gray-500">
              {course.completedLectures}/{course.totalLectures} bài học
            </span>
            <span className={`font-medium ${isCompleted ? "text-green-600" : "text-blue-600"}`}>
              {course.progressPercent}%
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full rounded-full transition-all ${isCompleted ? "bg-green-500" : "bg-blue-600"}`}
              style={{ width: `${course.progressPercent}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-400">
            <Clock className="h-3 w-3" />
            <span>Truy cập {formatTimeAgo(course.lastAccessedAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const MyCourses: React.FC<MyCoursesProps> = ({ courses }) => {
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredCourses = courses.filter((course) => {
    if (filter === "completed") return course.progressPercent === 100;
    if (filter === "inProgress") return course.progressPercent < 100;
    return true;
  });

  const completedCount = courses.filter((c) => c.progressPercent === 100).length;
  const inProgressCount = courses.filter((c) => c.progressPercent < 100).length;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Khóa học của tôi</h2>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
            {courses.length}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === "all" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Tất cả ({courses.length})
          </button>
          <button
            onClick={() => setFilter("inProgress")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === "inProgress" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Đang học ({inProgressCount})
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === "completed" ? "bg-green-100 text-green-700" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Hoàn thành ({completedCount})
          </button>
        </div>
      </div>

      {filteredCourses.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpen className="mb-3 h-12 w-12 text-gray-300" />
          <p className="font-medium text-gray-900">Không có khóa học nào</p>
          <p className="mt-1 text-sm text-gray-500">
            {filter === "completed"
              ? "Bạn chưa hoàn thành khóa học nào"
              : filter === "inProgress"
              ? "Bạn không có khóa học đang học"
              : "Bạn chưa đăng ký khóa học nào"}
          </p>
          {filter === "all" && (
            <Link to="/courses" className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700">
              Khám phá khóa học →
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
