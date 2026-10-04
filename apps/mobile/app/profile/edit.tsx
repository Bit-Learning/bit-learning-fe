import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Field, colors } from "@/components/ui";
import { learner } from "@/lib/learner";
import { useAuth } from "@/providers/auth";
export default function EditProfile() {
	const { session, signIn } = useAuth();
	const [firstName, setFirstName] = useState(session?.user.firstName ?? "");
	const [lastName, setLastName] = useState(session?.user.lastName ?? "");
	const [phoneNumber, setPhone] = useState(session?.user.phoneNumber ?? "");
	const [busy, setBusy] = useState(false);
	const router = useRouter();
	if (!session) return null;
	const user = session.user;
	const save = async () => {
		setBusy(true);
		try {
			const updated = await learner.updateProfile({
				firstName,
				lastName,
				phoneNumber,
			});
			await signIn({ ...session, user: { ...user, ...updated } });
			router.back();
		} finally {
			setBusy(false);
		}
	};
	return (
		<View style={s.page}>
			<Field
				value={firstName}
				onChangeText={setFirstName}
				placeholder="First name"
			/>
			<Field
				value={lastName}
				onChangeText={setLastName}
				placeholder="Last name"
			/>
			<Field
				value={phoneNumber}
				onChangeText={setPhone}
				placeholder="Phone number"
				keyboardType="phone-pad"
			/>
			<Button title="Save changes" onPress={save} loading={busy} />
		</View>
	);
}
const s = StyleSheet.create({
	page: { flex: 1, padding: 16, gap: 14, backgroundColor: colors.bg },
});
