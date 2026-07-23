import { useRouter, useSegments } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";
import { clearSession, getSession, saveSession } from "@/lib/session";
import type { Session } from "@/lib/types";
type Auth = {
	session: Session | null;
	ready: boolean;
	signIn: (s: Session) => Promise<void>;
	signOut: () => Promise<void>;
};
const Context = createContext<Auth | null>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [session, setSession] = useState<Session | null>(null);
	const [ready, setReady] = useState(false);
	useEffect(() => {
		getSession()
			.then(setSession)
			.finally(() => setReady(true));
	}, []);
	return (
		<Context.Provider
			value={{
				session,
				ready,
				signIn: async (s) => {
					await saveSession(s);
					setSession(s);
				},
				signOut: async () => {
					await clearSession();
					setSession(null);
				},
			}}
		>
			{children}
		</Context.Provider>
	);
}
export const useAuth = () => {
	const value = useContext(Context);
	if (!value) throw new Error("AuthProvider missing");
	return value;
};
export function Protected({ children }: { children: React.ReactNode }) {
	const { session, ready } = useAuth();
	const segments = useSegments();
	const router = useRouter();
	useEffect(() => {
		if (!ready) return;
		const authRoute = segments[0] === "(auth)";
		if (!session && !authRoute) router.replace("/(auth)/login");
		if (session && authRoute) router.replace("/(tabs)");
	}, [ready, session, segments, router]);
	return <>{children}</>;
}
