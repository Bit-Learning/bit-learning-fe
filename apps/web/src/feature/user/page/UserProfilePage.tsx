import PageMeta from "@/shared/components/seo/page-meta";
import UserProfileLayout from "../layouts/UserProfileLayout";
import { ProfileContent } from "../components/ProfileContent";
import { PublicProfileContent } from "../components/PublicProfileContent";
import { useSelector } from "react-redux";
import type { RootState } from "@/shared/redux/store";

interface UserProfilePageProps {
	viewUserId?: number;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({
	viewUserId,
}) => {
	const auth = useSelector((state: RootState) => state.auth);
	const currentUserId = auth.userInfo?.id;
	const isViewingOther = viewUserId != null && viewUserId !== currentUserId;

	return (
		<>
			<PageMeta
				title={
					isViewingOther
						? "Hồ sơ người dùng - Bit Learning"
						: "Thông tin cá nhân - Bit Learning"
				}
				description={
					isViewingOther
						? "Xem hồ sơ người dùng"
						: "Quản lý thông tin cá nhân của bạn"
				}
			/>
			<UserProfileLayout>
				{isViewingOther ? (
					<PublicProfileContent userId={viewUserId} />
				) : (
					<ProfileContent />
				)}
			</UserProfileLayout>
		</>
	);
};
