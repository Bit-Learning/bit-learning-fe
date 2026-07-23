export type DayOfWeek =
	| "MONDAY"
	| "TUESDAY"
	| "WEDNESDAY"
	| "THURSDAY"
	| "FRIDAY"
	| "SATURDAY"
	| "SUNDAY";

export interface DailyLoginInfo {
	date: string;
	loggedIn: boolean;
	dayOfWeek: DayOfWeek;
}

export interface LoginStreakResponse {
	currentStreak: number;
	maxStreak: number;
	weeklyLogins: DailyLoginInfo[];
}
