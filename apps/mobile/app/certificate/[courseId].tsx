import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
import { Button, ErrorText, colors } from "@/components/ui";
import { apiUrl } from "@/lib/api";
import { getSession } from "@/lib/session";
export default function Certificate() {
	const id = Number(useLocalSearchParams<{ courseId: string }>().courseId);
	const [uri, setUri] = useState("");
	const [error, setError] = useState("");
	const [busy, setBusy] = useState(false);
	const fetchCertificate = async () => {
		setBusy(true);
		setError("");
		try {
			const session = await getSession();
			const target = `${FileSystem.cacheDirectory}certificate-${id}.pdf`;
			const result = await FileSystem.downloadAsync(
				apiUrl(`/courses/${id}/certificate/download`),
				target,
				{ headers: { Authorization: `Bearer ${session?.accessToken ?? ""}` } },
			);
			if (result.status >= 400)
				throw new Error("Certificate is not available yet.");
			setUri(result.uri);
		} catch (e) {
			setError(
				e instanceof Error ? e.message : "Could not download certificate",
			);
		} finally {
			setBusy(false);
		}
	};
	return (
		<View style={s.page}>
			{uri ? (
				<WebView source={{ uri }} style={s.web} />
			) : (
				<Text>Your course certificate will appear here after completion.</Text>
			)}
			{error ? <ErrorText>{error}</ErrorText> : null}
			<Button
				title={uri ? "Refresh certificate" : "Get certificate"}
				onPress={fetchCertificate}
				loading={busy}
			/>
			{uri ? (
				<Button
					title="Share or save PDF"
					secondary
					onPress={() => Sharing.shareAsync(uri)}
				/>
			) : null}
		</View>
	);
}
const s = StyleSheet.create({
	page: { flex: 1, padding: 16, gap: 14, backgroundColor: colors.bg },
	web: { flex: 1, width: "100%" },
});
