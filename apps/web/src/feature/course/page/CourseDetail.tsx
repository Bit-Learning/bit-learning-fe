import { useParams } from "@tanstack/react-router";
import type React from "react";
import { useEffect } from "react";
import PageMeta from "@/shared/components/seo/page-meta";
import CourseDetailContent from "../component/CourseDetailContent";
import { useCourseActions } from "../queries/useCourse";

const CourseDetailPage: React.FC = () => {
	const { id } = useParams({ from: "/_layout/courses/$id" });
	const { selectCourse } = useCourseActions();

	useEffect(() => {
		selectCourse(Number(id));
	}, [id, selectCourse]);

	return (
		<>
			<PageMeta
				title="Chi Tiết Khóa Học - Bit Learning"
				description="Thông tin chi tiết về khóa học tin học tại Bit Learning"
			/>
			<CourseDetailContent />
		</>
	);
};

export default CourseDetailPage;
