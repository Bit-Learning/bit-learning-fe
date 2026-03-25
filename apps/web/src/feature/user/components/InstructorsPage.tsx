import { useState } from "react";
import { useInstructors } from "../queries/useUser";
import {
	Avatar,
	AvatarImage,
	AvatarFallback,
} from "@workspace/ui/components/Avatar";
import { Card } from "@workspace/ui/components/Card";
import {
	ChevronLeft,
	ChevronRight,
	GraduationCap,
	Github,
	Linkedin,
	Globe,
	Mail,
} from "lucide-react";
import type { TInstructor } from "../types/user.type";

export default function InstructorsPage() {
	const [page, setPage] = useState(0);
	const { data, isLoading } = useInstructors(page, 12);

	const instructors: TInstructor[] = data?.content ?? [];
	const totalPages = data?.totalPages ?? 0;

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
			{/* Hero Section */}
			<div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
				<div className="max-w-7xl mx-auto px-6 text-center">
					<div className="flex justify-center mb-4">
						<div className="bg-white/20 p-4 rounded-2xl">
							<GraduationCap className="w-12 h-12" />
						</div>
					</div>
					<h1 className="text-4xl font-bold mb-3">Đội ngũ giảng viên</h1>
					<p className="text-lg text-blue-100 max-w-2xl mx-auto">
						Gặp gỡ những mentor tài năng và giàu kinh nghiệm tại Bit Learning.
						Họ sẵn sàng đồng hành cùng bạn trên hành trình học tập.
					</p>
				</div>
			</div>

			{/* Instructors Grid */}
			<div className="max-w-7xl mx-auto px-6 py-12">
				{isLoading ? (
					<div className="text-center py-20 text-slate-500 text-lg">
						Đang tải...
					</div>
				) : instructors.length === 0 ? (
					<div className="text-center py-20">
						<GraduationCap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
						<p className="text-slate-500 text-lg">Chưa có giảng viên nào.</p>
					</div>
				) : (
					<>
						<div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
							{instructors.map((instructor) => (
								<Card
									key={instructor.id}
									className="overflow-hidden hover:shadow-lg transition-shadow group"
								>
									{/* Cover */}
									<div className="h-28 bg-gradient-to-r from-blue-500 to-indigo-500 relative">
										{instructor.coverImage && (
											<img
												src={instructor.coverImage}
												alt=""
												className="w-full h-full object-cover"
											/>
										)}
									</div>
									{/* Avatar */}
									<div className="px-5 -mt-10 relative z-10">
										<Avatar className="size-20 border-4 border-white shadow-md">
											<AvatarImage src={instructor.avatar} />
											<AvatarFallback className="text-xl bg-blue-100 text-blue-700">
												{instructor.firstName?.charAt(0) || "M"}
											</AvatarFallback>
										</Avatar>
									</div>
									{/* Info */}
									<div className="px-5 pb-5 pt-3">
										<h3 className="font-bold text-lg text-slate-900">
											{instructor.firstName} {instructor.lastName}
										</h3>
										{instructor.jobTitle && (
											<p className="text-sm text-blue-600 font-medium mt-0.5">
												{instructor.jobTitle}
											</p>
										)}
										{instructor.bio && (
											<p className="text-sm text-slate-500 mt-2 line-clamp-3">
												{instructor.bio}
											</p>
										)}
										{/* Social Links */}
										<div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100">
											{instructor.email && (
												<a
													href={`mailto:${instructor.email}`}
													className="text-slate-400 hover:text-blue-600 transition-colors"
													aria-label="Email"
												>
													<Mail className="w-4 h-4" />
												</a>
											)}
											{instructor.socialProfile?.github && (
												<a
													href={instructor.socialProfile.github}
													target="_blank"
													rel="noopener noreferrer"
													className="text-slate-400 hover:text-slate-900 transition-colors"
													aria-label="GitHub"
												>
													<Github className="w-4 h-4" />
												</a>
											)}
											{instructor.socialProfile?.linkedin && (
												<a
													href={instructor.socialProfile.linkedin}
													target="_blank"
													rel="noopener noreferrer"
													className="text-slate-400 hover:text-blue-700 transition-colors"
													aria-label="LinkedIn"
												>
													<Linkedin className="w-4 h-4" />
												</a>
											)}
											{instructor.socialProfile?.website && (
												<a
													href={instructor.socialProfile.website}
													target="_blank"
													rel="noopener noreferrer"
													className="text-slate-400 hover:text-emerald-600 transition-colors"
													aria-label="Website"
												>
													<Globe className="w-4 h-4" />
												</a>
											)}
										</div>
									</div>
								</Card>
							))}
						</div>

						{/* Pagination */}
						{totalPages > 1 && (
							<div className="flex justify-center items-center gap-4 mt-10">
								<button
									onClick={() => setPage((p) => Math.max(0, p - 1))}
									disabled={page === 0}
									className="flex items-center gap-1 px-4 py-2 rounded-lg font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
								>
									<ChevronLeft className="w-4 h-4" /> Trước
								</button>
								<span className="text-sm text-slate-600">
									Trang {page + 1} / {totalPages}
								</span>
								<button
									onClick={() =>
										setPage((p) => Math.min(totalPages - 1, p + 1))
									}
									disabled={page >= totalPages - 1}
									className="flex items-center gap-1 px-4 py-2 rounded-lg font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
								>
									Sau <ChevronRight className="w-4 h-4" />
								</button>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
