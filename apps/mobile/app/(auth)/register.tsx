import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, ErrorText, Field, colors } from "@/components/ui";
import { api } from "@/lib/api";
export default function Register() {
	const [form, setForm] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
	});
	const [error, setError] = useState("");
	const [busy, setBusy] = useState(false);
	const router = useRouter();
	const update = (key: keyof typeof form) => (value: string) =>
		setForm({ ...form, [key]: value });
	const submit = async () => {
		if (Object.values(form).some((v) => !v))
			return setError("Complete all fields.");
		if (form.password.length < 8)
			return setError("Password must have at least 8 characters.");
		setBusy(true);
		try {
			await api.post("/auth/register", { ...form, role: "STUDENT" });
			router.replace("/(auth)/login");
		} catch (e) {
			setError(e instanceof Error ? e.message : "Unable to register");
		} finally {
			setBusy(false);
		}
	};
	return (
		<View style={s.page}>
			<Text style={s.title}>Create account</Text>
			<Field
				placeholder="First name"
				value={form.firstName}
				onChangeText={update("firstName")}
			/>
			<Field
				placeholder="Last name"
				value={form.lastName}
				onChangeText={update("lastName")}
			/>
			<Field
				placeholder="Email"
				value={form.email}
				autoCapitalize="none"
				onChangeText={update("email")}
			/>
			<Field
				placeholder="Password (8+ characters)"
				secureTextEntry
				value={form.password}
				onChangeText={update("password")}
			/>
			{error ? <ErrorText>{error}</ErrorText> : null}
			<Button title="Create learner account" onPress={submit} loading={busy} />
			<Link href="/(auth)/login" style={s.link}>
				Already have an account? Sign in
			</Link>
		</View>
	);
}
const s = StyleSheet.create({
	page: {
		flex: 1,
		justifyContent: "center",
		padding: 24,
		gap: 14,
		backgroundColor: colors.bg,
	},
	title: {
		fontSize: 30,
		fontWeight: "700",
		color: colors.navy,
		marginBottom: 10,
	},
	link: { color: colors.blue, textAlign: "center", marginTop: 8 },
});
