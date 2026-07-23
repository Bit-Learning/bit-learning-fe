import { useNavigate } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import { FileText, HelpCircle, Video } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useSectionsByCourse } from "../../lecture/queries/useSection";

interface CourseCurriculumProps {
	courseId: number;
}

const formatDuration = (seconds?: number) => {
	if (!seconds) return "00:00";
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = seconds % 60;
	if (h > 0) return `${h} giờ ${m} phút`;
	if (m > 0) return `${m} phút`;
	return `${s} giây`;
};

const LectureIcon = ({ type }: { type: string }) => {
	if (type === "VIDEO")
		return (
			<span className="flex h-5 w-5 items-center justify-center rounded bg-blue-100 text-blue-600">
				<Video className="h-3 w-3" />
			</span>
		);
	if (type === "QUIZ")
		return (
			<span className="flex h-5 w-5 items-center justify-center rounded bg-green-100 text-green-600">
				<HelpCircle className="h-3 w-3" />
			</span>
		);
	return (
		<span className="flex h-5 w-5 items-center justify-center rounded bg-purple-100 text-purple-600">
			<FileText className="h-3 w-3" />
		</span>
	);
};

const CourseCurriculum: React.FC<CourseCurriculumProps> = ({ courseId }) => {
	const [expandedSection, setExpandedSection] = useState<number | null>(0);
	const { data: sections, isLoading, error } = useSectionsByCourse(courseId);
	const navigate = useNavigate();

	const handleLectureClick = (id: number) => {
		navigate({ to: "/lectures/$id", params: { id: String(id) } });
	};

	if (isLoading) {
		return (
			<div className="py-8 text-center">
				<div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
				<p className="mt-3 text-sm text-gray-500">Đang tải nội dung...</p>
			</div>
		);
	}

	if (error || !sections?.length) {
		return (
			<p className="text-sm text-gray-500 py-4">Chưa có nội dung khóa học</p>
		);
	}

	const totalLectures = sections.reduce(
		(acc, s) => acc + (s.lectures?.length || 0),
		0,
	);
	const totalDuration = sections.reduce(
		(acc, s) => acc + (s.totalDuration || 0),
		0,
	);

	return (
		<div>
			<p className="text-sm text-gray-500 mb-4">
				{sections.length} Chương • {totalLectures} bài giảng
				{totalDuration > 0 &&
					` • ${formatDuration(totalDuration)} tổng thời lượng`}
			</p>

			<div className="overflow-hidden rounded-xl border border-gray-200">
				<div className="flex">
					<div className="w-40 shrink-0 border-r border-gray-200 bg-gray-50">
						{sections.map((section, idx) => (
							<button
								key={section.id}
								onClick={() =>
									setExpandedSection(expandedSection === idx ? null : idx)
								}
								className={`cursor-pointer flex w-full flex-col items-start px-4 py-4 text-left transition-colors border-b border-gray-200 last:border-b-0 ${
									expandedSection === idx
										? "border-l-4 border-l-blue-600 bg-white text-blue-600"
										: "text-gray-700 hover:bg-gray-100"
								}`}
							>
								<span className="text-lg text-gray-700 mb-0.5">
									Chương {idx + 1}
								</span>
								<span className="mt-1 text-sm text-gray-400">
									{section.lectures?.length || 0} bài
								</span>
							</button>
						))}
					</div>

					<div className="flex-1 min-w-0">
						{expandedSection !== null && sections[expandedSection] && (
							<>
								<div className="border-b border-gray-100 bg-blue-50 px-4 py-3">
									<p className="text-md font-semibold text-blue-800">
										{sections[expandedSection].title}
									</p>
									<div className="mt-1 flex gap-3 text-xs text-blue-600">
										{sections[expandedSection].lectures?.filter(
											(l) => l.type === "VIDEO",
										).length
											? `${sections[expandedSection].lectures!.filter((l) => l.type === "VIDEO").length} video`
											: null}
										{sections[expandedSection].lectures?.filter(
											(l) => l.type === "QUIZ",
										).length
											? ` • ${sections[expandedSection].lectures!.filter((l) => l.type === "QUIZ").length} bài kiểm tra`
											: null}
									</div>
								</div>

								<div className="divide-y divide-gray-100">
									{sections[expandedSection].lectures?.map((lecture, lIdx) => (
										<div
											key={lIdx}
											onClick={() => handleLectureClick(lecture.id)}
											className="flex cursor-pointer items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
										>
											<div className="flex items-center gap-3 min-w-0">
												<LectureIcon type={lecture.type} />
												<div className="min-w-0">
													<p className="text-md text-blue-600 hover:underline truncate">
														{lecture.title}
													</p>
													{(lecture as any).duration && (
														<p className="text-xs text-gray-400 mt-0.5">
															{formatDuration((lecture as any).duration)}
														</p>
													)}
												</div>
											</div>
											<div className="flex shrink-0 items-center gap-2 ml-3">
												{lecture.isPreviewable && (
													<span className="rounded bg-blue-600 px-2 py-0.5 text-[10px] font-medium text-white">
														Học thử
													</span>
												)}
											</div>
										</div>
									))}
								</div>
							</>
						)}

						{expandedSection === null && (
							<div className="flex h-full items-center justify-center p-8 text-sm text-gray-400">
								Chọn chương để xem nội dung
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default CourseCurriculum;
