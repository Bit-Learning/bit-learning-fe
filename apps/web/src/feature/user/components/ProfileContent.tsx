import React, { useState, useEffect, useRef } from "react";
import {
	Camera,
	Edit,
	Save,
	MapPin,
	Phone,
	Facebook,
	Instagram,
	Github,
	Linkedin,
	Globe,
	Twitter,
	Users,
	Settings,
	X,
} from "lucide-react";
import { Card } from "@workspace/ui/components/Card";
import { Button } from "@workspace/ui/components/Button";
import { Input } from "@workspace/ui/components/Input";
import {
	useUserProfile,
	useUpdateUserProfile,
	useUploadAvatar,
	useUploadCoverImage,
	useFollowStats,
	useFollowers,
	useFollowing,
} from "../queries/useUser";
import {
	useForumPostsByAuthor,
	useLikeForumPost,
	useDislikeForumPost,
} from "@/feature/forum/queries/useForum";
import { selectForumMyPosts } from "@/feature/forum/stores/forum.store";
import { PostCard } from "@/feature/forum/components/PostCard";
import { useSelector } from "react-redux";
import type {
	TUserProfile,
	TSocialProfile,
	TFollowUser,
} from "../types/user.type";
import Loader from "@workspace/ui/components/loader/TerminalLoader";
import { useNavigate } from "@tanstack/react-router";
import { Pagination } from "@/shared/components/Pagination";

const SOCIAL_VALIDATORS: Record<string, { pattern: RegExp; example: string }> =
	{
		facebook: {
			pattern: /^https:\/\/(www\.)?facebook\.com\/.+/,
			example: "https://www.facebook.com/username",
		},
		instagram: {
			pattern: /^https:\/\/(www\.)?instagram\.com\/.+/,
			example: "https://www.instagram.com/username",
		},
		twitter: {
			pattern: /^https:\/\/(www\.)?(twitter|x)\.com\/.+/,
			example: "https://www.twitter.com/username",
		},
		linkedin: {
			pattern: /^https:\/\/(www\.)?linkedin\.com\/in\/.+/,
			example: "https://www.linkedin.com/in/username",
		},
		github: {
			pattern: /^https:\/\/github\.com\/.+/,
			example: "https://github.com/username",
		},
		website: {
			pattern: /^https:\/\/.+/,
			example: "https://yourwebsite.com",
		},
	};

const SocialInput = ({
	icon: Icon,
	color,
	placeholder,
	value,
	onChange,
	type,
}: any) => {
	const trimmed = value?.trim() || "";
	const hasValue = trimmed.length > 0;
	const validator = SOCIAL_VALIDATORS[type];
	const isValid = hasValue && validator?.pattern.test(trimmed);
	const isInvalid = hasValue && !isValid;

	return (
		<div className="flex flex-col gap-1">
			<div className="flex items-center gap-4">
				{hasValue && isValid ? (
					<a
						href={trimmed}
						target="_blank"
						rel="noopener noreferrer"
						className="size-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 hover:bg-slate-200 transition-colors cursor-pointer"
						style={{ color }}
					>
						<Icon className="w-6 h-6" />
					</a>
				) : (
					<div
						className="size-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0"
						style={{ color: isInvalid ? "#ef4444" : color }}
					>
						<Icon className="w-6 h-6" />
					</div>
				)}
				<Input
					placeholder={placeholder}
					value={value || ""}
					onChange={(e: any) => onChange(e.target.value)}
					className={
						isInvalid
							? "border-red-400 focus:ring-red-400 focus:border-red-400"
							: ""
					}
				/>
			</div>
			{isInvalid && (
				<p className="text-xs text-red-500 ml-15 pl-0.5">
					VD: {validator?.example}
				</p>
			)}
		</div>
	);
};

const FollowDropdown = ({
	label,
	count,
	users,
	isLoading,
}: {
	label: string;
	count: number;
	users: TFollowUser[] | undefined;
	isLoading: boolean;
}) => {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	return (
		<div className="relative" ref={ref}>
			<button
				onClick={() => setOpen(!open)}
				className="flex flex-col items-center gap-1 px-6 py-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
			>
				<span className="text-xl font-bold text-slate-900">{count}</span>
				<span className="text-xs text-slate-500">{label}</span>
			</button>
			{open && (
				<div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 max-h-80 overflow-y-auto">
					<div className="p-3 border-b border-slate-100">
						<span className="text-sm font-semibold text-slate-700">
							{label} ({count})
						</span>
					</div>
					{isLoading ? (
						<Loader />
					) : !users || users.length === 0 ? (
						<div className="p-4 text-center text-sm text-slate-400">
							Chưa có ai
						</div>
					) : (
						users.map((user) => (
							<button
								key={user.userId}
								onClick={() => {
									setOpen(false);
									navigate({
										to: "/profile/$username",
										params: { username: user.username },
									});
								}}
								className="flex items-center gap-3 w-full px-4 py-3 hover:bg-slate-50 transition-colors text-left"
							>
								<img
									src={user.avatar || "/default-avatar.jpg"}
									alt={user.username}
									className="w-9 h-9 rounded-full object-cover shrink-0"
								/>
								<div className="min-w-0">
									<div className="text-sm font-semibold text-slate-800 truncate">
										{user.firstName} {user.lastName}
									</div>
									<div className="text-xs text-slate-400 truncate">
										@{user.username}
									</div>
								</div>
							</button>
						))
					)}
				</div>
			)}
		</div>
	);
};

export const ProfileContent = () => {
	const navigate = useNavigate();
	const { data: userProfile, isLoading } = useUserProfile();
	const updateProfileMutation = useUpdateUserProfile();
	const uploadAvatarMutation = useUploadAvatar();
	const uploadCoverMutation = useUploadCoverImage();

	const userId = userProfile?.id ?? 0;
	const { data: followStats } = useFollowStats(userId);
	const { data: followers, isLoading: followersLoading } = useFollowers(userId);
	const { data: following, isLoading: followingLoading } = useFollowing(userId);

	const [formData, setFormData] = useState<Partial<TUserProfile>>({});
	const [showEdit, setShowEdit] = useState(false);
	const [forumPage, setForumPage] = useState(0);

	// Forum posts
	const myPosts = useSelector(selectForumMyPosts);
	const { data: forumData } = useForumPostsByAuthor({
		authorId: userId,
		page: forumPage,
		size: 5,
	});
	const likeMutation = useLikeForumPost();
	const dislikeMutation = useDislikeForumPost();
	const forumPagination = forumData?.page;

	useEffect(() => {
		if (userProfile) {
			setFormData(userProfile);
		}
	}, [userProfile]);

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
		updateProfileMutation.mutate({
			username: formData.username,
			firstName: formData.firstName,
			lastName: formData.lastName,
			pronouns: formData.pronouns,
			bio: formData.bio,
			phoneNumber: formData.phoneNumber,
			location: formData.location,
			socialProfile: formData.socialProfile,
			jobTitle: formData.jobTitle,
			// Mentor profile fields
			specialties: formData.specialties ?? undefined,
			yearsOfExperience: formData.yearsOfExperience ?? undefined,
			company: formData.company ?? undefined,
			studentsCount: formData.studentsCount ?? undefined,
			coursesCount: formData.coursesCount ?? undefined,
		});
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

	if (isLoading) {
		return <Loader />;
	}

	const fullName =
		`${formData.firstName || ""} ${formData.lastName || ""}`.trim();
	const joinedDate = formData.createdAt
		? new Date(formData.createdAt).toLocaleDateString("vi-VN", {
				month: "long",
				year: "numeric",
			})
		: "";

	const isMentor = formData.role === "MENTOR";

	return (
		<div className="grow space-y-8 w-full">
			<Card>
				<div className="relative h-56 md:h-64">
					<img
						alt="Cover"
						className="w-full h-full object-cover -mt-6 rounded-t-xl"
						src={formData.coverImage || "/graybg.jpg"}
					/>
					<label className="absolute top-4 right-4">
						<span className="inline-flex items-center gap-1.5 justify-center whitespace-nowrap rounded-sm text-sm font-medium h-7 px-2 bg-white/90 backdrop-blur cursor-pointer border shadow-sm hover:bg-white transition-all">
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
				</div>

				<div className="px-8 pb-8">
					<div className="flex flex-col md:flex-row items-end gap-6 -mt-16 relative">
						<div className="relative group">
							<div className="size-32 md:size-40 rounded-3xl border-4 border-white bg-white shadow-xl overflow-hidden">
								<img
									alt="Avatar"
									className="w-full h-full object-cover"
									src={formData.avatar || "/default-avatar.jpg"}
								/>
							</div>
							<label className="absolute bottom-2 right-2 size-9 rounded-full bg-primary text-white border-2 border-white flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform">
								<Edit className="w-4 h-4" />
								<input
									className="hidden"
									type="file"
									onChange={handleAvatarChange}
									accept="image/*"
								/>
							</label>
						</div>

						<div className="grow flex flex-col md:flex-row items-center md:items-end justify-between gap-6 w-full md:pb-2">
							<div className="text-center md:text-left">
								<h1 className="text-2xl font-bold text-slate-900">
									{fullName || "Người dùng"}
								</h1>
								<p className="text-slate-500 font-medium">
									{formData.jobTitle || "Học viên"}
								</p>
								<p className="mt-2 text-slate-300 font-small">
									Tham gia từ {joinedDate}
								</p>
							</div>
							<div className="flex gap-3">
								<Button
									variant="outline"
									onClick={() => setShowEdit(!showEdit)}
								>
									{showEdit ? (
										<>
											<X className="w-4 h-4 mr-2" />
											Đóng
										</>
									) : (
										<>
											<Settings className="w-4 h-4 mr-2" />
											Chỉnh sửa hồ sơ
										</>
									)}
								</Button>
							</div>
						</div>
					</div>
				</div>

				{/* Followers / Following */}
				<div className="px-8 pb-6 flex items-center justify-center gap-2">
					<Users className="w-5 h-5 text-slate-400" />
					<FollowDropdown
						label="Người theo dõi"
						count={followStats?.followersCount ?? 0}
						users={followers}
						isLoading={followersLoading}
					/>
					<div className="w-px h-10 bg-slate-200" />
					<FollowDropdown
						label="Đang theo dõi"
						count={followStats?.followingCount ?? 0}
						users={following}
						isLoading={followingLoading}
					/>
				</div>
			</Card>

			{/* Edit form with smooth animation */}
			<div
				className="grid transition-all duration-500 ease-in-out"
				style={{ gridTemplateRows: showEdit ? "1fr" : "0fr" }}
			>
				<div className="overflow-hidden">
					<Card className="p-8 md:p-10">
						<div className="flex items-center justify-between mb-8">
							<div className="flex items-center gap-3">
								<div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
									<Edit className="w-5 h-5 text-primary" />
								</div>
								<h2 className="text-xl font-bold text-slate-900">
									Thông tin cá nhân
								</h2>
							</div>
							<div className="flex gap-3">
								<Button
									variant="outline"
									onClick={() => setFormData(userProfile || {})}
								>
									Hủy bỏ
								</Button>
								<Button
									onClick={handleSave}
									isDisabled={updateProfileMutation.isPending}
								>
									<Save className="w-4 h-4 mr-2" />
									{updateProfileMutation.isPending
										? "Đang lưu..."
										: "Lưu thay đổi"}
								</Button>
							</div>
						</div>

						<div className="space-y-8">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
								<div className="space-y-2">
									<label className="text-sm font-semibold text-slate-700">
										Tên người dùng (Username)
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
										/>
									</div>
								</div>

								<div className="space-y-2">
									<label className="text-sm font-semibold text-slate-700">
										Email
									</label>
									<Input value={formData.email || ""} disabled />
								</div>

								<div className="space-y-2">
									<label className="text-sm font-semibold text-slate-700">
										Họ (First Name)
									</label>
									<Input
										value={formData.firstName || ""}
										onChange={(e) =>
											handleFieldChange("firstName", e.target.value)
										}
									/>
								</div>

								<div className="space-y-2">
									<label className="text-sm font-semibold text-slate-700">
										Tên (Last Name)
									</label>
									<Input
										value={formData.lastName || ""}
										onChange={(e) =>
											handleFieldChange("lastName", e.target.value)
										}
									/>
								</div>

								<div className="space-y-2">
									<label className="text-sm font-semibold text-slate-700">
										Đại từ nhân xưng (Pronouns)
									</label>
									<Input
										value={formData.pronouns || ""}
										onChange={(e) =>
											handleFieldChange("pronouns", e.target.value)
										}
										placeholder="he/him, she/her, they/them"
									/>
								</div>

								<div className="space-y-2">
									<label className="text-sm font-semibold text-slate-700">
										Chức danh công việc
									</label>
									<Input
										value={formData.jobTitle || ""}
										onChange={(e) =>
											handleFieldChange("jobTitle", e.target.value)
										}
										placeholder="VD: Software Engineer"
									/>
								</div>

								<div className="space-y-2">
									<label className="text-sm font-semibold text-slate-700">
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
										/>
									</div>
								</div>

								<div className="space-y-2">
									<label className="text-sm font-semibold text-slate-700">
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
										/>
									</div>
								</div>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-semibold text-slate-700">
									Tiểu sử (Bio)
								</label>
								<textarea
									className="w-full px-4 py-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm min-h-30 outline-none resize-none"
									placeholder="Chia sẻ đôi chút về bản thân bạn..."
									rows={4}
									value={formData.bio || ""}
									onChange={(e) => handleFieldChange("bio", e.target.value)}
								/>
							</div>

							{isMentor && (
								<div className="pt-8 border-t border-slate-100">
									<h3 className="text-base font-bold text-slate-900 mb-6">
										Thông tin Mentor
									</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-2 md:col-span-2">
											<label className="text-sm font-semibold text-slate-700">
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
											/>
											<p className="mt-1 text-xs text-slate-500">
												Nhập các chuyên môn, cách nhau bởi dấu phẩy.
											</p>
										</div>

										<div className="space-y-2">
											<label className="text-sm font-semibold text-slate-700">
												Số năm kinh nghiệm
											</label>
											<Input
												type="number"
												min={0}
												max={50}
												placeholder="Ví dụ: 5"
												value={formData.yearsOfExperience ?? ""}
												onChange={(e) => {
													const value = e.target.value;
													const num = value === "" ? null : Number(value);
													handleFieldChange("yearsOfExperience", num);
												}}
											/>
										</div>

										<div className="space-y-2">
											<label className="text-sm font-semibold text-slate-700">
												Công ty hiện tại (tuỳ chọn)
											</label>
											<Input
												placeholder="Ví dụ: Bit Learning, FPT Software"
												value={formData.company || ""}
												onChange={(e) =>
													handleFieldChange("company", e.target.value)
												}
											/>
										</div>

										<div className="space-y-2">
											<label className="text-sm font-semibold text-slate-700">
												Số lượng học viên (ước tính)
											</label>
											<Input
												type="number"
												min={0}
												placeholder="Ví dụ: 100"
												value={formData.studentsCount ?? ""}
												onChange={(e) => {
													const value = e.target.value;
													const num = value === "" ? null : Number(value);
													handleFieldChange("studentsCount", num);
												}}
											/>
										</div>

										<div className="space-y-2">
											<label className="text-sm font-semibold text-slate-700">
												Số khoá học đã dạy (ước tính)
											</label>
											<Input
												type="number"
												min={0}
												placeholder="Ví dụ: 5"
												value={formData.coursesCount ?? ""}
												onChange={(e) => {
													const value = e.target.value;
													const num = value === "" ? null : Number(value);
													handleFieldChange("coursesCount", num);
												}}
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
									/>
									<SocialInput
										icon={Instagram}
										color="#E4405F"
										placeholder="https://www.instagram.com/username"
										value={formData.socialProfile?.instagram}
										onChange={(v: string) => handleSocialChange("instagram", v)}
										type="instagram"
									/>
									<SocialInput
										icon={Twitter}
										color="#1DA1F2"
										placeholder="https://www.twitter.com/username"
										value={formData.socialProfile?.twitter}
										onChange={(v: string) => handleSocialChange("twitter", v)}
										type="twitter"
									/>
									<SocialInput
										icon={Linkedin}
										color="#0077B5"
										placeholder="https://www.linkedin.com/in/username"
										value={formData.socialProfile?.linkedin}
										onChange={(v: string) => handleSocialChange("linkedin", v)}
										type="linkedin"
									/>
									<SocialInput
										icon={Github}
										color="#24292e"
										placeholder="https://github.com/username"
										value={formData.socialProfile?.github}
										onChange={(v: string) => handleSocialChange("github", v)}
										type="github"
									/>
									<SocialInput
										icon={Globe}
										color="#6B7280"
										placeholder="https://yourwebsite.com"
										value={formData.socialProfile?.website}
										onChange={(v: string) => handleSocialChange("website", v)}
										type="website"
									/>
								</div>
							</div>
						</div>
					</Card>
				</div>
			</div>

			{/* Forum Posts */}
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-bold text-slate-900">Bài viết của tôi</h3>
					<button
						onClick={() => navigate({ to: "/forum/my" })}
						className="text-sm text-primary font-semibold hover:underline"
					>
						Xem tất cả →
					</button>
				</div>
				{myPosts.length === 0 ? (
					<Card className="p-8 text-center">
						<div className="text-4xl mb-3">📝</div>
						<p className="text-slate-500 font-medium">
							Bạn chưa có bài viết nào
						</p>
						<button
							onClick={() => navigate({ to: "/forum/create" })}
							className="mt-3 text-sm text-primary font-semibold hover:underline"
						>
							Tạo bài viết đầu tiên →
						</button>
					</Card>
				) : (
					<>
						{myPosts.map((post) => (
							<PostCard
								key={post.id}
								post={post}
								onLike={(id) => likeMutation.mutate(id)}
								onDislike={(id) => dislikeMutation.mutate(id)}
								onViewDetails={(id) =>
									navigate({
										to: "/forum/post/$id",
										params: { id: String(id) },
									})
								}
							/>
						))}
						{forumPagination && forumPagination.totalPages > 1 && (
							<Pagination
								currentPage={forumPage}
								totalPages={forumPagination.totalPages}
								onPageChange={setForumPage}
							/>
						)}
					</>
				)}
			</div>
		</div>
	);
};
