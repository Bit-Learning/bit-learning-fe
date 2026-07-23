import React from "react";
import { ProfileSidebar } from "../components/ProfileSidebar";
import { useUnreadCount } from "@/feature/notification/queries/use-notification-queries";
import { useUserProfile } from "../queries/useUser";
import Loader from "@workspace/ui/components/loader/TerminalLoader";

interface UserProfileLayoutProps {
	children: React.ReactNode;
}

const UserProfileLayout: React.FC<UserProfileLayoutProps> = ({ children }) => {
	const { data: userProfile, isLoading } = useUserProfile();
	const { data: unreadData } = useUnreadCount() as {
		data: { unreadCount: number } | undefined;
	};

	if (isLoading) {
		return <Loader />;
	}

	return (
		<div className="min-h-screen bg-[#f8fafc]">
			<style>{`
        * { font-family: 'Lexend', sans-serif; }
        .bg-primary { background-color: #137fec; }
        .text-primary { color: #137fec; }
        .border-primary { border-color: #137fec; }
        .ring-primary { --tw-ring-color: #137fec; }
        .shadow-primary\\/20 { box-shadow: 0 10px 15px -3px rgba(29, 88, 255, 0.2); }
      `}</style>

			<main className="max-w-360 mx-auto w-full px-4 py-10">
				<div className="flex flex-col lg:flex-row gap-8 items-start">
					<ProfileSidebar
						unreadCount={unreadData?.unreadCount || 0}
						userInfo={userProfile}
					/>

					{children}
				</div>
			</main>
		</div>
	);
};

export default UserProfileLayout;
