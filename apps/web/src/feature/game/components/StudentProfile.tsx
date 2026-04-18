import { useEffect, useState } from "react";
import {
	ChevronLeft,
	ChevronRight,
	Info,
	UserPlus,
	UserMinus,
} from "lucide-react";
import studentService, {
	type PlayHistoryDetail,
	type StudentProfile,
	type PlayHistoryItem,
} from "../services/studentService";
import PlayHistoryDetailModal from "./PlayHistoryDetailModal";
import {
	useFollowStats,
	useFollowUser,
	useUnfollowUser,
} from "@/feature/user/queries/useUser";
import { useSelector } from "react-redux";
import type { RootState } from "@/shared/redux/store";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@workspace/ui/components/update/tooltip";

interface StudentProfileViewProps {
	userId: number;
	onBack: () => void;
}

const getCurriculumSummary = (item: PlayHistoryItem) =>
	[
		item.bookTitle ?? item.bookCode,
		typeof item.grade === "number" ? `Lớp ${item.grade}` : null,
		item.topicLetter ? `Chủ đề ${item.topicLetter}` : null,
		typeof item.part === "number" ? `Phần ${item.part}` : null,
	]
		.filter(Boolean)
		.join(" • ");

function StatCard({
	value,
	label,
	tooltip,
}: {
	value: string | number;
	label: string;
	tooltip?: string;
}) {
	return (
		<div className="bg-black/30 rounded-lg px-6 py-3">
			<div className="text-2xl font-bold">{value}</div>
			<div className="mt-1 flex items-center gap-1 text-sm text-gray-400">
				<span>{label}</span>
				{tooltip ? (
					<Tooltip>
						<TooltipTrigger asChild>
							<button
								type="button"
								className="text-gray-500 transition-colors hover:text-white"
								aria-label={tooltip}
							>
								<Info className="h-3.5 w-3.5" />
							</button>
						</TooltipTrigger>
						<TooltipContent sideOffset={8} className="max-w-56 text-left">
							{tooltip}
						</TooltipContent>
					</Tooltip>
				) : null}
			</div>
		</div>
	);
}

export default function StudentProfileView({
	userId,
	onBack,
}: StudentProfileViewProps) {
	const [profile, setProfile] = useState<StudentProfile | null>(null);
	const [playHistory, setPlayHistory] = useState<PlayHistoryItem[]>([]);
	const [currentPage, setCurrentPage] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [totalItems, setTotalItems] = useState(0);
	const [loading, setLoading] = useState(true);
	const [selectedHistory, setSelectedHistory] =
		useState<PlayHistoryItem | null>(null);
	const [selectedDetail, setSelectedDetail] =
		useState<PlayHistoryDetail | null>(null);
	const [detailLoading, setDetailLoading] = useState(false);

	const { data: followStats } = useFollowStats(userId);
	const followMutation = useFollowUser();
	const unfollowMutation = useUnfollowUser();
	const auth = useSelector((state: RootState) => state.auth);
	const currentUserId = auth.userInfo?.id;

	useEffect(() => {
		const loadProfile = async () => {
			try {
				const data = await studentService.getStudentProfile(userId);
				setProfile(data);
			} catch (error) {
				console.error("Failed to load profile", error);
			}
		};

		const loadPlayHistory = async (page: number) => {
			try {
				setLoading(true);
				const data = await studentService.getStudentPlayHistory(
					userId,
					page,
					12,
				);
				setPlayHistory(data.content);
				setTotalPages(data.totalPages);
				setTotalItems(data.totalItems);
			} catch (error) {
				console.error("Failed to load play history", error);
			} finally {
				setLoading(false);
			}
		};

		void loadProfile();
		void loadPlayHistory(currentPage);
	}, [userId, currentPage]);

	const handleFollowToggle = () => {
		if (followStats?.isFollowing) {
			unfollowMutation.mutate(userId);
		} else {
			followMutation.mutate(userId);
		}
	};

	const openHistoryDetail = async (item: PlayHistoryItem) => {
		setSelectedHistory(item);
		setSelectedDetail(null);
		setDetailLoading(true);
		try {
			const detail = await studentService.getStudentPlayHistoryDetail(
				userId,
				item.id,
			);
			setSelectedDetail(detail);
		} catch (error) {
			console.error("Failed to load play history detail", error);
		} finally {
			setDetailLoading(false);
		}
	};

	if (!profile) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
				<div className="text-white text-xl">Đang tải...</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
			<div className="max-w-7xl mx-auto px-6 py-8">
				<button
					type="button"
					onClick={onBack}
					className="mb-6 bg-gray-800 hover:bg-gray-700 px-6 py-2 rounded font-bold transition-colors"
				>
					← Quay lại
				</button>

				{/* Profile Header */}
				<div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-lg p-8 mb-8 shadow-2xl">
					<div className="flex items-start gap-6">
						<div className="w-24 h-24 rounded-full bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center text-4xl font-bold">
							{profile.username.charAt(0).toUpperCase()}
						</div>
						<div className="flex-1">
							<div className="flex items-center gap-4 mb-2">
								<h1 className="text-4xl font-bold">{profile.username}</h1>
								{currentUserId !== userId && (
									<button
										type="button"
										onClick={handleFollowToggle}
										disabled={
											followMutation.isPending || unfollowMutation.isPending
										}
										className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
											followStats?.isFollowing
												? "bg-gray-700 text-gray-300 hover:bg-red-900 hover:text-red-300"
												: "bg-blue-600 text-white hover:bg-blue-700"
										}`}
									>
										{followStats?.isFollowing ? (
											<>
												<UserMinus className="w-4 h-4" /> Bỏ theo dõi
											</>
										) : (
											<>
												<UserPlus className="w-4 h-4" /> Theo dõi
											</>
										)}
									</button>
								)}
							</div>
							<p className="text-gray-300 mb-4">{profile.email}</p>
							<div className="flex gap-6">
								<StatCard
									value={profile.totalScore}
									label="Điểm leaderboard"
									tooltip="Tổng điểm tốt nhất theo từng game có tính điểm, không phải tổng của mọi lượt chơi."
								/>
								<StatCard
									value={profile.gamesPlayed}
									label="Game có điểm"
									tooltip="Số game khác nhau đã có điểm được tính vào leaderboard."
								/>
								<StatCard
									value={profile.totalAttempts}
									label="Lượt chơi"
									tooltip="Tổng số lượt chơi đã ghi nhận trong lịch sử."
								/>
								{followStats && (
									<>
										<StatCard
											value={followStats.followersCount}
											label="Followers"
										/>
										<StatCard
											value={followStats.followingCount}
											label="Following"
										/>
									</>
								)}
								<StatCard
									value={new Date(profile.createdAt).toLocaleDateString()}
									label="Tham gia từ"
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Play History */}
				<div className="mb-8">
					<h2 className="text-2xl font-bold mb-6">
						Lịch sử chơi ({totalItems} lượt)
					</h2>
					{loading ? (
						<div className="text-center py-12">
							<div className="text-gray-500">Đang tải...</div>
						</div>
					) : playHistory.length > 0 ? (
						<>
							<div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
								{playHistory.map((item) => (
									<button
										key={item.id}
										type="button"
										className="bg-gray-800/50 rounded-lg overflow-hidden hover:bg-gray-800 transition-colors cursor-pointer"
										onClick={() => void openHistoryDetail(item)}
									>
										<div className="aspect-video bg-linear-to-br from-purple-600 to-blue-500 flex items-center justify-center">
											{item.gameThumbnail ? (
												<img
													src={item.gameThumbnail}
													alt={item.gameTitle}
													className="w-full h-full object-cover"
												/>
											) : (
												<span className="text-5xl">🎮</span>
											)}
										</div>
										<div className="p-4">
											<h3 className="font-bold mb-2 truncate">
												{item.gameTitle}
											</h3>
											<p className="text-xs text-emerald-300 mb-2 truncate">
												{getCurriculumSummary(item) ||
													item.questionSetTitle ||
													"Bài học chưa phân loại"}
											</p>
											<div className="text-sm text-gray-400 space-y-1">
												<div className="flex justify-between">
													<span>Trạng thái:</span>
													<span
														className={`font-bold ${
															item.completed
																? "text-emerald-400"
																: "text-amber-400"
														}`}
													>
														{item.completed ? "Hoàn thành" : "Chưa hoàn thành"}
													</span>
												</div>
												<div className="flex justify-between">
													<span>Độ chính xác:</span>
													<span className="font-bold text-emerald-400">
														{item.accuracy ?? 0}%
													</span>
												</div>
												<div className="flex justify-between">
													<span>Đúng / Sai:</span>
													<span className="font-bold text-sky-400">
														{item.correctCount ?? 0} / {item.wrongCount ?? 0}
													</span>
												</div>
												<div className="flex justify-between">
													<span>Điểm:</span>
													<span className="font-bold text-yellow-500">
														{item.score}
													</span>
												</div>
												<div className="flex justify-between">
													<span>Thời lượng:</span>
													<span className="font-bold text-blue-500">
														{Math.floor(item.duration / 60)}m{" "}
														{item.duration % 60}s
													</span>
												</div>
												<div className="text-xs text-gray-500 mt-2">
													{new Date(item.playedAt).toLocaleDateString()}
												</div>
											</div>
										</div>
									</button>
								))}
							</div>
							{totalPages > 1 && (
								<div className="flex justify-center items-center gap-4 mt-8">
									<button
										type="button"
										onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
										disabled={currentPage === 0}
										className="bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 px-4 py-2 rounded font-bold transition-colors"
									>
										<ChevronLeft className="w-5 h-5" />
									</button>
									<span className="text-gray-400">
										Page {currentPage + 1} of {totalPages}
									</span>
									<button
										type="button"
										onClick={() =>
											setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
										}
										disabled={currentPage >= totalPages - 1}
										className="bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 px-4 py-2 rounded font-bold transition-colors"
									>
										<ChevronRight className="w-5 h-5" />
									</button>
								</div>
							)}
						</>
					) : (
						<div className="text-center py-12 bg-gray-800/30 rounded-lg">
							<div className="text-5xl mb-4">🎮</div>
							<p className="text-gray-500">No play history yet</p>
						</div>
					)}
				</div>
			</div>
			<PlayHistoryDetailModal
				open={selectedHistory !== null}
				onClose={() => {
					setSelectedHistory(null);
					setSelectedDetail(null);
				}}
				item={selectedHistory}
				detail={selectedDetail}
				loading={detailLoading}
			/>
		</div>
	);
}
