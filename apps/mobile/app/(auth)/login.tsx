import * as Google from "expo-auth-session/providers/google";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, ErrorText, Field, colors } from "@/components/ui";
import { api } from "@/lib/api";
import { useAuth } from "@/providers/auth";
import type { Session } from "@/lib/types";
export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");
	const { signIn } = useAuth();
	const router = useRouter();
	const [request, response, promptAsync] = Google.useAuthRequest({
		clientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
		androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
		iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
	});
	useEffect(() => {
		if (response?.type === "success")
			api
				.post<Session>("/auth/oauth2/google", { code: response.params.code })
				.then(signIn)
				.then(() => router.replace("/(tabs)"))
				.catch((e) => setError(e.message));
	}, [response, signIn, router]);
	const login = async () => {
		if (!email || !password) return setError("Enter your email and password.");
		setBusy(true);
		setError("");
		try {
			await signIn(
				await api.post<Session>("/auth/login-user", {
					email,
					password,
					role: "STUDENT",
				}),
			);
			router.replace("/(tabs)");
		} catch (e) {
			setError(e instanceof Error ? e.message : "Unable to sign in");
		} finally {
			setBusy(false);
		}
	};
	return (
		<View style={s.page}>
			<Text style={s.brand}>BIT Learning</Text>
			<Text style={s.title}>Welcome back</Text>
			<Field
				placeholder="Email"
				autoCapitalize="none"
				keyboardType="email-address"
				value={email}
				onChangeText={setEmail}
			/>
			<Field
				placeholder="Password"
				secureTextEntry
				value={password}
				onChangeText={setPassword}
			/>
			{error ? <ErrorText>{error}</ErrorText> : null}
			<Button title="Sign in" onPress={login} loading={busy} />
			<Button
				title="Continue with Google"
				onPress={() => promptAsync()}
				secondary
				loading={!request}
			/>
			<Link href="/(auth)/register" style={s.link}>
				New learner? Create an account
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
	brand: { fontWeight: "800", fontSize: 25, color: colors.blue },
	title: {
		fontSize: 30,
		fontWeight: "700",
		color: colors.navy,
		marginBottom: 10,
	},
	link: { color: colors.blue, textAlign: "center", marginTop: 8 },
});
