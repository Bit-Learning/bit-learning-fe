import { Badge } from "@workspace/ui/components/Badge";
import {
	CheckCircle,
	ChevronDown,
	FileText,
	HelpCircle,
	Lock,
	PlayCircle,
	Video,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import type { LectureDetail } from "../types/lecture.type";
import type { SectionDetail } from "../types/section.type";

interface CourseSidebarProps {
	lectureId: number;
	sections?: SectionDetail[];
	isOpen: boolean;
	onNavigate: (lectureId: number) => void;
	completedLectures?: number[];
	lectureProgress?: Record<number, number>;
}

const COMPLETION_THRESHOLD = 90;

const CourseSidebar: React.FC<CourseSidebarProps> = ({
	lectureId,
	sections,
	isOpen,
	onNavigate,
	completedLectures = [],
	lectureProgress = {},
}) => {
	const [expandedSections, setExpandedSections] = useState<number[]>([]);

	const toggleSection = (sectionId: number) => {
		setExpandedSections((prev) =>
			prev.includes(sectionId)
				? prev.filter((id) => id !== sectionId)
				: [...prev, sectionId],
		);
	};

	useEffect(() => {
		if (sections) {
			for (const section of sections) {
				const hasCurrentLecture = section.lectures?.some(
					(l) => l.id === lectureId,
				);
				if (hasCurrentLecture && !expandedSections.includes(section.id)) {
					setExpandedSections((prev) => [...prev, section.id]);
					break;
				}
			}
		}
	}, [lectureId, sections, expandedSections.includes]);

	const getSectionProgress = (section: SectionDetail) => {
		if (!section.lectures?.length) return 0;
		const completed = section.lectures.filter(
			(l) =>
				completedLectures.includes(l.id) ||
				(lectureProgress[l.id] ?? 0) >= COMPLETION_THRESHOLD,
		).length;
		return Math.round((completed / section.lectures.length) * 100);
	};

	const isLectureCompleted = (id: number) => {
		return (
			completedLectures.includes(id) ||
			(lectureProgress[id] ?? 0) >= COMPLETION_THRESHOLD
		);
	};

	const getLectureProgress = (id: number) => {
		return lectureProgress[id] ?? 0;
	};

	const getLectureIcon = (
		lecture: LectureDetail,
		isActive: boolean,
		isCompleted: boolean,
		isLocked: boolean,
	) => {
		if (isCompleted) return <CheckCircle className="h-5 w-5 text-green-500" />;
		if (isLocked) return <Lock className="h-5 w-5" />;

		const progress = getLectureProgress(lecture.id);
		if (progress > 0 && progress < COMPLETION_THRESHOLD) {
			return <CheckCircle className="h-5 w-5 text-gray-500" />;
		}

		if (isActive) return <PlayCircle className="h-5 w-5 text-blue-400" />;

		switch (lecture.type) {
			case "VIDEO":
				return <Video className="h-5 w-5" />;
			case "TEXT":
				return <FileText className="h-5 w-5" />;
			case "QUIZ":
				return <HelpCircle className="h-5 w-5" />;
			default:
				return <PlayCircle className="h-5 w-5" />;
		}
	};

	return (
		<div
			className={`${isOpen ? "translate-x-0" : "translate-x-full"} absolute right-0 top-0 z-10 h-full w-full border-l border-gray-800 bg-gray-950 transition-transform duration-300 lg:relative lg:w-96 lg:translate-x-0`}
		>
			<div className="flex h-full flex-col">
				<div className="border-b border-gray-800 p-4">
					<h2 className="font-semibold text-white">Nội dung khóa học</h2>
					<p className="mt-1 text-sm text-gray-400">
						{sections?.length || 0} chương •{" "}
						{sections?.reduce((acc, s) => acc + (s.lectures?.length || 0), 0) ||
							0}{" "}
						bài học
					</p>
				</div>

				<div className="flex-1 overflow-y-auto">
					{sections?.map((section, sectionIndex) => {
						const progress = getSectionProgress(section);
						const isExpanded = expandedSections.includes(section.id);

						return (
							<div key={section.id} className="border-b border-gray-800">
								<button
									onClick={() => toggleSection(section.id)}
									className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-900"
								>
									<div className="flex-1">
										<div className="flex items-center gap-2">
											<h3 className="font-medium text-white">
												{sectionIndex + 1}. {section.title}
											</h3>
											{progress === 100 && (
												<CheckCircle className="h-4 w-4 text-green-500" />
											)}
										</div>
										<div className="mt-2 flex items-center gap-3">
											<span className="text-sm text-gray-400">
												{section.lectures?.length || 0} bài học
											</span>
											<div className="flex items-center gap-2">
												<div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-700">
													<div
														className="h-full rounded-full bg-green-500 transition-all"
														style={{ width: `${progress}%` }}
													/>
												</div>
												<span className="text-xs text-gray-500">
													{progress}%
												</span>
											</div>
										</div>
									</div>
									<ChevronDown
										className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
									/>
								</button>

								{isExpanded && (
									<div className="bg-gray-900/50">
										{section.lectures?.map((lecture, lectureIndex) => {
											const isActive = lecture.id === lectureId;
											const isLocked = !lecture.isPreviewable;
											const isCompleted = isLectureCompleted(lecture.id);
											const progress = getLectureProgress(lecture.id);

											return (
												<button
													key={lecture.id}
													onClick={() => !isLocked && onNavigate(lecture.id)}
													disabled={isLocked}
													className={`relative flex w-full items-center gap-3 px-6 py-3 text-left transition-colors ${
														isActive
															? "bg-blue-600/20 text-blue-400"
															: isLocked
																? "cursor-not-allowed text-gray-600"
																: "text-gray-300 hover:bg-gray-800"
													}`}
												>
													{isActive &&
														progress > 0 &&
														progress < COMPLETION_THRESHOLD && (
															<div
																className="absolute inset-y-0 left-0 bg-blue-600/10 transition-all"
																style={{ width: `${progress}%` }}
															/>
														)}

													<div className="relative shrink-0">
														{getLectureIcon(
															lecture,
															isActive,
															isCompleted,
															isLocked,
														)}
													</div>

													<div className="relative min-w-0 flex-1">
														<p
															className={`truncate text-sm font-medium ${isCompleted ? "text-green-400" : ""}`}
														>
															{lectureIndex + 1}. {lecture.title}
														</p>
														<div className="mt-0.5 flex items-center gap-2">
															{isCompleted && (
																<span className="text-xs text-green-500">
																	Hoàn thành
																</span>
															)}
														</div>
													</div>

													<div className="relative flex shrink-0 items-center gap-1">
														{lecture.isPreviewable && !isActive && (
															<Badge className="bg-green-600/20 text-xs text-green-400">
																Preview
															</Badge>
														)}
													</div>
												</button>
											);
										})}
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default CourseSidebar;
