import { Link, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Button, Card, colors } from "@/components/ui";
import { useAuth } from "@/providers/auth";
export default function Profile() {
	const { session, signOut } = useAuth();
	const router = useRouter();
	if (!session) return null;
	const user = session.user;
	return (
		<View style={s.page}>
			<Card>
				<Text style={s.name}>
					{user.firstName} {user.lastName}
				</Text>
				<Text style={s.email}>{user.email}</Text>
				<Text style={s.grade}>
					Learner{user.grade ? ` · Grade ${user.grade}` : ""}
				</Text>
			</Card>
			<Link href="/profile/edit" style={s.link}>
				Edit profile
			</Link>
			<Button
				title="Log out"
				secondary
				onPress={() => signOut().then(() => router.replace("/(auth)/login"))}
			/>
		</View>
	);
}
const s = StyleSheet.create({
	page: { flex: 1, padding: 16, gap: 16, backgroundColor: colors.bg },
	name: { fontSize: 22, fontWeight: "800", color: colors.navy },
	email: { color: colors.muted },
	grade: { color: colors.blue },
	link: { color: colors.blue, fontWeight: "700", padding: 8 },
});
