// Admin-specific auth types (ADMIN role only)

export type TAdminLoginRequest = {
	email: string;
	password: string;
	role: "ADMIN"; // Only ADMIN role allowed
};

export type TAdminLoginResponse = {
	accessToken: string;
	refreshToken: string;
	user: TAdminUser;
};

export type TAdminUser = {
	id: number;
	username: string;
	firstName: string;
	lastName: string;
	avatar: string;
	email: string;
	activated: boolean;
	role: "ADMIN" | "STAFF"; // Only admin and staff can access admin panel
	langKey: string;
	lastLoginAttempt: string | null;
	createdAt: string;
	updatedAt: string;
};

export type TRefreshTokenRequest = {
	refreshToken: string;
};
