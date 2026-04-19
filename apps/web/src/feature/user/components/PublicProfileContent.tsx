import { useEffect, useState } from "react";
import {
	MapPin,
	Briefcase,
	ChevronLeft,
	ChevronRight,
	Gamepad2,
	Info,
	Trophy,
	Users,
	FileText,
	ArrowRight,
	BookA,
} from "lucide-react";
import { Card } from "@workspace/ui/components/Card";
import { useViewUserProfileByUsername } from "../queries/useUser";
import studentService, {
	type PlayHistoryDetail,
	type PlayHistoryItem,
} from "@/feature/game/services/studentService";
import type { StudentProfile } from "@/feature/game/services/studentService";
import Loader from "@workspace/ui/components/loader/TerminalLoader";
import { FaFacebook } from "react-icons/fa";
import { useForumPostsByAuthor } from "@/feature/forum/queries/useForum";
import ForumPostCard from "@/feature/app/components/ForumPostCard";
import { Link } from "@tanstack/react-router";
import PlayHistoryDetailModal from "@/feature/game/components/PlayHistoryDetailModal";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@workspace/ui/components/update/tooltip";

interface PublicProfileContentProps {
	username: string;
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
	icon: Icon,
	value,
	label,
	tooltip,
	iconClassName,
}: {
	icon: typeof Trophy;
	value: string | number;
	label: string;
	tooltip?: string;
	iconClassName: string;
}) {
	return (
		<Card className="p-5 text-center">
			<Icon className={`mx-auto mb-2 h-6 w-6 ${iconClassName}`} />
			<div className="text-3xl font-bold text-slate-900">{value}</div>
			<div className="mt-1 flex items-center justify-center gap-1 text-xs text-slate-500">
				<span>{label}</span>
				{tooltip ? (
					<Tooltip>
						<TooltipTrigger asChild>
							<button
								type="button"
								className="text-slate-400 transition-colors hover:text-slate-600"
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
		</Card>
	);
}

export const PublicProfileContent = ({
	username,
}: PublicProfileContentProps) => {
	const { data: userProfile, isLoading } =
		useViewUserProfileByUsername(username);
	const userId = userProfile?.id;
	const { data: myPostsResponse, isLoading: isPostsLoading } =
		useForumPostsByAuthor({
			authorId: userId ?? 0,
			page: 0,
			size: 6,
		});

	// Game metadata
	const [gameProfile, setGameProfile] = useState<StudentProfile | null>(null);
	const [playHistory, setPlayHistory] = useState<PlayHistoryItem[]>([]);
	const [historyPage, setHistoryPage] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [totalItems, setTotalItems] = useState(0);
	const [historyLoading, setHistoryLoading] = useState(false);
	const [selectedHistory, setSelectedHistory] =
		useState<PlayHistoryItem | null>(null);
	const [selectedDetail, setSelectedDetail] =
		useState<PlayHistoryDetail | null>(null);
	const [detailLoading, setDetailLoading] = useState(false);

	useEffect(() => {
		if (!userId) return;
		studentService
			.getStudentProfile(userId)
			.then(setGameProfile)
			.catch(() => {});
	}, [userId]);

	useEffect(() => {
		if (!userId) return;
		setHistoryLoading(true);
		studentService
			.getStudentPlayHistory(userId, historyPage, 8)
			.then((data) => {
				setPlayHistory(data.content);
				setTotalPages(data.totalPages);
				setTotalItems(data.totalItems);
			})
			.catch(() => {})
			.finally(() => setHistoryLoading(false));
	}, [userId, historyPage]);

	const openHistoryDetail = async (item: PlayHistoryItem) => {
		if (!userId) return;
		setSelectedHistory(item);
		setSelectedDetail(null);
		setDetailLoading(true);
		try {
			const detail = await studentService.getStudentPlayHistoryDetail(
				userId,
				item.id,
			);
			setSelectedDetail(detail);
		} catch {
			setSelectedDetail(null);
		} finally {
			setDetailLoading(false);
		}
	};

	if (isLoading) return <Loader />;
	if (!userProfile)
		return (
			<div className="text-center py-12 text-slate-500">
				Không tìm thấy người dùng.
			</div>
		);

	const fullName =
		`${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim();
	const myPosts = myPostsResponse?.data ?? [];
	const totalAttempts = gameProfile?.totalAttempts ?? totalItems;

	return (
		<div className="grow space-y-6 w-full">
			{/* Profile Header Card */}
			<Card>
				<div className="relative w-full aspect-video">
					<img
						alt="Cover"
						className="w-full h-full object-cover -mt-6 rounded-t-xl"
						src={userProfile.coverImage || "/graybg.jpg"}
					/>
				</div>
				<div className="px-8 pb-0">
					<div className="flex flex-col md:flex-row items-end gap-6 relative">
						<div className="relative group px-6">
							<div className="size-32 md:size-40 rounded-full overflow-hidden">
								<img
									alt="Avatar"
									className="w-full h-full object-cover"
									src={userProfile.avatar || "/default-avatar.jpg"}
								/>
							</div>
						</div>

						<div className="grow flex flex-col md:flex-row items-center md:items-end justify-between gap-6 w-full md:pb-2">
							<div className="text-center md:text-left max-w-xl">
								{/* Name */}
								<h1 className="text-2xl font-bold text-slate-900">
									{fullName || "Người dùng"}
								</h1>

								{/* Bio */}
								{userProfile.bio && (
									<p className="mt-2 text-slate-600 leading-relaxed">
										{userProfile.bio}
									</p>
								)}

								{/* Info list */}
								<div className="mt-4 space-y-2 text-sm text-slate-700">
									{userProfile.location && (
										<div className="flex items-center gap-2 justify-center md:justify-start">
											<MapPin className="w-4 h-4 text-slate-400" />
											<span>{userProfile.location}</span>
										</div>
									)}

									{userProfile.jobTitle && (
										<div className="flex items-center gap-2 justify-center md:justify-start">
											<Briefcase className="w-4 h-4 text-slate-400" />
											<span>{userProfile.jobTitle}</span>
										</div>
									)}

									{userProfile.socialProfile?.facebook && (
										<div className="flex items-center gap-2 justify-center md:justify-start">
											<FaFacebook className="w-4 h-4 text-blue-500" />
											<a
												href={userProfile.socialProfile.facebook}
												target="_blank"
												rel="noopener"
												className="hover:underline text-blue-600 break-all"
											>
												{userProfile.socialProfile.facebook}
											</a>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</Card>

			{/* Stats Row */}
			<div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
				<StatCard
					icon={Trophy}
					value={gameProfile?.totalScore ?? 0}
					label="Tổng điểm leaderboard"
					tooltip="Gồm tổng điểm tốt nhất của từng game có tính điểm trên toàn hệ thống, hiện là cả QUIZ và MATCHING. Không phải tổng của mọi lượt chơi, và không phải điểm của riêng một tab leaderboard."
					iconClassName="text-yellow-500"
				/>
				<StatCard
					icon={Users}
					value={gameProfile?.gamesPlayed ?? 0}
					label="Game có điểm"
					tooltip="Số game khác nhau đã có điểm được tính vào leaderboard tổng, gồm các game QUIZ và MATCHING mà người dùng có best score hợp lệ."
					iconClassName="text-blue-500"
				/>
				<StatCard
					icon={Gamepad2}
					value={totalAttempts}
					label="Lượt chơi"
					tooltip="Tổng số lượt chơi đã ghi nhận trong lịch sử. Con số này có thể lớn hơn số game có điểm vì một game có thể được chơi nhiều lần."
					iconClassName="text-indigo-500"
				/>
				<StatCard
					icon={BookA}
					value={myPosts.length}
					label="Các bài viết"
					iconClassName="text-green-500"
				/>
			</div>

			<Card className="p-6 space-y-6">
				<div className="flex items-center justify-between gap-4">
					<div>
						<h3 className="font-bold text-slate-900">
							Bài viết của {fullName || "người dùng"}
						</h3>
						<p className="text-sm text-slate-500">
							Các bài viết đã chia sẻ trên diễn đàn
						</p>
					</div>
					<Link
						to="/forum"
						search={{
							authorId: userId ?? 0,
						}}
						className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
					>
						Xem tất cả
						<ArrowRight className="h-4 w-4" />
					</Link>
				</div>

				{isPostsLoading ? (
					<Loader />
				) : myPosts.length === 0 ? (
					<div className="rounded-xl border border-dashed border-slate-200 p-10 text-center">
						<FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" />
						<h4 className="text-lg font-semibold text-slate-900">
							Chưa có bài viết nào
						</h4>
						<p className="mt-2 text-sm text-slate-500">
							Người dùng này chưa chia sẻ bài viết nào trên diễn đàn.
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
						{myPosts.map((post) => (
							<ForumPostCard key={post.id} post={post} />
						))}
					</div>
				)}
			</Card>

			{/* Play History */}
			<Card className="p-6">
				<div className="flex items-center gap-3 mb-6">
					<h3 className="font-bold text-slate-900">
						Lịch sử chơi ({totalItems} lượt)
					</h3>
				</div>

				{historyLoading ? (
					<Loader />
				) : playHistory.length > 0 ? (
					<>
						<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
							{playHistory.map((item) => (
								<button
									type="button"
									key={item.id}
									className="overflow-hidden rounded-xl border border-slate-100 text-left transition-shadow hover:shadow-md"
									onClick={() => void openHistoryDetail(item)}
								>
									<div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
										{item.gameThumbnail ? (
											<img
												src={item.gameThumbnail}
												alt={item.gameTitle}
												className="w-full h-full object-cover"
											/>
										) : (
											<span className="text-4xl">🎮</span>
										)}
									</div>
									<div className="p-3">
										<h4 className="font-semibold text-sm text-slate-800 truncate">
											{item.gameTitle}
										</h4>
										<div className="mt-1 truncate text-[11px] text-emerald-600">
											{getCurriculumSummary(item) ||
												item.questionSetTitle ||
												"Bài học chưa phân loại"}
										</div>
										<div className="mt-2 flex justify-between text-xs text-slate-500">
											<span>
												Accuracy:{" "}
												<span className="font-bold text-emerald-600">
													{item.accuracy ?? 0}%
												</span>
											</span>
											<span>
												{Math.floor(item.duration / 60)}m {item.duration % 60}s
											</span>
										</div>
										<div className="mt-1 flex justify-between text-xs text-slate-500">
											<span>
												Đúng/Sai:{" "}
												<span className="font-bold text-sky-600">
													{item.correctCount ?? 0}/{item.wrongCount ?? 0}
												</span>
											</span>
											<span>
												<span
													className={`font-bold ${
														item.completed
															? "text-emerald-600"
															: "text-amber-600"
													}`}
												>
													{item.completed ? "Hoàn thành" : "Chưa hoàn thành"}
												</span>
											</span>
										</div>
										<div className="mt-1 text-xs text-slate-500">
											Điểm:{" "}
											<span className="font-bold text-yellow-600">
												{item.score}
											</span>
										</div>
										<div className="text-[11px] text-slate-400 mt-1">
											{new Date(item.playedAt).toLocaleDateString("vi-VN")}
										</div>
									</div>
								</button>
							))}
						</div>
						{totalPages > 1 && (
							<div className="flex justify-center items-center gap-4 mt-6">
								<button
									type="button"
									onClick={() => setHistoryPage((p) => Math.max(0, p - 1))}
									disabled={historyPage === 0}
									className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
								>
									<ChevronLeft className="w-4 h-4" />
								</button>
								<span className="text-sm text-slate-500">
									Trang {historyPage + 1} / {totalPages}
								</span>
								<button
									type="button"
									onClick={() =>
										setHistoryPage((p) => Math.min(totalPages - 1, p + 1))
									}
									disabled={historyPage >= totalPages - 1}
									className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
								>
									<ChevronRight className="w-4 h-4" />
								</button>
							</div>
						)}
					</>
				) : (
					<div className="text-center py-8">
						<Gamepad2 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
						<p className="text-slate-400 text-sm">Chưa có dữ liệu.</p>
					</div>
				)}
			</Card>
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
};
