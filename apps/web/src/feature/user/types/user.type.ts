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

export type TUpdateUserRequest = {
	username?: string;
	firstName?: string;
	lastName?: string;
	pronouns?: string;
	bio?: string;
	phoneNumber?: string;
	location?: string;
	socialProfile?: TSocialProfile;
	jobTitle?: string;
	langKey?: string;
};

export type TUserProfile = {
	id: number;
	username: string;
	firstName: string;
	lastName: string;
	avatar: string;
	coverImage?: string;
	pronouns?: string;
	email: string;
	activated: boolean;
	role: string;
	activationKey: string | null;
	resetKey: string | null;
	langKey: string;
	lastLoginAttempt: string | null;
	createdAt: string;
	updatedAt: string;
	wallet: TWalletInfo;
	oauthProvider: string | null;
	oauthId: string | null;
	mfaEnabled: boolean;
	bio?: string;
	phoneNumber?: string;
	location?: string;
	socialProfile?: TSocialProfile;
	jobTitle?: string;
};

export type TWalletInfo = {
	id: number;
	balance: number;
};

export type TFollowStats = {
	userId: number;
	followersCount: number;
	followingCount: number;
	isFollowing: boolean;
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
};
