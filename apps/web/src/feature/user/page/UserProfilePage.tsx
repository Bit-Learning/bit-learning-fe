import PageMeta from "@/shared/components/seo/page-meta";
import UserProfileLayout from "../layouts/UserProfileLayout";
import ProfileContent from "@/shared/components/profile-page/profile-content";

export const UserProfilePage: React.FC = () => {
  return (
    <>
      <PageMeta title="Thông tin cá nhân - Bit Learning" description="Quản lý thông tin cá nhân của bạn" />
      <UserProfileLayout>
        <ProfileContent />
      </UserProfileLayout>
    </>
  );
};
