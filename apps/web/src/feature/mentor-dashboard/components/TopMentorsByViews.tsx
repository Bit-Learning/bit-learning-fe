import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@workspace/ui/components/Avatar";
import { useGetTopMentorsByViews } from "../queries/useMentorStats";
import type { MentorWithViewsResponse } from "../types/mentor.type";

function MentorRow({
	mentor,
	rank,
}: {
	mentor: MentorWithViewsResponse;
	rank: number;
}) {
	const isTop3 = rank <= 3;
	const rankColors = ["text-yellow-500", "text-gray-400", "text-amber-600"];

	return (
		<div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
			<span
				className={`w-6 text-center font-semibold text-sm shrink-0 ${isTop3 ? rankColors[rank - 1] : "text-gray-400"}`}
			>
				{rank}
			</span>
			<Avatar className="h-14 w-14 rounded-xl">
				<AvatarImage src={mentor.avatar} />
				<AvatarFallback className="rounded-xl bg-linear-to-br from-blue-500 to-violet-500 text-sm font-semibold text-white">
					{mentor.firstName?.charAt(0) ?? "M"}
				</AvatarFallback>
			</Avatar>
			<div className="flex-1 min-w-0">
				<p className="font-medium text-sm text-gray-900 truncate">
					{mentor.firstName + " " + mentor.lastName}
				</p>
				<p className="text-xs text-gray-500 truncate">{mentor.email}</p>
			</div>
			<div className="flex items-center gap-1 shrink-0">
				<svg
					className="w-4 h-4 text-blue-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
					/>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
					/>
				</svg>
				<span className="text-sm font-semibold text-gray-700">
					{mentor.totalViews.toLocaleString()}
				</span>
			</div>
		</div>
	);
}

interface TopMentorsByViewsProps {
	limit?: number;
}

export function TopMentorsByViews({ limit = 5 }: TopMentorsByViewsProps) {
	const { data, isLoading, isError } = useGetTopMentorsByViews(limit);

	return (
		<div className="bg-white rounded-xl border border-gray-200 p-5">
			<div className="flex items-center justify-between mb-4">
				<div>
					<h3 className="font-semibold text-gray-900">
						Giảng viên có bài viết nhiều lượt xem nhất
					</h3>
					<p className="text-xs text-gray-500 mt-0.5">
						Tổng lượt xem trên tất cả bài đăng
					</p>
				</div>
				<span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full shrink-0">
					Top {limit}
				</span>
			</div>

			{isLoading && (
				<div className="space-y-3">
					{Array.from({ length: limit }).map((_, i) => (
						<div key={i} className="flex items-center gap-3 animate-pulse">
							<div className="w-6 h-4 bg-gray-200 rounded" />
							<div className="w-10 h-10 bg-gray-200 rounded-full" />
							<div className="flex-1 space-y-2">
								<div className="h-3 bg-gray-200 rounded w-3/4" />
								<div className="h-3 bg-gray-200 rounded w-1/2" />
							</div>
							<div className="w-16 h-4 bg-gray-200 rounded" />
						</div>
					))}
				</div>
			)}

			{isError && (
				<p className="text-sm text-red-500 text-center py-4">
					Không thể tải dữ liệu. Vui lòng thử lại.
				</p>
			)}

			{data && data.length === 0 && (
				<p className="text-sm text-gray-500 text-center py-4">
					Chưa có dữ liệu.
				</p>
			)}

			{data && data.length > 0 && (
				<div>
					{data.map((mentor, index) => (
						<MentorRow key={mentor.id} mentor={mentor} rank={index + 1} />
					))}
				</div>
			)}
		</div>
	);
}
