import {
	ChevronDown,
	ChevronRight,
	Plus,
	Pencil,
	Trash2,
	BookOpen,
	FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { useLessonsByChapter } from "../queries/useLesson";
import type { TChapterResponse } from "../types/chapter.type";
import type { TLessonResponse } from "../types/lesson.type";

interface Props {
	chapter: TChapterResponse;
	isExpanded: boolean;
	onToggle: () => void;
	onEdit: () => void;
	onDelete: () => void;
	onAddLesson: () => void;
	onEditLesson: (lesson: TLessonResponse) => void;
	onDeleteLesson: (lesson: TLessonResponse) => void;
}

const ChapterItem: React.FC<Props> = ({
	chapter,
	isExpanded,
	onToggle,
	onEdit,
	onDelete,
	onAddLesson,
	onEditLesson,
	onDeleteLesson,
}) => {
	const { data: lessons, isLoading } = useLessonsByChapter(
		isExpanded ? chapter.id : undefined,
	);
	const sortedLessons = lessons?.sort((a, b) => a.lessonNo - b.lessonNo) || [];

	return (
		<Collapsible open={isExpanded} onOpenChange={onToggle}>
			<div className="border rounded-lg">
				<div className="flex items-center justify-between p-4">
					<CollapsibleTrigger asChild>
						<div className="flex items-center gap-3 cursor-pointer flex-1">
							{isExpanded ? (
								<ChevronDown className="h-5 w-5" />
							) : (
								<ChevronRight className="h-5 w-5" />
							)}
							<div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900">
								<BookOpen className="h-4 w-4 text-orange-600 dark:text-orange-400" />
							</div>
							<div>
								<div className="flex items-center gap-2">
									<Badge variant="outline">Chương {chapter.chapterNo}</Badge>
									<span className="font-medium">{chapter.name}</span>
								</div>
								<p className="text-sm text-muted-foreground">
									{chapter.lessons?.length || 0} bài học
									{chapter.description && ` • ${chapter.description}`}
								</p>
							</div>
						</div>
					</CollapsibleTrigger>
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm" onClick={onAddLesson}>
							<Plus className="h-4 w-4 mr-1" />
							Thêm bài
						</Button>
						<Button variant="ghost" size="icon" onClick={onEdit}>
							<Pencil className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="text-destructive"
							onClick={onDelete}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				</div>

				<CollapsibleContent>
					<div className="border-t px-4 py-3 bg-muted/30">
						{isLoading ? (
							<div className="space-y-2">
								{[1, 2].map((i) => (
									<Skeleton key={i} className="h-10 w-full" />
								))}
							</div>
						) : !sortedLessons.length ? (
							<p className="text-sm text-muted-foreground text-center py-4">
								Chưa có bài học nào
							</p>
						) : (
							<div className="space-y-2">
								{sortedLessons.map((lesson) => (
									<div
										key={lesson.id}
										className="flex items-center justify-between p-3 rounded-lg bg-background border"
									>
										<div className="flex items-center gap-3">
											<div className="p-1.5 rounded bg-green-100 dark:bg-green-900">
												<FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
											</div>
											<div>
												<div className="flex items-center gap-2">
													<Badge variant="outline" className="text-xs">
														Bài {lesson.lessonNo}
													</Badge>
													<span className="font-medium">{lesson.name}</span>
												</div>
												{lesson.description && (
													<p className="text-xs text-muted-foreground">
														{lesson.description}
													</p>
												)}
											</div>
										</div>
										<div className="flex items-center gap-1">
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8"
												onClick={() => onEditLesson(lesson)}
											>
												<Pencil className="h-3.5 w-3.5" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 text-destructive"
												onClick={() => onDeleteLesson(lesson)}
											>
												<Trash2 className="h-3.5 w-3.5" />
											</Button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</CollapsibleContent>
			</div>
		</Collapsible>
	);
};

export default ChapterItem;
