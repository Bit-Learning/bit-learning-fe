import { z } from "zod";

const userRoleSchema = z.union([
	z.literal("STUDENT"),
	z.literal("MENTOR"),
	z.literal("MANAGER"),
	z.literal("ADMIN"),
]);
export type UserRole = z.infer<typeof userRoleSchema>;

const mentorApprovalStatusSchema = z.union([
	z.literal("PENDING"),
	z.literal("APPROVED"),
	z.literal("REJECTED"),
]);
export type MentorApprovalStatus = z.infer<typeof mentorApprovalStatusSchema>;

const accountStatusSchema = z.union([
	z.literal("ACTIVE"),
	z.literal("DISABLED"),
]);
export type AccountStatus = z.infer<typeof accountStatusSchema>;

const walletSchema = z.object({
	id: z.number(),
	balance: z.number(),
});
export type Wallet = z.infer<typeof walletSchema>;

const socialProfileSchema = z.unknown().nullable().optional();

const userSchema = z.object({
	id: z.number(),
	username: z.string().optional(),
	firstName: z.string(),
	lastName: z.string(),
	avatar: z.string(),
	coverImage: z.string().nullable().optional(),
	pronouns: z.string().nullable().optional(),
	email: z.string(),
	recoveryEmail: z.string().nullable().optional(),
	activated: z.boolean(),
	role: userRoleSchema,
	bio: z.string().nullable().optional(),
	phoneNumber: z.string().nullable().optional(),
	location: z.string().nullable().optional(),
	socialProfile: socialProfileSchema,
	jobTitle: z.string().nullable().optional(),
	mfaEnabled: z.boolean().optional(),
	accountStatus: accountStatusSchema.optional(),
	accountStatusReason: z.string().nullable().optional(),
	accountStatusUpdatedAt: z.string().nullable().optional(),
	accountStatusUpdatedBy: z.number().nullable().optional(),
	specialties: z.array(z.string()).nullable().optional(),
	yearsOfExperience: z.number().nullable().optional(),
	company: z.string().nullable().optional(),
	featured: z.boolean().nullable().optional(),
	studentsCount: z.number().nullable().optional(),
	coursesCount: z.number().nullable().optional(),
	mentorApprovalStatus: mentorApprovalStatusSchema.nullable().optional(),
	isExternalMentor: z.boolean().nullable().optional(),
	mentorRejectionReason: z.string().nullable().optional(),
	activationKey: z.string().nullable(),
	resetKey: z.string().nullable(),
	langKey: z.string(),
	lastLoginAttempt: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
	wallet: walletSchema,
});
export type User = z.infer<typeof userSchema>;

export const userListSchema = z.array(userSchema);

// Paginated response schema
const sortSchema = z.object({
	sorted: z.boolean(),
	empty: z.boolean(),
	unsorted: z.boolean(),
});

const pageableSchema = z.object({
	pageNumber: z.number(),
	pageSize: z.number(),
	sort: sortSchema,
	offset: z.number(),
	paged: z.boolean(),
	unpaged: z.boolean(),
});

export const pagedUsersSchema = z.object({
	content: userListSchema,
	pageable: pageableSchema,
	last: z.boolean(),
	totalPages: z.number(),
	totalElements: z.number(),
	first: z.boolean(),
	size: z.number(),
	number: z.number(),
	sort: sortSchema,
	numberOfElements: z.number(),
	empty: z.boolean(),
});
export type PagedUsers = z.infer<typeof pagedUsersSchema>;
