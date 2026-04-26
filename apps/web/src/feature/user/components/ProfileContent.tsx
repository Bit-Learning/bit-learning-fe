import ForumPostCard from "@/feature/app/components/ForumPostCard";
import { useForumPostsByAuthor } from "@/feature/forum/queries/useForum";
import PlayHistoryDetailModal from "@/feature/game/components/PlayHistoryDetailModal";
import studentService, {
	type PlayHistoryDetail,
	type PlayHistoryItem,
} from "@/feature/game/services/studentService";
import type { Post } from "@/feature/forum/types/forum.type";
import { Link } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/Button";
import { Card } from "@workspace/ui/components/Card";
import { Input } from "@workspace/ui/components/Input";
import Loader from "@workspace/ui/components/loader/TerminalLoader";
import {
	ArrowRight,
	Briefcase,
	Camera,
	ChevronLeft,
	ChevronRight,
	Edit,
	Facebook,
	FileText,
	Gamepad2,
	Github,
	Globe,
	GraduationCap,
	Instagram,
	LayoutGrid,
	Linkedin,
	MapPin,
	Phone,
	Save,
	Settings,
	Twitter,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
	useUpdateUserProfile,
	useUploadAvatar,
	useUploadCoverImage,
	useUserProfile,
} from "../queries/useUser";
import type {
	TSocialProfile,
	TUpdateUserRequest,
	TUserProfile,
} from "../types/user.type";
import { SOCIAL_VALIDATORS, SocialInput } from "./SocialInput";

type ProfileTabKey = "all" | "post" | "history";

const getCurriculumSummary = (item: PlayHistoryItem) =>
	[
		item.bookTitle ?? item.bookCode,
		typeof item.grade === "number" ? `Lớp ${item.grade}` : null,
		item.topicLetter ? `Chủ đề ${item.topicLetter}` : null,
		typeof item.part === "number" ? `Phần ${item.part}` : null,
	]
		.filter(Boolean)
		.join(" • ");

export const PROFILE_TABS: Array<{
	key: ProfileTabKey;
	label: string;
	icon: typeof LayoutGrid;
	description: string;
}> = [
	{
		key: "all",
		label: "Tất cả",
		icon: LayoutGrid,
		description: "",
	},
	{
		key: "post",
		label: "Các bài viết",
		icon: FileText,
		description: "",
	},
	{
		key: "history",
		label: "Lịch sử chơi",
		icon: Gamepad2,
		description: "",
	},
];

export const ProfileContent = () => {
	const { data: userProfile, isLoading } = useUserProfile();
	const updateProfileMutation = useUpdateUserProfile();
	const uploadAvatarMutation = useUploadAvatar();
	const uploadCoverMutation = useUploadCoverImage();

	const [formData, setFormData] = useState<Partial<TUserProfile>>({});
	const [isEditing, setIsEditing] = useState(false);
	const [activeTab, setActiveTab] = useState<ProfileTabKey>("all");
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

	const { data: myPostsResponse, isLoading: isPostsLoading } =
		useForumPostsByAuthor({
			authorId: userProfile?.id ?? 0,
			page: 0,
			size: 6,
		});

	useEffect(() => {
		if (userProfile) {
			setFormData(userProfile);
		}
	}, [userProfile]);

	useEffect(() => {
		if (!userProfile?.id) return;
		setHistoryLoading(true);
		studentService
			.getStudentPlayHistory(userProfile.id, historyPage, 8)
			.then((data) => {
				setPlayHistory(data.content);
				setTotalPages(data.totalPages);
				setTotalItems(data.totalItems);
			})
			.catch(() => {
				setPlayHistory([]);
				setTotalPages(0);
				setTotalItems(0);
			})
			.finally(() => setHistoryLoading(false));
	}, [userProfile?.id, historyPage]);

	const hasSocialErrors = () => {
		const sp = formData.socialProfile;
		if (!sp) return false;
		for (const [key, validator] of Object.entries(SOCIAL_VALIDATORS)) {
			const val = sp[key as keyof TSocialProfile]?.trim();
			if (val && !validator.pattern.test(val)) return true;
		}
		return false;
	};

	const handleSave = () => {
		if (hasSocialErrors()) return;
		const currentUsername = userProfile?.username?.trim() ?? "";
		const nextUsername = formData.username?.trim() ?? "";
		const payload: TUpdateUserRequest = {
			grade: formData.grade ?? 0,
			firstName: formData.firstName,
			lastName: formData.lastName,
			pronouns: formData.pronouns,
			bio: formData.bio,
			phoneNumber: formData.phoneNumber,
			location: formData.location,
			socialProfile: formData.socialProfile,
			jobTitle: isMentor ? formData.jobTitle : undefined,
			specialties: isMentor ? (formData.specialties ?? undefined) : undefined,
			yearsOfExperience: isMentor
				? (formData.yearsOfExperience ?? undefined)
				: undefined,
			company: isMentor ? (formData.company ?? undefined) : undefined,
			studentsCount: isMentor
				? (formData.studentsCount ?? undefined)
				: undefined,
			coursesCount: isMentor ? (formData.coursesCount ?? undefined) : undefined,
		};

		if (nextUsername && nextUsername !== currentUsername) {
			payload.username = nextUsername;
		}

		updateProfileMutation.mutate(payload, {
			onSuccess: () => setIsEditing(false),
		});
	};

	const handleCancel = () => {
		setFormData(userProfile || {});
		setIsEditing(false);
	};

	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) uploadAvatarMutation.mutate(file);
	};

	const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) uploadCoverMutation.mutate(file);
	};

	const handleFieldChange = (field: keyof TUserProfile, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSocialChange = (field: keyof TSocialProfile, value: string) => {
		setFormData((prev) => ({
			...prev,
			socialProfile: { ...prev.socialProfile, [field]: value },
		}));
	};

	const openHistoryDetail = async (item: PlayHistoryItem) => {
		if (!userProfile?.id) return;
		setSelectedHistory(item);
		setSelectedDetail(null);
		setDetailLoading(true);
		try {
			const detail = await studentService.getStudentPlayHistoryDetail(
				userProfile.id,
				item.id,
			);
			setSelectedDetail(detail);
		} catch {
			setSelectedDetail(null);
		} finally {
			setDetailLoading(false);
		}
	};

	if (isLoading) {
		return <Loader />;
	}

	const fullName =
		`${formData.firstName || ""} ${formData.lastName || ""}`.trim();

	const isMentor = formData.role === "MENTOR";
	const myPosts: Post[] = myPostsResponse?.data ?? [];

	return (
		<div className="grow space-y-8 w-full">
			<Card>
				<div className="relative w-full aspect-video">
					<img
						alt="Cover"
						className="w-full h-full object-cover -mt-6 rounded-t-xl"
						src={formData.coverImage || "/graybg.jpg"}
					/>
					{isEditing && (
						<label className="absolute top-4 right-4">
							<span className="inline-flex items-center gap-1.5 justify-center whitespace-nowrap rounded-sm text-md font-medium h-7 px-2 bg-white/90 backdrop-blur cursor-pointer border shadow-sm hover:bg-white transition-all">
								<Camera className="w-4 h-4" />
								Thay đổi ảnh bìa
							</span>
							<input
								className="hidden"
								type="file"
								onChange={handleCoverChange}
								accept="image/*"
							/>
						</label>
					)}
				</div>

				<div className="px-0 pb-0">
					<div className="flex flex-col md:flex-row items-end gap-6 relative">
						<div className="relative group px-6">
							<div className="size-32 md:size-40 rounded-full overflow-hidden">
								<img
									alt="Avatar"
									className="w-full h-full object-cover"
									src={formData.avatar || "/default-avatar.jpg"}
								/>
							</div>
							{isEditing && (
								<label className="absolute bottom-2 right-2 size-9 rounded-full bg-primary text-white border-2 border-white flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform">
									<Edit className="w-4 h-4" />
									<input
										className="hidden"
										type="file"
										onChange={handleAvatarChange}
										accept="image/*"
									/>
								</label>
							)}
						</div>

						<div className="grow flex flex-col md:flex-row items-center md:items-end justify-between gap-6 w-full md:pb-2">
							<div className="text-center md:text-left max-w-xl">
								<h1 className="text-2xl font-bold text-slate-900">
									{fullName || "Người dùng"}
								</h1>

								{formData.bio && (
									<p className="mt-2 text-slate-600 leading-relaxed">
										{formData.bio}
									</p>
								)}

								<div className="mt-4 space-y-2 text-sm text-slate-700">
									{formData.location && (
										<div className="flex items-center gap-2 justify-center md:justify-start">
											<MapPin className="w-4 h-4 text-slate-400" />
											<span>{formData.location}</span>
										</div>
									)}

									{isMentor && formData.jobTitle && (
										<div className="flex items-center gap-2 justify-center md:justify-start">
											<Briefcase className="w-4 h-4 text-slate-400" />
											<span>{formData.jobTitle}</span>
										</div>
									)}

									{formData.socialProfile?.facebook && (
										<div className="flex items-center gap-2 justify-center md:justify-start">
											<Facebook className="w-4 h-4 text-blue-500" />
											<a
												href={formData.socialProfile.facebook}
												target="_blank"
												className="hover:underline text-blue-600 break-all"
											>
												{formData.socialProfile.facebook}
											</a>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
					<div className="border-t-2 mt-6" />
					<div className="mt-6 flex px-6">
						{PROFILE_TABS.map((tab) => {
							const isActive = activeTab === tab.key;
							return (
								<button
									key={tab.key}
									type="button"
									onClick={() => setActiveTab(tab.key)}
									className={`flex items-start gap-3 rounded-none px-4 py-3 text-left transition-all ${
										isActive
											? "text-primary"
											: "bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
									}`}
									title={tab.description}
								>
									<div className="text-md font-bold">{tab.label}</div>
								</button>
							);
						})}
					</div>
				</div>
			</Card>

			{activeTab === "all" && (
				<div className="space-y-6">
					<Card className="p-8 md:p-10">
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-2xl font-bold text-slate-900">
								Thông tin cá nhân
							</h2>

							{isEditing ? (
								<div className="flex gap-3">
									<Button
										variant="outline"
										onClick={handleCancel}
										className="p-5 text-md border-slate-400"
									>
										Hủy bỏ
									</Button>
									<Button
										onClick={handleSave}
										isDisabled={updateProfileMutation.isPending}
										className="p-5 text-md bg-blue-600 text-white"
									>
										<Save className="w-4 h-4 mr-2" />
										{updateProfileMutation.isPending
											? "Đang lưu..."
											: "Lưu thay đổi"}
									</Button>
								</div>
							) : (
								<Button
									variant="ghost"
									onClick={() => setIsEditing(true)}
									className="p-5 text-md bg-stale-900 text-black"
								>
									<Settings className="w-5 h-5 mr-2" />
									Chỉnh sửa
								</Button>
							)}
						</div>

						<div className="space-y-8">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
								<div className="space-y-3">
									<label className="text-md font-semibold text-slate-700">
										Tên hiển thị
									</label>
									<div className="relative">
										<span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 font-medium">
											@
										</span>
										<Input
											className="pl-9"
											value={formData.username || ""}
											onChange={(e) =>
												handleFieldChange("username", e.target.value)
											}
											placeholder="Nhập tên người dùng"
											disabled={!isEditing}
										/>
									</div>
								</div>

								<div className="space-y-2">
									<label className="text-md font-semibold text-slate-700">
										Email
									</label>
									<Input value={formData.email || ""} disabled />
								</div>

								<div className="space-y-2">
									<label className="text-md font-semibold text-slate-700">
										Họ
									</label>
									<Input
										value={formData.firstName || ""}
										onChange={(e) =>
											handleFieldChange("firstName", e.target.value)
										}
										disabled={!isEditing}
									/>
								</div>

								<div className="space-y-2">
									<label className="text-md font-semibold text-slate-700">
										Tên
									</label>
									<Input
										value={formData.lastName || ""}
										onChange={(e) =>
											handleFieldChange("lastName", e.target.value)
										}
										disabled={!isEditing}
									/>
								</div>

								<div className="space-y-2">
									<label className="text-md font-semibold text-slate-700">
										Đại từ nhân xưng
									</label>
									<Input
										value={formData.pronouns || ""}
										onChange={(e) =>
											handleFieldChange("pronouns", e.target.value)
										}
										placeholder="he/him, she/her, they/them"
										disabled={!isEditing}
									/>
								</div>

								<div className="space-y-2">
									<label className="text-md font-semibold text-slate-700">
										Số điện thoại
									</label>
									<div className="relative">
										<Phone className="absolute inset-y-0 left-0 flex items-center ml-4 mt-2 text-slate-400 w-5 h-5" />
										<Input
											className="pl-11"
											value={formData.phoneNumber || ""}
											onChange={(e) =>
												handleFieldChange("phoneNumber", e.target.value)
											}
											disabled={!isEditing}
										/>
									</div>
								</div>

								<div className="space-y-2">
									<label className="text-md font-semibold text-slate-700">
										Vị trí
									</label>
									<div className="relative">
										<MapPin className="absolute inset-y-0 left-0 flex items-center ml-4 mt-2 text-slate-400 w-5 h-5" />
										<Input
											className="pl-11"
											value={formData.location || ""}
											onChange={(e) =>
												handleFieldChange("location", e.target.value)
											}
											disabled={!isEditing}
										/>
									</div>
								</div>

								{!isMentor && (
									<div className="space-y-2">
										<label className="text-md font-semibold text-slate-700">
											Khối lớp
										</label>
										<div className="relative">
											<GraduationCap className="absolute inset-y-0 left-0 flex items-center ml-4 mt-2 text-slate-400 w-5 h-5" />
											<select
												value={formData.grade ?? ""}
												onChange={(e) =>
													handleFieldChange(
														"grade" as keyof TUserProfile,
														e.target.value ? Number(e.target.value) : undefined,
													)
												}
												disabled={!isEditing}
												className="h-10 w-full appearance-none rounded-md border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 transition-all focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-slate-100"
											>
												<option value="" disabled>
													Chọn lớp
												</option>
												{Array.from({ length: 10 }, (_, i) => i + 3).map(
													(g) => (
														<option key={g} value={g}>
															Lớp {g}
														</option>
													),
												)}
											</select>
										</div>
									</div>
								)}
							</div>

							<div className="space-y-2">
								<label className="text-md font-semibold text-slate-700">
									Tiểu sử (Bio)
								</label>
								<textarea
									className="w-full px-4 py-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary transition-all text-md min-h-30 outline-none resize-none disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100"
									placeholder="Chia sẻ đôi chút về bản thân bạn..."
									rows={4}
									value={formData.bio || ""}
									onChange={(e) => handleFieldChange("bio", e.target.value)}
									disabled={!isEditing}
								/>
							</div>

							{isMentor && (
								<div className="pt-8 border-t border-slate-100">
									<h3 className="text-base font-bold text-slate-900 mb-6">
										Thông tin giảng viên
									</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-2">
											<label className="text-md font-semibold text-slate-700">
												Chức danh công việc
											</label>
											<Input
												value={formData.jobTitle || ""}
												onChange={(e) =>
													handleFieldChange("jobTitle", e.target.value)
												}
												placeholder="VD: Software Engineer"
												disabled={!isEditing}
											/>
										</div>

										<div className="space-y-2">
											<label className="text-md font-semibold text-slate-700">
												Công ty hiện tại
											</label>
											<Input
												placeholder="Ví dụ: Bit Learning, FPT Software"
												value={formData.company || ""}
												onChange={(e) =>
													handleFieldChange("company", e.target.value)
												}
												disabled={!isEditing}
											/>
										</div>

										<div className="space-y-2 md:col-span-2">
											<label className="text-md font-semibold text-slate-700">
												Lĩnh vực chuyên môn
											</label>
											<Input
												placeholder="Ví dụ: Frontend, Backend, DevOps"
												value={
													Array.isArray(formData.specialties)
														? formData.specialties.join(", ")
														: ""
												}
												onChange={(e) => {
													const raw = e.target.value;
													const list = raw
														.split(",")
														.map((s) => s.trim())
														.filter(Boolean);
													handleFieldChange(
														"specialties" as keyof TUserProfile,
														list.length ? list : null,
													);
												}}
												disabled={!isEditing}
											/>
											<p className="mt-1 text-sm text-slate-500">
												Nhập các chuyên môn, cách nhau bởi dấu phẩy.
											</p>
										</div>

										<div className="space-y-2">
											<label className="text-md font-semibold text-slate-700">
												Số năm kinh nghiệm
											</label>
											<Input
												type="number"
												min={0}
												max={50}
												placeholder="Ví dụ: 5"
												value={formData.yearsOfExperience ?? ""}
												onChange={(e) => {
													const val = e.target.value;
													handleFieldChange(
														"yearsOfExperience",
														val === "" ? null : Number(val),
													);
												}}
												disabled={!isEditing}
											/>
										</div>

										<div className="space-y-2">
											<label className="text-md font-semibold text-slate-700">
												Số lượng học viên
											</label>
											<Input
												type="number"
												min={0}
												placeholder="Ví dụ: 100"
												value={formData.studentsCount ?? ""}
												onChange={(e) => {
													const val = e.target.value;
													handleFieldChange(
														"studentsCount",
														val === "" ? null : Number(val),
													);
												}}
												disabled={!isEditing}
											/>
										</div>

										<div className="space-y-2">
											<label className="text-md font-semibold text-slate-700">
												Số khoá học đã dạy (ước tính)
											</label>
											<Input
												type="number"
												min={0}
												placeholder="Ví dụ: 5"
												value={formData.coursesCount ?? ""}
												onChange={(e) => {
													const val = e.target.value;
													handleFieldChange(
														"coursesCount",
														val === "" ? null : Number(val),
													);
												}}
												disabled={!isEditing}
											/>
										</div>
									</div>
								</div>
							)}

							<div className="pt-8 border-t border-slate-100">
								<h3 className="text-base font-bold text-slate-900 mb-6">
									Liên kết mạng xã hội
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<SocialInput
										icon={Facebook}
										color="#1877F2"
										placeholder="https://www.facebook.com/username"
										value={formData.socialProfile?.facebook}
										onChange={(v: string) => handleSocialChange("facebook", v)}
										type="facebook"
										disabled={!isEditing}
									/>
									<SocialInput
										icon={Instagram}
										color="#E4405F"
										placeholder="https://www.instagram.com/username"
										value={formData.socialProfile?.instagram}
										onChange={(v: string) => handleSocialChange("instagram", v)}
										type="instagram"
										disabled={!isEditing}
									/>
									<SocialInput
										icon={Twitter}
										color="#1DA1F2"
										placeholder="https://www.twitter.com/username"
										value={formData.socialProfile?.twitter}
										onChange={(v: string) => handleSocialChange("twitter", v)}
										type="twitter"
										disabled={!isEditing}
									/>
									<SocialInput
										icon={Linkedin}
										color="#0077B5"
										placeholder="https://www.linkedin.com/in/username"
										value={formData.socialProfile?.linkedin}
										onChange={(v: string) => handleSocialChange("linkedin", v)}
										type="linkedin"
										disabled={!isEditing}
									/>
									<SocialInput
										icon={Github}
										color="#24292e"
										placeholder="https://github.com/username"
										value={formData.socialProfile?.github}
										onChange={(v: string) => handleSocialChange("github", v)}
										type="github"
										disabled={!isEditing}
									/>
									<SocialInput
										icon={Globe}
										color="#6B7280"
										placeholder="https://yourwebsite.com"
										value={formData.socialProfile?.website}
										onChange={(v: string) => handleSocialChange("website", v)}
										type="website"
										disabled={!isEditing}
									/>
								</div>
							</div>
						</div>
					</Card>
				</div>
			)}

			{activeTab === "history" && (
				<div className="space-y-6">
					<Card className="p-6">
						<div className="flex items-center gap-3 mb-6">
							<Gamepad2 className="w-5 h-5 text-blue-600" />
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
											<div className="aspect-video bg-linear-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
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
														Độ chính xác:{" "}
														<span className="font-bold text-emerald-600">
															{item.accuracy ?? 0}%
														</span>
													</span>
													<span>
														{Math.floor(item.duration / 60)}m{" "}
														{item.duration % 60}s
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
															className={`font-bold ${item.completed ? "text-emerald-600" : "text-amber-600"}`}
														>
															{item.completed
																? "Hoàn thành"
																: "Chưa hoàn thành"}
														</span>
													</span>
												</div>
												{/* <div className="mt-1 text-xs text-slate-500">
                          Điểm: <span className="font-bold text-yellow-600">{item.score}</span>
                        </div> */}
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
			)}

			{activeTab === "post" && (
				<div className="space-y-6">
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-2xl font-bold text-slate-900">
								Bài viết của tôi
							</h2>
							<p className="text-sm text-slate-500">
								Các bài viết bạn đã chia sẻ trên diễn đàn
							</p>
						</div>
						<Link
							to="/forum/my"
							className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
						>
							Xem tất cả
							<ArrowRight className="h-4 w-4" />
						</Link>
					</div>

					{isPostsLoading ? (
						<Loader />
					) : myPosts.length === 0 ? (
						<Card className="p-10 text-center">
							<FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" />
							<h3 className="text-lg font-semibold text-slate-900">
								Chưa có bài viết nào
							</h3>
							<p className="mt-2 text-sm text-slate-500">
								Bạn có thể tạo bài viết mới trong diễn đàn để hiển thị tại đây.
							</p>
							<Link
								to="/forum/create"
								className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
							>
								Tạo bài viết
								<ArrowRight className="h-4 w-4" />
							</Link>
						</Card>
					) : (
						<div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
							{myPosts.map((post) => (
								<ForumPostCard key={post.id} post={post} />
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
};
