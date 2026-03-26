import PageMeta from "@/shared/components/seo/page-meta";
import UserProfileLayout from "../layouts/UserProfileLayout";
import { ProfileContent } from "../components/ProfileContent";
import { PublicProfileContent } from "../components/PublicProfileContent";
import { useSelector } from "react-redux";
import type { RootState } from "@/shared/redux/store";
import { useViewUserProfileByUsername } from "../queries/useUser";
import Loader from "@workspace/ui/components/loader/TerminalLoader";

interface UserProfilePageProps {
	viewUsername?: string;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({
	viewUsername,
}) => {
	const auth = useSelector((state: RootState) => state.auth);
	const currentUsername = auth.userInfo?.username;
	const isViewingOther =
		viewUsername != null && viewUsername !== currentUsername;

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
					<PublicProfileContent username={viewUsername} />
				) : (
					<ProfileContent />
				)}
			</UserProfileLayout>
		</>
	);
};
