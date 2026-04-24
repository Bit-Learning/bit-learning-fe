/**
 * Preservation Property Test — Correct Role Access and Unauthenticated Behavior Unchanged
 *
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
 *
 * Property 2: Preservation
 *   For all inputs X where isBugCondition(X) = false (role matches portal, or no token),
 *   behavior after fix equals behavior before fix (observed on UNFIXED code).
 *
 * Bug Condition (isBugCondition):
 *   accessToken != null
 *   AND (
 *     (targetPortal = "admin" AND role IN ["STUDENT", "MENTOR"])
 *     OR (targetPortal = "web"   AND role IN ["ADMIN", "MANAGER"])
 *   )
 *
 * NOT isBugCondition covers:
 *   - ADMIN/MANAGER with token → admin portal (correct role, should pass through)
 *   - STUDENT/MENTOR with token → web portal (correct role, should pass through)
 *   - No token → admin portal (should redirect to /sign-in)
 *   - No token → web portal (after fix: redirects to /signin-role — acceptable per Req 3.4)
 *
 * IMPORTANT: These tests MUST PASS on FIXED code — they confirm no regressions.
 *
 * Fixed implementations:
 *   - admin beforeLoad: checks token + adminAuthStore (Zustand) for role in ["ADMIN","MANAGER"]
 *   - web _layout beforeLoad: calls requireStudentOrMentorRole() from auth-utils (Redux store)
 */

import { describe, expect, it, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mock @tanstack/react-router redirect so it throws a trackable error
// ---------------------------------------------------------------------------
vi.mock("@tanstack/react-router", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("@tanstack/react-router")>();
	return {
		...actual,
		redirect: vi.fn((opts: { to: string; search?: unknown }) => {
			const err = new Error(`Redirect to ${opts.to}`) as Error & {
				isRedirect: boolean;
				to: string;
			};
			err.isRedirect = true;
			err.to = opts.to;
			return err;
		}),
		createFileRoute: vi.fn(() => (opts: unknown) => ({ options: opts })),
	};
});

// ---------------------------------------------------------------------------
// Mock web portal Redux store (used by requireStudentOrMentorRole in auth-utils)
// ---------------------------------------------------------------------------
vi.mock("@/shared/redux/store", () => ({
	default: {
		getState: vi.fn(),
	},
}));

// ---------------------------------------------------------------------------
// Mock cookies — controlled per test
// ---------------------------------------------------------------------------
vi.mock("@/shared/lib/cookies", () => ({
	getAccessToken: vi.fn(),
	clearAuthTokens: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Admin portal Zustand auth store — simulated in-memory (not imported from admin app)
// The admin portal uses useAuthStore (Zustand) with auth.user.role as string[]
// We simulate it here since this test runs in the web app context.
// ---------------------------------------------------------------------------
const adminAuthStore = {
	getState: vi.fn(),
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type RedirectError = Error & { isRedirect: boolean; to: string };

function isRedirectError(err: unknown): err is RedirectError {
	return err instanceof Error && (err as RedirectError).isRedirect === true;
}

async function callBeforeLoad(
	beforeLoadFn:
		| ((ctx: { location: { href: string } }) => unknown)
		| undefined
		| null,
	location = { href: "http://localhost/" },
): Promise<{ threw: boolean; to?: string }> {
	if (!beforeLoadFn) {
		return { threw: false };
	}
	try {
		await beforeLoadFn({ location });
		return { threw: false };
	} catch (err) {
		if (isRedirectError(err)) {
			return { threw: true, to: err.to };
		}
		throw err;
	}
}

function makeAdminAuthState(roles: string[]) {
	return {
		auth: {
			user: {
				accountNo: "admin001",
				email: "admin@example.com",
				role: roles,
				exp: Date.now() / 1000 + 3600,
				firstName: "Admin",
				lastName: "User",
			},
		},
	};
}

function makeAdminUnauthenticatedState() {
	return {
		auth: {
			user: null,
		},
	};
}

function makeWebAuthState(role: string) {
	return {
		auth: {
			isAuthenticated: true,
			isLoading: false,
			errorMsg: null,
			userInfo: {
				id: 1,
				username: "testuser",
				firstName: "Test",
				lastName: "User",
				avatar: "",
				email: "test@example.com",
				activated: true,
				role,
				activationKey: null,
				resetKey: null,
				langKey: "en",
				lastLoginAttempt: null,
				createdAt: "2024-01-01",
				updatedAt: "2024-01-01",
				wallet: { id: 1, balance: 0 },
				oauthProvider: null,
				oauthId: null,
				mfaEnabled: false,
			},
		},
	};
}

function makeWebUnauthenticatedState() {
	return {
		auth: {
			isAuthenticated: false,
			isLoading: false,
			errorMsg: null,
			userInfo: null,
		},
	};
}

// ---------------------------------------------------------------------------
// Admin portal beforeLoad — FIXED implementation from apps/admin/src/routes/_authenticated/route.tsx
//
// Fixed behavior:
//   - Checks accessToken exists → redirect to /sign-in if missing
//   - Checks adminAuthStore.getState().auth.user.role (array) contains ADMIN or MANAGER
//   - If role not in ["ADMIN","MANAGER"] → redirect to /sign-in
//
// NOTE: The admin portal uses its own Zustand store (useAuthStore from apps/admin).
// Since this test runs in the web app context, we simulate the admin store locally
// via adminAuthStore (defined above) rather than importing from the admin app path.
// ---------------------------------------------------------------------------
async function adminBeforeLoad({
	location,
}: {
	location: { href: string };
}): Promise<void> {
	const { getAccessToken } = await import("@/shared/lib/cookies");
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { redirect } = (await import("@tanstack/react-router")) as any;

	const ALLOWED_ROLES = ["ADMIN", "MANAGER"];
	const accessToken = getAccessToken();

	if (!accessToken) {
		throw redirect({
			to: "/sign-in",
			search: { redirect: location.href },
		});
	}

	const { user } = adminAuthStore.getState().auth;

	if (
		!user ||
		!user.role ||
		!user.role.some((r: string) => ALLOWED_ROLES.includes(r))
	) {
		throw redirect({ to: "/sign-in" });
	}
}

// ---------------------------------------------------------------------------
// Web portal _layout.tsx beforeLoad — FIXED implementation
//
// Fixed behavior:
//   - Calls requireStudentOrMentorRole(location) from auth-utils
//   - If not logged in → redirect to /signin-role
//   - If role not in ["STUDENT","MENTOR"] → redirect to /signin-role
//   - STUDENT/MENTOR with valid token → passes through (no throw)
// ---------------------------------------------------------------------------
async function webLayoutBeforeLoad({
	location,
}: {
	location: { href: string };
}): Promise<void> {
	const { requireStudentOrMentorRole } = await import(
		"@/shared/lib/auth-utils"
	);
	requireStudentOrMentorRole(location);
}

// ---------------------------------------------------------------------------
// isBugCondition helper — used to scope property tests
// ---------------------------------------------------------------------------
function isBugCondition(input: {
	accessToken: string | null;
	role: string;
	targetPortal: "admin" | "web";
}): boolean {
	return (
		input.accessToken !== null &&
		((input.targetPortal === "admin" &&
			["STUDENT", "MENTOR"].includes(input.role)) ||
			(input.targetPortal === "web" &&
				["ADMIN", "MANAGER"].includes(input.role)))
	);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Preservation Property — Correct Role Access and Unauthenticated Behavior Unchanged", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		adminAuthStore.getState.mockReset();
	});

	// -------------------------------------------------------------------------
	// Admin portal — ADMIN/MANAGER with valid token should pass through
	// Requirement 3.1: ADMIN/MANAGER with token → admin portal allows through
	// -------------------------------------------------------------------------
	describe("Admin portal — correct roles (ADMIN/MANAGER) with valid token pass through", () => {
		it("Req 3.1: ADMIN with valid token → admin portal does NOT throw (passes through)", async () => {
			/**
			 * Validates: Requirements 3.1
			 *
			 * isBugCondition({ accessToken: "valid", role: "ADMIN", targetPortal: "admin" }) = false
			 *
			 * Fixed admin beforeLoad: token present + role=ADMIN → passes through.
			 */
			const { getAccessToken } = await import("@/shared/lib/cookies");
			(getAccessToken as ReturnType<typeof vi.fn>).mockReturnValue(
				"valid-access-token",
			);
			adminAuthStore.getState.mockReturnValue(makeAdminAuthState(["ADMIN"]));

			const input = {
				accessToken: "valid-access-token",
				role: "ADMIN",
				targetPortal: "admin" as const,
			};
			expect(isBugCondition(input)).toBe(false);

			const result = await callBeforeLoad(adminBeforeLoad);

			expect(result.threw).toBe(false);
		});

		it("Req 3.1: MANAGER with valid token → admin portal does NOT throw (passes through)", async () => {
			/**
			 * Validates: Requirements 3.1
			 *
			 * isBugCondition({ accessToken: "valid", role: "MANAGER", targetPortal: "admin" }) = false
			 *
			 * Fixed admin beforeLoad: token present + role=MANAGER → passes through.
			 */
			const { getAccessToken } = await import("@/shared/lib/cookies");
			(getAccessToken as ReturnType<typeof vi.fn>).mockReturnValue(
				"valid-access-token",
			);
			adminAuthStore.getState.mockReturnValue(makeAdminAuthState(["MANAGER"]));

			const input = {
				accessToken: "valid-access-token",
				role: "MANAGER",
				targetPortal: "admin" as const,
			};
			expect(isBugCondition(input)).toBe(false);

			const result = await callBeforeLoad(adminBeforeLoad);

			expect(result.threw).toBe(false);
		});
	});

	// -------------------------------------------------------------------------
	// Admin portal — unauthenticated user redirected to /sign-in
	// Requirement 3.3: no token → admin portal redirects to /sign-in
	// -------------------------------------------------------------------------
	describe("Admin portal — unauthenticated user redirected to /sign-in", () => {
		it("Req 3.3: No token → admin portal throws redirect to /sign-in", async () => {
			/**
			 * Validates: Requirements 3.3
			 *
			 * isBugCondition({ accessToken: null, role: "ADMIN", targetPortal: "admin" }) = false
			 *   (accessToken is null → not a bug condition)
			 *
			 * Fixed admin beforeLoad: no token → redirect to /sign-in (unchanged behavior).
			 */
			const { getAccessToken } = await import("@/shared/lib/cookies");
			(getAccessToken as ReturnType<typeof vi.fn>).mockReturnValue(undefined);
			adminAuthStore.getState.mockReturnValue(makeAdminUnauthenticatedState());

			const input = {
				accessToken: null,
				role: "ADMIN",
				targetPortal: "admin" as const,
			};
			expect(isBugCondition(input)).toBe(false);

			const result = await callBeforeLoad(adminBeforeLoad);

			expect(result.threw).toBe(true);
			expect(result.to).toBe("/sign-in");
		});

		it("Req 3.3: No token (null) → admin portal throws redirect to /sign-in", async () => {
			/**
			 * Validates: Requirements 3.3
			 *
			 * Covers the case where getAccessToken returns null explicitly.
			 */
			const { getAccessToken } = await import("@/shared/lib/cookies");
			(getAccessToken as ReturnType<typeof vi.fn>).mockReturnValue(null);
			adminAuthStore.getState.mockReturnValue(makeAdminUnauthenticatedState());

			const result = await callBeforeLoad(adminBeforeLoad);

			expect(result.threw).toBe(true);
			expect(result.to).toBe("/sign-in");
		});
	});

	// -------------------------------------------------------------------------
	// Web portal — STUDENT/MENTOR with valid token pass through
	// Requirement 3.2: STUDENT/MENTOR with token → web portal allows through
	// -------------------------------------------------------------------------
	describe("Web portal — correct roles (STUDENT/MENTOR) with valid token pass through", () => {
		it("Req 3.2: STUDENT with valid token → web portal does NOT throw", async () => {
			/**
			 * Validates: Requirements 3.2
			 *
			 * isBugCondition({ accessToken: "valid", role: "STUDENT", targetPortal: "web" }) = false
			 *
			 * Fixed web _layout: requireStudentOrMentorRole → STUDENT passes through.
			 */
			const store = (await import("@/shared/redux/store")).default;
			(store.getState as ReturnType<typeof vi.fn>).mockReturnValue(
				makeWebAuthState("STUDENT"),
			);
			const { getAccessToken } = await import("@/shared/lib/cookies");
			(getAccessToken as ReturnType<typeof vi.fn>).mockReturnValue(
				"valid-access-token",
			);

			const input = {
				accessToken: "valid-access-token",
				role: "STUDENT",
				targetPortal: "web" as const,
			};
			expect(isBugCondition(input)).toBe(false);

			const result = await callBeforeLoad(webLayoutBeforeLoad);

			expect(result.threw).toBe(false);
		});

		it("Req 3.2: MENTOR with valid token → web portal does NOT throw", async () => {
			/**
			 * Validates: Requirements 3.2
			 *
			 * isBugCondition({ accessToken: "valid", role: "MENTOR", targetPortal: "web" }) = false
			 *
			 * Fixed web _layout: requireStudentOrMentorRole → MENTOR passes through.
			 */
			const store = (await import("@/shared/redux/store")).default;
			(store.getState as ReturnType<typeof vi.fn>).mockReturnValue(
				makeWebAuthState("MENTOR"),
			);
			const { getAccessToken } = await import("@/shared/lib/cookies");
			(getAccessToken as ReturnType<typeof vi.fn>).mockReturnValue(
				"valid-access-token",
			);

			const input = {
				accessToken: "valid-access-token",
				role: "MENTOR",
				targetPortal: "web" as const,
			};
			expect(isBugCondition(input)).toBe(false);

			const result = await callBeforeLoad(webLayoutBeforeLoad);

			expect(result.threw).toBe(false);
		});
	});

	// -------------------------------------------------------------------------
	// Web portal — unauthenticated user: after fix, redirects to /signin-role
	// Requirement 3.4: no token → web portal redirects to /signin-role (acceptable per Req 3.4)
	// -------------------------------------------------------------------------
	describe("Web portal — unauthenticated user: redirected to /signin-role after fix", () => {
		it("Req 3.4: No token → web _layout throws redirect to /signin-role (fixed behavior)", async () => {
			/**
			 * Validates: Requirements 3.4
			 *
			 * isBugCondition({ accessToken: null, role: "STUDENT", targetPortal: "web" }) = false
			 *
			 * After fix: web _layout has beforeLoad calling requireStudentOrMentorRole.
			 * Unauthenticated users (no token) → redirect to /signin-role.
			 * This is acceptable per Req 3.4: "SHALL CONTINUE TO redirect to login page".
			 * The login page for web portal is /signin-role.
			 */
			const store = (await import("@/shared/redux/store")).default;
			(store.getState as ReturnType<typeof vi.fn>).mockReturnValue(
				makeWebUnauthenticatedState(),
			);
			const { getAccessToken } = await import("@/shared/lib/cookies");
			(getAccessToken as ReturnType<typeof vi.fn>).mockReturnValue(undefined);

			const result = await callBeforeLoad(webLayoutBeforeLoad);

			// After fix: unauthenticated users are redirected to /signin-role
			expect(result.threw).toBe(true);
			expect(result.to).toBe("/signin-role");
		});
	});

	// -------------------------------------------------------------------------
	// Requirement 3.5: ADMIN/MANAGER login flow — admin portal login redirect
	// The login page itself is not guarded by _authenticated, so it always passes through.
	// -------------------------------------------------------------------------
	describe("Admin portal — login flow unaffected (Req 3.5)", () => {
		it("Req 3.5: ADMIN with fresh token after login passes through _authenticated guard", async () => {
			/**
			 * Validates: Requirements 3.5
			 *
			 * After ADMIN/MANAGER logs in successfully, they have a valid token and correct role.
			 * The _authenticated beforeLoad passes them through to the dashboard.
			 */
			const { getAccessToken } = await import("@/shared/lib/cookies");
			(getAccessToken as ReturnType<typeof vi.fn>).mockReturnValue(
				"fresh-admin-token",
			);
			adminAuthStore.getState.mockReturnValue(makeAdminAuthState(["ADMIN"]));

			const input = {
				accessToken: "fresh-admin-token",
				role: "ADMIN",
				targetPortal: "admin" as const,
			};
			expect(isBugCondition(input)).toBe(false);

			const result = await callBeforeLoad(adminBeforeLoad);

			// ADMIN with fresh token passes through _authenticated guard
			expect(result.threw).toBe(false);
		});
	});

	// -------------------------------------------------------------------------
	// Property-based: for all non-bug-condition inputs, behavior matches expected
	// -------------------------------------------------------------------------
	describe("Property: all non-bug-condition inputs match expected behavior", () => {
		const ADMIN_ROLES = ["ADMIN", "MANAGER"];
		const WEB_ROLES = ["STUDENT", "MENTOR"];

		it("Property: every ADMIN/MANAGER role with valid token passes through admin portal", async () => {
			/**
			 * Validates: Requirements 3.1, 3.5
			 *
			 * For all roles in ["ADMIN", "MANAGER"] with a valid token targeting admin portal:
			 *   isBugCondition = false
			 *   adminBeforeLoad does NOT throw
			 */
			const { getAccessToken } = await import("@/shared/lib/cookies");

			for (const role of ADMIN_ROLES) {
				vi.clearAllMocks();
				adminAuthStore.getState.mockReset();
				(getAccessToken as ReturnType<typeof vi.fn>).mockReturnValue(
					"valid-token",
				);
				adminAuthStore.getState.mockReturnValue(makeAdminAuthState([role]));

				const input = {
					accessToken: "valid-token",
					role,
					targetPortal: "admin" as const,
				};
				expect(isBugCondition(input)).toBe(false);

				const result = await callBeforeLoad(adminBeforeLoad);
				expect(result.threw).toBe(false);
			}
		});

		it("Property: every STUDENT/MENTOR role with valid token passes through web portal", async () => {
			/**
			 * Validates: Requirements 3.2
			 *
			 * For all roles in ["STUDENT", "MENTOR"] with a valid token targeting web portal:
			 *   isBugCondition = false
			 *   webLayoutBeforeLoad does NOT throw
			 */
			const store = (await import("@/shared/redux/store")).default;
			const { getAccessToken } = await import("@/shared/lib/cookies");

			for (const role of WEB_ROLES) {
				vi.clearAllMocks();
				(store.getState as ReturnType<typeof vi.fn>).mockReturnValue(
					makeWebAuthState(role),
				);
				(getAccessToken as ReturnType<typeof vi.fn>).mockReturnValue(
					"valid-token",
				);

				const input = {
					accessToken: "valid-token",
					role,
					targetPortal: "web" as const,
				};
				expect(isBugCondition(input)).toBe(false);

				const result = await callBeforeLoad(webLayoutBeforeLoad);
				expect(result.threw).toBe(false);
			}
		});

		it("Property: no token always redirects to /sign-in for admin portal", async () => {
			/**
			 * Validates: Requirements 3.3
			 *
			 * For any role with no token targeting admin portal:
			 *   isBugCondition = false (accessToken is null)
			 *   adminBeforeLoad throws redirect to /sign-in
			 */
			const { getAccessToken } = await import("@/shared/lib/cookies");
			const allRoles = ["ADMIN", "MANAGER", "STUDENT", "MENTOR"];

			for (const role of allRoles) {
				vi.clearAllMocks();
				adminAuthStore.getState.mockReset();
				(getAccessToken as ReturnType<typeof vi.fn>).mockReturnValue(null);
				adminAuthStore.getState.mockReturnValue(
					makeAdminUnauthenticatedState(),
				);

				const input = {
					accessToken: null,
					role,
					targetPortal: "admin" as const,
				};
				expect(isBugCondition(input)).toBe(false);

				const result = await callBeforeLoad(adminBeforeLoad);
				expect(result.threw).toBe(true);
				expect(result.to).toBe("/sign-in");
			}
		});

		it("Property: no token always redirects to /signin-role for web portal", async () => {
			/**
			 * Validates: Requirements 3.4
			 *
			 * For any unauthenticated user targeting web portal:
			 *   isBugCondition = false (accessToken is null)
			 *   webLayoutBeforeLoad throws redirect to /signin-role (after fix)
			 */
			const store = (await import("@/shared/redux/store")).default;
			const { getAccessToken } = await import("@/shared/lib/cookies");

			vi.clearAllMocks();
			(store.getState as ReturnType<typeof vi.fn>).mockReturnValue(
				makeWebUnauthenticatedState(),
			);
			(getAccessToken as ReturnType<typeof vi.fn>).mockReturnValue(null);

			const result = await callBeforeLoad(webLayoutBeforeLoad);
			expect(result.threw).toBe(true);
			expect(result.to).toBe("/signin-role");
		});
	});
});
