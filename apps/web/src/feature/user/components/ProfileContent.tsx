import { Button } from "@workspace/ui/components/Button";
import { Card } from "@workspace/ui/components/Card";
import { Input } from "@workspace/ui/components/Input";
import Loader from "@workspace/ui/components/loader/TerminalLoader";
import {
	Briefcase,
	Camera,
	Edit,
	Facebook,
	Github,
	Globe,
	Instagram,
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

export const ProfileContent = () => {
	const { data: userProfile, isLoading } = useUserProfile();
	const updateProfileMutation = useUpdateUserProfile();
	const uploadAvatarMutation = useUploadAvatar();
	const uploadCoverMutation = useUploadCoverImage();

	const [formData, setFormData] = useState<Partial<TUserProfile>>({});
	const [isEditing, setIsEditing] = useState(false);

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
		const currentUsername = userProfile?.username?.trim() ?? "";
		const nextUsername = formData.username?.trim() ?? "";
		const payload: TUpdateUserRequest = {
			firstName: formData.firstName,
			lastName: formData.lastName,
			pronouns: formData.pronouns,
			bio: formData.bio,
			phoneNumber: formData.phoneNumber,
			location: formData.location,
			socialProfile: formData.socialProfile,
			jobTitle: formData.jobTitle,
			specialties: formData.specialties ?? undefined,
			yearsOfExperience: formData.yearsOfExperience ?? undefined,
			company: formData.company ?? undefined,
			studentsCount: formData.studentsCount ?? undefined,
			coursesCount: formData.coursesCount ?? undefined,
		};

		// Avoid triggering duplicate-username validation when the user did not
		// actually change their username.
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
				<div className="relative w-full aspect-[16/9]">
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

				<div className="px-8 pb-8">
					<div className="flex flex-col md:flex-row items-end gap-6 relative">
						<div className="relative group">
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
								{/* Name */}
								<h1 className="text-2xl font-bold text-slate-900">
									{fullName || "Người dùng"}
								</h1>

								{/* Bio */}
								{formData.bio && (
									<p className="mt-2 text-slate-600 leading-relaxed">
										{formData.bio}
									</p>
								)}

								{/* Info list */}
								<div className="mt-4 space-y-2 text-sm text-slate-700">
									{formData.location && (
										<div className="flex items-center gap-2 justify-center md:justify-start">
											<MapPin className="w-4 h-4 text-slate-400" />
											<span>{formData.location}</span>
										</div>
									)}

									{formData.jobTitle && (
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
				</div>

				{/* <div className="px-8 pb-6 flex items-center justify-center gap-2">
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
        </div> */}
			</Card>

			<Card className="p-8 md:p-10">
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center gap-3 ">
						<h2 className="text-2xl font-bold text-slate-900">
							Thông tin cá nhân
						</h2>
					</div>

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
							<label className="text-md font-semibold text-slate-700">Họ</label>
							<Input
								value={formData.firstName || ""}
								onChange={(e) => handleFieldChange("firstName", e.target.value)}
								disabled={!isEditing}
							/>
						</div>

						<div className="space-y-2">
							<label className="text-md font-semibold text-slate-700">
								Tên
							</label>
							<Input
								value={formData.lastName || ""}
								onChange={(e) => handleFieldChange("lastName", e.target.value)}
								disabled={!isEditing}
							/>
						</div>

						<div className="space-y-2">
							<label className="text-md font-semibold text-slate-700">
								Đại từ nhân xưng
							</label>
							<Input
								value={formData.pronouns || ""}
								onChange={(e) => handleFieldChange("pronouns", e.target.value)}
								placeholder="he/him, she/her, they/them"
								disabled={!isEditing}
							/>
						</div>

						<div className="space-y-2">
							<label className="text-md font-semibold text-slate-700">
								Chức danh công việc
							</label>
							<Input
								value={formData.jobTitle || ""}
								onChange={(e) => handleFieldChange("jobTitle", e.target.value)}
								placeholder="VD: Software Engineer"
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
								Thông tin Mentor
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
											const value = e.target.value;
											const num = value === "" ? null : Number(value);
											handleFieldChange("yearsOfExperience", num);
										}}
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
											const value = e.target.value;
											const num = value === "" ? null : Number(value);
											handleFieldChange("studentsCount", num);
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
											const value = e.target.value;
											const num = value === "" ? null : Number(value);
											handleFieldChange("coursesCount", num);
										}}
										disabled={!isEditing}
									/>
								</div>
							</div>
						</div>
					)}

					{/* Social links */}
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
	);
};
