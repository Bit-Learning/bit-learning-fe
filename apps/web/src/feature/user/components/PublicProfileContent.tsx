import { useEffect, useState } from "react";
import {
	MapPin,
	Briefcase,
	Calendar,
	UserPlus,
	UserMinus,
	ChevronLeft,
	ChevronRight,
	Gamepad2,
	Trophy,
	Users,
} from "lucide-react";
import { Card } from "@workspace/ui/components/Card";
import {
	Avatar,
	AvatarImage,
	AvatarFallback,
} from "@workspace/ui/components/Avatar";
import { Button } from "@workspace/ui/components/Button";
import {
	useViewUserProfile,
	useFollowStats,
	useFollowUser,
	useUnfollowUser,
} from "../queries/useUser";
import { useSelector } from "react-redux";
import type { RootState } from "@/shared/redux/store";
import studentService, {
	type PlayHistoryItem,
} from "@/feature/game/services/studentService";
import type { StudentProfile } from "@/feature/game/services/studentService";
import Loader from "@workspace/ui/components/loader/TerminalLoader";

interface PublicProfileContentProps {
	userId: number;
}

export const PublicProfileContent = ({ userId }: PublicProfileContentProps) => {
	const { data: userProfile, isLoading } = useViewUserProfile(userId);
	const { data: followStats } = useFollowStats(userId);
	const followMutation = useFollowUser();
	const unfollowMutation = useUnfollowUser();
	const auth = useSelector((state: RootState) => state.auth);
	const currentUserId = auth.userInfo?.id;
	const isOwnProfile = currentUserId === userId;

	// Game metadata
	const [gameProfile, setGameProfile] = useState<StudentProfile | null>(null);
	const [playHistory, setPlayHistory] = useState<PlayHistoryItem[]>([]);
	const [historyPage, setHistoryPage] = useState(0);
	const [totalPages, setTotalPages] = useState(0);
	const [totalItems, setTotalItems] = useState(0);
	const [historyLoading, setHistoryLoading] = useState(false);

	useEffect(() => {
		studentService
			.getStudentProfile(userId)
			.then(setGameProfile)
			.catch(() => {});
	}, [userId]);

	useEffect(() => {
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

	const handleFollowToggle = () => {
		if (followStats?.isFollowing) {
			unfollowMutation.mutate(userId);
		} else {
			followMutation.mutate(userId);
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
	const joinedDate = userProfile.createdAt
		? new Date(userProfile.createdAt).toLocaleDateString("vi-VN", {
				month: "long",
				year: "numeric",
			})
		: "";

	return (
		<div className="grow space-y-6 w-full">
			{/* Profile Header Card */}
			<Card>
				<div className="relative h-48 md:h-56">
					<img
						alt="Cover"
						className="w-full h-full object-cover -mt-6 rounded-t-xl"
						src={userProfile.coverImage || "/user_no_wallpaper.jpg"}
					/>
				</div>
				<div className="px-8 pb-8">
					<div className="flex flex-col md:flex-row items-end gap-6 -mt-16 relative">
						<div className="relative">
							<Avatar className="size-32 md:size-36 border-4 border-white shadow-xl">
								<AvatarImage
									src={userProfile.avatar || "/default-avatar.jpg"}
								/>
								<AvatarFallback className="text-3xl">
									{userProfile.firstName?.charAt(0) || "U"}
								</AvatarFallback>
							</Avatar>
						</div>
						<div className="grow flex flex-col md:flex-row items-center md:items-end justify-between gap-4 w-full md:pb-2">
							<div className="text-center md:text-left">
								<h1 className="text-2xl font-bold text-slate-900">
									{fullName || "Người dùng"}
								</h1>
								{userProfile.jobTitle && (
									<p className="text-slate-500 font-medium">
										{userProfile.jobTitle}
									</p>
								)}
								<div className="flex items-center gap-4 mt-2 text-sm text-slate-400 flex-wrap justify-center md:justify-start">
									{userProfile.location && (
										<span className="flex items-center gap-1">
											<MapPin className="w-3.5 h-3.5" />
											{userProfile.location}
										</span>
									)}
									<span className="flex items-center gap-1">
										<Calendar className="w-3.5 h-3.5" />
										Tham gia từ {joinedDate}
									</span>
								</div>
							</div>
							{!isOwnProfile && (
								<Button
									onPress={handleFollowToggle}
									isDisabled={
										followMutation.isPending || unfollowMutation.isPending
									}
									variant={followStats?.isFollowing ? "outline" : "default"}
									className="shrink-0"
								>
									{followStats?.isFollowing ? (
										<>
											<UserMinus className="w-4 h-4 mr-2" />
											Bỏ theo dõi
										</>
									) : (
										<>
											<UserPlus className="w-4 h-4 mr-2" />
											Theo dõi
										</>
									)}
								</Button>
							)}
						</div>
					</div>
				</div>
			</Card>

			{/* Stats Row */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				<Card className="p-5 text-center">
					<Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
					<div className="text-2xl font-bold text-slate-900">
						{gameProfile?.totalScore ?? 0}
					</div>
					<div className="text-xs text-slate-500 mt-1">Tổng điểm</div>
				</Card>
				<Card className="p-5 text-center">
					<Gamepad2 className="w-6 h-6 text-blue-500 mx-auto mb-2" />
					<div className="text-2xl font-bold text-slate-900">
						{gameProfile?.gamesPlayed ?? 0}
					</div>
					<div className="text-xs text-slate-500 mt-1">Game đã chơi</div>
				</Card>
				<Card className="p-5 text-center">
					<Users className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
					<div className="text-2xl font-bold text-slate-900">
						{followStats?.followersCount ?? 0}
					</div>
					<div className="text-xs text-slate-500 mt-1">Người theo dõi</div>
				</Card>
				<Card className="p-5 text-center">
					<Users className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
					<div className="text-2xl font-bold text-slate-900">
						{followStats?.followingCount ?? 0}
					</div>
					<div className="text-xs text-slate-500 mt-1">Đang theo dõi</div>
				</Card>
			</div>

			{/* Bio */}
			{userProfile.bio && (
				<Card className="p-6">
					<h3 className="font-bold text-slate-900 mb-2">Giới thiệu</h3>
					<p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
						{userProfile.bio}
					</p>
				</Card>
			)}

			{/* Play History */}
			<Card className="p-6">
				<div className="flex items-center gap-3 mb-6">
					<Gamepad2 className="w-5 h-5 text-primary" />
					<h3 className="font-bold text-slate-900">
						Lịch sử chơi game ({totalItems})
					</h3>
				</div>

				{historyLoading ? (
					<div className="text-center py-8 text-slate-400">Đang tải...</div>
				) : playHistory.length > 0 ? (
					<>
						<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
							{playHistory.map((item) => (
								<div
									key={item.id}
									className="rounded-xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
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
										<div className="flex justify-between text-xs text-slate-500 mt-2">
											<span>
												Điểm:{" "}
												<span className="font-bold text-yellow-600">
													{item.score}
												</span>
											</span>
											<span>
												{Math.floor(item.duration / 60)}m {item.duration % 60}s
											</span>
										</div>
										<div className="text-[11px] text-slate-400 mt-1">
											{new Date(item.playedAt).toLocaleDateString("vi-VN")}
										</div>
									</div>
								</div>
							))}
						</div>
						{totalPages > 1 && (
							<div className="flex justify-center items-center gap-4 mt-6">
								<button
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
						<p className="text-slate-400 text-sm">Chưa có lịch sử chơi game.</p>
					</div>
				)}
			</Card>
		</div>
	);
};
