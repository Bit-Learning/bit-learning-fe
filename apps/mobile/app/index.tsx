import { Redirect } from "expo-router";
import { useAuth } from "@/providers/auth";
import { Loading } from "@/components/ui";
export default function Index() {
	const { session, ready } = useAuth();
	if (!ready) return <Loading />;
	return <Redirect href={session ? "/(tabs)" : "/(auth)/login"} />;
}
