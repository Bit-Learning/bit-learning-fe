import React, { useState, useEffect } from "react";
import { Camera, Edit, Save, MapPin, Phone, Facebook, Instagram, Github, Linkedin, Globe, Twitter } from "lucide-react";
import { Card } from "@workspace/ui/components/Card";
import { Button } from "@workspace/ui/components/Button";
import { Input } from "@workspace/ui/components/Input";
import { useUserProfile, useUpdateUserProfile, useUploadAvatar, useUploadCoverImage } from "../queries/useUser";
import type { TUserProfile, TSocialProfile } from "../types/user.type";

export const ProfileContent = () => {
  const { data: userProfile, isLoading } = useUserProfile();
  const updateProfileMutation = useUpdateUserProfile();
  const uploadAvatarMutation = useUploadAvatar();
  const uploadCoverMutation = useUploadCoverImage();

  const [formData, setFormData] = useState<Partial<TUserProfile>>({});

  useEffect(() => {
    if (userProfile) {
      setFormData(userProfile);
    }
  }, [userProfile]);

  const handleSave = () => {
    updateProfileMutation.mutate({
      firstName: formData.firstName,
      lastName: formData.lastName,
      pronouns: formData.pronouns,
      bio: formData.bio,
      phoneNumber: formData.phoneNumber,
      location: formData.location,
      socialProfile: formData.socialProfile,
      jobTitle: formData.jobTitle,
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

  const SocialInput = ({ icon: Icon, color, placeholder, value, onChange }: any) => (
    <div className="flex items-center gap-4">
      <div className="size-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0" style={{ color }}>
        <Icon className="w-6 h-6" />
      </div>
      <Input placeholder={placeholder} value={value || ""} onChange={(e: any) => onChange(e.target.value)} />
    </div>
  );

  if (isLoading) return <div className="grow text-center py-12">Đang tải...</div>;

  const fullName = `${formData.firstName || ""} ${formData.lastName || ""}`.trim();
  const joinedDate = formData.createdAt
    ? new Date(formData.createdAt).toLocaleDateString("vi-VN", { month: "long", year: "numeric" })
    : "";

  return (
    <div className="grow space-y-8 w-full">
      <Card>
        <div className="relative h-56 md:h-64 bg-slate-200">
          <img alt="Cover" className="w-full h-full object-cover" src={formData.coverImage || "/default-cover.jpg"} />
          <label className="absolute top-4 right-4">
            <Button variant="outline" size="sm" className="bg-white/90 backdrop-blur cursor-pointer">
              <Camera className="w-4 h-4 mr-2" />
              Thay đổi ảnh bìa
            </Button>
            <input className="hidden" type="file" onChange={handleCoverChange} accept="image/*" />
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
                <input className="hidden" type="file" onChange={handleAvatarChange} accept="image/*" />
              </label>
            </div>

            <div className="grow flex flex-col md:flex-row items-center md:items-end justify-between gap-6 w-full md:pb-2">
              <div className="text-center md:text-left">
                <h1 className="text-2xl font-bold text-slate-900">{fullName || "Người dùng"}</h1>
                <p className="text-slate-500 font-medium">
                  {formData.jobTitle || "Học viên"} • Tham gia từ {joinedDate}
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setFormData(userProfile || {})}>
                  Hủy bỏ
                </Button>
                <Button onClick={handleSave} isDisabled={updateProfileMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {updateProfileMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-8 md:p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Edit className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Thông tin cá nhân</h2>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Tên người dùng (Username)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 font-medium">@</span>
                <Input className="pl-9" value={formData.username || ""} disabled />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Email</label>
              <Input value={formData.email || ""} disabled />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Họ (First Name)</label>
              <Input
                value={formData.firstName || ""}
                onChange={(e) => handleFieldChange("firstName", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Tên (Last Name)</label>
              <Input value={formData.lastName || ""} onChange={(e) => handleFieldChange("lastName", e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Đại từ nhân xưng (Pronouns)</label>
              <Input
                value={formData.pronouns || ""}
                onChange={(e) => handleFieldChange("pronouns", e.target.value)}
                placeholder="he/him, she/her, they/them"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Chức danh công việc</label>
              <Input
                value={formData.jobTitle || ""}
                onChange={(e) => handleFieldChange("jobTitle", e.target.value)}
                placeholder="VD: Software Engineer"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Số điện thoại</label>
              <div className="relative">
                <Phone className="absolute inset-y-0 left-0 flex items-center ml-4 text-slate-400 w-5 h-5" />
                <Input
                  className="pl-11"
                  value={formData.phoneNumber || ""}
                  onChange={(e) => handleFieldChange("phoneNumber", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Vị trí</label>
              <div className="relative">
                <MapPin className="absolute inset-y-0 left-0 flex items-center ml-4 text-slate-400 w-5 h-5" />
                <Input
                  className="pl-11"
                  value={formData.location || ""}
                  onChange={(e) => handleFieldChange("location", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Tiểu sử (Bio)</label>
            <textarea
              className="w-full px-4 py-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm min-h-30 outline-none resize-none"
              placeholder="Chia sẻ đôi chút về bản thân bạn..."
              rows={4}
              value={formData.bio || ""}
              onChange={(e) => handleFieldChange("bio", e.target.value)}
            />
          </div>

          <div className="pt-8 border-t border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-6">Liên kết mạng xã hội</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SocialInput
                icon={Facebook}
                color="#1877F2"
                placeholder="Facebook profile link"
                value={formData.socialProfile?.facebook}
                onChange={(v: string) => handleSocialChange("facebook", v)}
              />
              <SocialInput
                icon={Instagram}
                color="#E4405F"
                placeholder="Instagram username"
                value={formData.socialProfile?.instagram}
                onChange={(v: string) => handleSocialChange("instagram", v)}
              />
              <SocialInput
                icon={Twitter}
                color="#1DA1F2"
                placeholder="Twitter/X username"
                value={formData.socialProfile?.twitter}
                onChange={(v: string) => handleSocialChange("twitter", v)}
              />
              <SocialInput
                icon={Linkedin}
                color="#0077B5"
                placeholder="LinkedIn profile link"
                value={formData.socialProfile?.linkedin}
                onChange={(v: string) => handleSocialChange("linkedin", v)}
              />
              <SocialInput
                icon={Github}
                color="#24292e"
                placeholder="Github username"
                value={formData.socialProfile?.github}
                onChange={(v: string) => handleSocialChange("github", v)}
              />
              <SocialInput
                icon={Globe}
                color="#6B7280"
                placeholder="Personal website"
                value={formData.socialProfile?.website}
                onChange={(v: string) => handleSocialChange("website", v)}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
