import {
	useParams,
	useNavigate,
	Navigate,
	useLocation,
} from "react-router-dom";
import StudentProfileView from "../components/StudentProfile";

export default function StudentProfilePage() {
	const params = useParams<{ userId: string }>();
	const { userId } = params;
	const navigate = useNavigate();
	const location = useLocation();

	console.log("StudentProfilePage DEBUG:");
	console.log("- Full params object:", params);
	console.log("- userId param:", userId);
	console.log("- Current pathname:", location.pathname);
	console.log("- All params keys:", Object.keys(params));

	if (!userId) {
		console.error("No userId parameter found");
		return <Navigate to="/" />;
	}

	const userIdNum = Number.parseInt(userId, 10);

	if (Number.isNaN(userIdNum)) {
		console.error("Invalid userId:", userId);
		return <Navigate to="/" />;
	}

	console.log("Rendering StudentProfileView with userId:", userIdNum);

	return <StudentProfileView userId={userIdNum} onBack={() => navigate(-1)} />;
}
