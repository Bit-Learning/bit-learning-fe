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
	// Mentor-specific fields that can be updated from profile
	specialties?: string[] | null;
	yearsOfExperience?: number | null;
	company?: string | null;
	studentsCount?: number | null;
	coursesCount?: number | null;
};

// Shared mentor-specific profile fields
export type TMentorProfile = {
	specialties?: string[] | null;
	yearsOfExperience?: number | null;
	company?: string | null;
	featured?: boolean | null;
	studentsCount?: number | null;
	coursesCount?: number | null;
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
} & TMentorProfile;

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
