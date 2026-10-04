import {
	ActivityIndicator,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
export const colors = {
	navy: "#102A43",
	blue: "#2563EB",
	pale: "#EFF6FF",
	text: "#1F2937",
	muted: "#6B7280",
	border: "#E5E7EB",
	surface: "#FFFFFF",
	bg: "#F8FAFC",
	danger: "#DC2626",
	success: "#059669",
};
export function Button({
	title,
	onPress,
	loading,
	secondary,
}: {
	title: string;
	onPress: () => void;
	loading?: boolean;
	secondary?: boolean;
}) {
	return (
		<Pressable
			onPress={onPress}
			disabled={loading}
			style={[styles.button, secondary && styles.secondary]}
		>
			{loading ? (
				<ActivityIndicator color={secondary ? colors.blue : "white"} />
			) : (
				<Text style={[styles.buttonText, secondary && styles.secondaryText]}>
					{title}
				</Text>
			)}
		</Pressable>
	);
}
export function Field(props: React.ComponentProps<typeof TextInput>) {
	return (
		<TextInput
			placeholderTextColor={colors.muted}
			style={styles.field}
			{...props}
		/>
	);
}
export function Card({ children }: { children: React.ReactNode }) {
	return <View style={styles.card}>{children}</View>;
}
export function ErrorText({ children }: { children: React.ReactNode }) {
	return <Text style={styles.error}>{children}</Text>;
}
export function Loading() {
	return (
		<View style={styles.loading}>
			<ActivityIndicator size="large" color={colors.blue} />
		</View>
	);
}
export const styles = StyleSheet.create({
	button: {
		backgroundColor: colors.blue,
		padding: 14,
		borderRadius: 12,
		alignItems: "center",
	},
	secondary: { backgroundColor: colors.pale },
	buttonText: { color: "white", fontWeight: "700" },
	secondaryText: { color: colors.blue },
	field: {
		backgroundColor: "white",
		borderColor: colors.border,
		borderWidth: 1,
		padding: 14,
		borderRadius: 12,
		color: colors.text,
	},
	card: {
		backgroundColor: "white",
		padding: 16,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: colors.border,
		gap: 8,
	},
	error: { color: colors.danger },
	loading: { flex: 1, alignItems: "center", justifyContent: "center" },
});
