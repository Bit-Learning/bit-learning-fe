import { useState } from "react";
import authService from "../services/authService";

interface AuthProps {
	onSuccess: (username: string, userId: number, role: string) => void;
}

export default function Auth({ onSuccess }: AuthProps) {
	const [isLogin, setIsLogin] = useState(true);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [email, setEmail] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		try {
			const response = isLogin
				? await authService.login({ username, password })
				: await authService.register({ username, password, email });

			authService.storeAuthData(
				response.username,
				response.userId,
				response.role,
			);
			onSuccess(response.username, response.userId, response.role);
		} catch (err: any) {
			setError(err.response?.data || "Authentication failed");
		}
	};

	return (
		<div className="min-h-screen bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
			<div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
				<h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
					Game Store
				</h1>

				<div className="flex gap-2 mb-6">
					<button
						onClick={() => setIsLogin(true)}
						className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
							isLogin
								? "bg-blue-500 text-white"
								: "bg-gray-200 text-gray-600 hover:bg-gray-300"
						}`}
					>
						Login
					</button>
					<button
						onClick={() => setIsLogin(false)}
						className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
							!isLogin
								? "bg-blue-500 text-white"
								: "bg-gray-200 text-gray-600 hover:bg-gray-300"
						}`}
					>
						Register
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Username
						</label>
						<input
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Password
						</label>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							required
						/>
					</div>

					{!isLogin && (
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Email
							</label>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								required
							/>
						</div>
					)}

					{error && (
						<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
							{error}
						</div>
					)}

					<button
						type="submit"
						className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors"
					>
						{isLogin ? "Login" : "Register"}
					</button>
				</form>
			</div>
		</div>
	);
}
