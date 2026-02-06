import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "../components/Auth";
import Leaderboard from "../components/Leaderboard";
import BucketManager from "../components/BucketManager";
import GameListNetflix from "../components/GameListNetflix";
import StudentProfilePage from "./StudentProfilePage";

interface AppRoutesProps {
	username: string | null;
	role: string | null;
	onAuthSuccess: (user: string, uid: number, userRole: string) => void;
}

export default function AppRoutes({
	username,
	role,
	onAuthSuccess,
}: AppRoutesProps) {
	return (
		<Routes>
			<Route
				path="/"
				element={<GameListNetflix username={username} role={role} />}
			/>
			<Route path="/leaderboard" element={<Leaderboard />} />
			<Route path="/buckets" element={<BucketManager />} />
			<Route path="/student/:userId" element={<StudentProfilePage />} />
			<Route
				path="/login"
				element={
					username ? <Navigate to="/" /> : <Auth onSuccess={onAuthSuccess} />
				}
			/>
			<Route path="*" element={<Navigate to="/" />} />
		</Routes>
	);
}
