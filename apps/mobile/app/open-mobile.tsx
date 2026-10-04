import { Redirect, useLocalSearchParams } from "expo-router";

/** Supports https://bit-learning.lch.id.vn/open-mobile?screen=course&id=123. */
export default function OpenMobile() {
	const { screen, id } = useLocalSearchParams<{
		screen?: string;
		id?: string;
	}>();
	if (screen === "course" && id) return <Redirect href={`/course/${id}`} />;
	return <Redirect href="/(tabs)" />;
}
