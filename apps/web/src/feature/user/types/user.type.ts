export type TChangePasswordRequest = {
	email: string;
	currentPassword: string;
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

export type TMentorProfile = {
	specialties?: string[] | null;
	yearsOfExperience?: number | null;
	company?: string | null;
	featured?: boolean | null;
	studentsCount?: number | null;
	coursesCount?: number | null;
};

export type TWalletInfo = {
	balance: number;
};

export type TUpdateUserRequest = {
	username?: string;
	firstName?: string;
	lastName?: string;
	grade?: number;
	pronouns?: string;
	bio?: string;
	phoneNumber?: string;
	location?: string;
	socialProfile?: TSocialProfile;
	jobTitle?: string;
	langKey?: string;
} & TMentorProfile;

export type TAdminUpdateAccountStatusRequest = {
	status: TAccountStatus;
	reason?: string;
	appealUrl?: string;
};

export type TAccountStatus = "ACTIVE" | "SUSPENDED" | "BANNED" | string;

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
} & TMentorProfile;

export type TUserSummary = {
	id: number;
	firstName: string;
	lastName: string;
	avatar: string;
	role: string;
};

export type TAdminUserLookup = {
	id: number;
	fullName: string;
	email: string;
	avatar: string;
};

export type TFollowStats = {
	userId: number;
	followersCount: number;
	followingCount: number;
	isFollowing: boolean;
};

export type TFollowUser = {
	id: number;
	userId: number;
	username: string;
	firstName: string;
	lastName: string;
	avatar: string;
	bio?: string;
	followedAt: string;
};

export type TLoginStreak = {
	currentStreak: number;
	maxStreak: number;
	weeklyLogins: TDailyLoginInfo[];
};

export type TDailyLoginInfo = {
	date: string;
	loggedIn: boolean;
	dayOfWeek: string;
};

export type TInstructor = {
	id: number;
	username: string;
	firstName: string;
	lastName: string;
	avatar: string;
	coverImage?: string;
	email: string;
	role: string;
	bio?: string;
	jobTitle?: string;
	socialProfile?: TSocialProfile;
} & TMentorProfile;
