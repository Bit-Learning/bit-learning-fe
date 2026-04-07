import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import {
	ArrowRight,
	Book,
	ChevronDown,
	GraduationCap,
	Layers,
	Pencil,
	Plus,
	Trash2,
} from "lucide-react";
import type { TCurriculumResponse } from "../types/curriculum.type";
import type { TSubjectResponse } from "../types/subject.type";

const takeGradeOnly = (name: string) => {
	const match = name.match(/Tin học (\d+)/);
	return match ? `Tin học ${match[1]}` : name;
};

const curriculumImages = [
	{ id: 1, name: "Chân trời sáng tạo", image: "/ctst.png" },
	{ id: 2, name: "Kết nối tri thức với cuộc sống", image: "/knttvcs.png" },
	{ id: 3, name: "Cánh diều", image: "/cd.png" },
];

// Assign a subtle accent color per curriculum index
const accentColors = [
	{
		bg: "bg-violet-50 dark:bg-violet-950/30",
		border: "border-violet-200 dark:border-violet-800",
		badge:
			"bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",
		dot: "bg-violet-400",
	},
	{
		bg: "bg-sky-50 dark:bg-sky-950/30",
		border: "border-sky-200 dark:border-sky-800",
		badge: "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300",
		dot: "bg-sky-400",
	},
	{
		bg: "bg-emerald-50 dark:bg-emerald-950/30",
		border: "border-emerald-200 dark:border-emerald-800",
		badge:
			"bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
		dot: "bg-emerald-400",
	},
	{
		bg: "bg-amber-50 dark:bg-amber-950/30",
		border: "border-amber-200 dark:border-amber-800",
		badge: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
		dot: "bg-amber-400",
	},
];

interface Props {
	curriculum: TCurriculumResponse;
	subjects: TSubjectResponse[];
	isExpanded: boolean;
	isLoading?: boolean;
	colorIndex?: number;
	onToggle: () => void;
	onEdit: () => void;
	onDelete: () => void;
	onAddSubject: () => void;
	onEditSubject: (subject: TSubjectResponse) => void;
	onDeleteSubject: (subject: TSubjectResponse) => void;
	onSubjectClick: (subject: TSubjectResponse) => void;
}

const CurriculumItem: React.FC<Props> = ({
	curriculum,
	subjects,
	isExpanded,
	isLoading,
	colorIndex = 0,
	onToggle,
	onEdit,
	onDelete,
	onAddSubject,
	onEditSubject,
	onDeleteSubject,
	onSubjectClick,
}) => {
	const curriculumImage = curriculumImages.find((item) =>
		curriculum.name.includes(item.name),
	);
	const accent = accentColors[colorIndex % accentColors.length];

	return (
		<Collapsible open={isExpanded} onOpenChange={onToggle}>
			<Card
				className={`overflow-hidden border transition-all duration-200 ${isExpanded ? "shadow-md" : "shadow-sm hover:shadow-md"}`}
			>
				{/* Header row */}
				<div
					className={`flex items-center gap-4 px-5 py-4 ${isExpanded ? accent?.bg : "bg-card hover:bg-muted/30"} transition-colors duration-200`}
				>
					{/* Curriculum image / icon */}
					<div className="shrink-0 h-14 w-14 rounded-xl overflow-hidden bg-white dark:bg-zinc-800 border border-border flex items-center justify-center shadow-sm">
						{curriculumImage ? (
							<img
								src={curriculumImage.image}
								alt={curriculumImage.name}
								className="h-full w-full object-contain p-1"
							/>
						) : (
							<GraduationCap className="h-6 w-6 text-muted-foreground" />
						)}
					</div>

					{/* Title + meta */}
					<CollapsibleTrigger asChild>
						<button className="flex-1 text-left min-w-0 focus:outline-none group">
							<div className="flex items-center gap-2 mb-0.5">
								<h3 className="font-semibold text-base leading-tight truncate group-hover:text-primary transition-colors">
									{curriculum.name}
								</h3>
							</div>
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<span
									className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${accent?.badge}`}
								>
									<Layers className="h-3 w-3" />
									{subjects.length} môn học
								</span>
								{curriculum.description && (
									<span className="truncate">{curriculum.description}</span>
								)}
							</div>
						</button>
					</CollapsibleTrigger>

					{/* Actions */}
					<div className="flex items-center gap-1 shrink-0">
						<Button
							variant="outline"
							size="sm"
							className="h-8 text-xs font-medium"
							onClick={onAddSubject}
						>
							<Plus className="h-3.5 w-3.5 mr-1" />
							Thêm môn
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 text-muted-foreground hover:text-foreground"
							onClick={onEdit}
						>
							<Pencil className="h-3.5 w-3.5" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 text-muted-foreground hover:text-destructive"
							onClick={onDelete}
						>
							<Trash2 className="h-3.5 w-3.5" />
						</Button>
						<CollapsibleTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 text-muted-foreground ml-1"
							>
								<ChevronDown
									className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
								/>
							</Button>
						</CollapsibleTrigger>
					</div>
				</div>

				{/* Subjects list */}
				<CollapsibleContent>
					<div className="border-t border-border">
						{isLoading ? (
							<div className="p-4 space-y-2">
								{[1, 2].map((i) => (
									<Skeleton key={i} className="h-12 w-full rounded-lg" />
								))}
							</div>
						) : !subjects.length ? (
							<div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
								<Book className="h-8 w-8 mb-2 opacity-30" />
								<p className="text-sm">Chưa có môn học nào</p>
								<Button
									variant="outline"
									size="sm"
									className="mt-3"
									onClick={onAddSubject}
								>
									<Plus className="h-3.5 w-3.5 mr-1" />
									Thêm môn học đầu tiên
								</Button>
							</div>
						) : (
							<div className="divide-y divide-border/60">
								{subjects.map((subject, idx) => (
									<div
										key={subject.id}
										className="group flex items-center justify-between px-5 py-3 hover:bg-muted/40 cursor-pointer transition-colors duration-150"
										onClick={() => onSubjectClick(subject)}
									>
										<div className="flex items-center gap-3 min-w-0">
											{/* Numbered indicator */}
											<div
												className={`shrink-0 h-7 w-7 rounded-full ${accent?.badge} flex items-center justify-center text-xs font-semibold`}
											>
												{idx + 1}
											</div>
											<div className="min-w-0">
												<span className="font-medium text-sm leading-tight truncate block">
													{takeGradeOnly(subject.name)}
												</span>
											</div>
										</div>

										<div className="flex items-center gap-1 shrink-0 ml-4">
											<Button
												variant="ghost"
												size="icon"
												className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
												onClick={(e) => {
													e.stopPropagation();
													onEditSubject(subject);
												}}
											>
												<Pencil className="h-3 w-3" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
												onClick={(e) => {
													e.stopPropagation();
													onDeleteSubject(subject);
												}}
											>
												<Trash2 className="h-3 w-3" />
											</Button>
											<ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</CollapsibleContent>
			</Card>
		</Collapsible>
	);
};

export default CurriculumItem;
