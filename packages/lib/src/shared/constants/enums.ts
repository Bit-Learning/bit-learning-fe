export const Roles = {
	USER: "USER",
} as const;

export type Roles = keyof typeof Roles;
