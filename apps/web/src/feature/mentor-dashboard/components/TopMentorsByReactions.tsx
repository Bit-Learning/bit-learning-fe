import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@workspace/ui/components/Avatar";
import { useGetTopMentorsByReactions } from "../queries/useMentorStats";
import type { MentorWithReactionsResponse } from "../types/mentor.type";

function MentorRow({
	mentor,
	rank,
}: {
	mentor: MentorWithReactionsResponse;
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
					className="w-4 h-4 text-pink-500"
					fill="currentColor"
					viewBox="0 0 24 24"
				>
					<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
				</svg>
				<span className="text-sm font-semibold text-gray-700">
					{mentor.totalReactions.toLocaleString()}
				</span>
			</div>
		</div>
	);
}

interface TopMentorsByReactionsProps {
	limit?: number;
}

export function TopMentorsByReactions({
	limit = 5,
}: TopMentorsByReactionsProps) {
	const { data, isLoading, isError } = useGetTopMentorsByReactions(limit);

	return (
		<div className="bg-white rounded-xl border border-gray-200 p-5">
			<div className="flex items-center justify-between mb-4">
				<div>
					<h3 className="font-semibold text-gray-900">
						Giảng viên có bài viết nhiều tương tác nhất
					</h3>
					<p className="text-xs text-gray-500 mt-0.5">
						Tổng lượt react trên tất cả bài đăng
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
