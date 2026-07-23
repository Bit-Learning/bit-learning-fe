export type TAuthState = {
	isAuthenticated: boolean;
	isLoading: boolean;
	errorMsg: string | null;
	userInfo: TUserProfile | null;
};

export type TLoginRoleRequest = {
	email: string;
	password: string;
	role: "STUDENT" | "MENTOR";
};

export type TLoginRequest = {
	email: string;
	password: string;
};

export type TRegisterRequest = {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	role: string;
	grade?: number;
	oauthProvider?: string;
	oauthId?: string;
	avatar?: string;
	specialties?: string[];
	yearsOfExperience?: number;
	company?: string;
	studentsCount?: number;
	coursesCount?: number;
};

export type TForgotPasswordRequest = {
	email: string;
};

export type TResetPasswordRequest = {
	email: string;
	key: string;
	newPassword: string;
	confirmNewPassword: string;
};

export type TSocialProfile = {
	facebook?: string;
	instagram?: string;
	threads?: string;
	twitter?: string;
	linkedin?: string;
	github?: string;
	website?: string;
};

export type TWalletInfo = {
	balance: number;
};

export type TUserProfile = {
	id: number;
	username: string;
	firstName: string;
	lastName: string;
	avatar: string;
	grade: number;
	coverImage?: string;
	pronouns?: string;
	email: string;
	recoveryEmail?: string | null;
	activated: boolean;
	role: string;
	activationKey: string | null;
	resetKey: string | null;
	langKey: string;
	lastLoginAttempt: string | null;
	createdAt: string;
	updatedAt: string;
	wallet: TWalletInfo;
	bio?: string;
	phoneNumber?: string;
	location?: string;
	socialProfile?: TSocialProfile;
	jobTitle?: string;
	mfaEnabled: boolean;
	mentorApprovalStatus?: "PENDING" | "APPROVED" | "REJECTED" | null;
	isExternalMentor?: boolean | null;
	mentorRejectionReason?: string | null;
	accountStatus?: string | null;
	accountStatusReason?: string | null;
	accountStatusUpdatedAt?: string | null;
	accountStatusUpdatedBy?: number | null;
	specialties?: string[] | null;
	yearsOfExperience?: number | null;
	company?: string | null;
	featured?: boolean | null;
	studentsCount?: number | null;
	coursesCount?: number | null;
	favoriteCategories: string[];
};

export type TLoginResponse = {
	accessToken: string;
	user: TUserProfile;
};

export type TTwoFactorAuthResponse = {
	secret: string;
	qrCodeUrl: string;
	manualEntryKey: string;
};

export type TVerifyTotpRequest = {
	totpCode: string;
};

export type TLoginWith2FARequest = {
	email: string;
	password: string;
	totpCode: string;
};

export type TTwoFactorRequiredResponse = {
	requires2FA: boolean;
	email: string;
	message: string;
};

export type TCompleteTwoFactorRequest = {
	email: string;
	totpCode: string;
};
