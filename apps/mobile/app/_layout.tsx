import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, Protected } from "@/providers/auth";
const client = new QueryClient({
	defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});
export default function Layout() {
	return (
		<QueryClientProvider client={client}>
			<AuthProvider>
				<Protected>
					<StatusBar style="dark" />
					<Stack
						screenOptions={{
							headerShadowVisible: false,
							headerTitleStyle: { fontWeight: "700" },
						}}
					>
						<Stack.Screen name="(auth)" options={{ headerShown: false }} />
						<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
						<Stack.Screen name="course/[id]" options={{ title: "Course" }} />
						<Stack.Screen name="open-mobile" options={{ headerShown: false }} />
						<Stack.Screen
							name="lesson/[courseId]/[lectureId]"
							options={{ title: "Learning" }}
						/>
						<Stack.Screen
							name="profile/edit"
							options={{ title: "Edit profile" }}
						/>
						<Stack.Screen
							name="certificate/[courseId]"
							options={{ title: "Certificate" }}
						/>
					</Stack>
				</Protected>
			</AuthProvider>
		</QueryClientProvider>
	);
}
