// Admin-specific auth types

export type TUserRole = "ADMIN" | "MANAGER" | "STUDENT" | "MENTOR";

export type TAdminLoginRequest = {
	email: string;
	password: string;
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
	role: TUserRole;
	langKey: string;
	lastLoginAttempt: string | null;
	createdAt: string;
	updatedAt: string;
};

export type TRefreshTokenRequest = {
	refreshToken: string;
};
