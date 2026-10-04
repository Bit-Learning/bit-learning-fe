import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { CourseCard } from "@/components/course-card";
import { Loading, colors } from "@/components/ui";
import { learner } from "@/lib/learner";
export default function Learning() {
	const [filter, setFilter] = useState<"active" | "completed">("active");
	const { data, isLoading } = useQuery({
		queryKey: ["my-courses"],
		queryFn: learner.myCourses,
	});
	if (isLoading) return <Loading />;
	const courses = (data ?? []).filter((c) =>
		filter === "completed"
			? c.progressPercentage === 100
			: c.progressPercentage !== 100,
	);
	return (
		<ScrollView contentContainerStyle={s.page}>
			<View style={s.filters}>
				{(["active", "completed"] as const).map((f) => (
					<Pressable
						key={f}
						onPress={() => setFilter(f)}
						style={[s.filter, filter === f && s.selected]}
					>
						<Text style={filter === f ? s.selectedText : undefined}>
							{f === "active" ? "In progress" : "Completed"}
						</Text>
					</Pressable>
				))}
			</View>
			{courses.map((c) => (
				<CourseCard key={c.id} course={c} />
			))}
		</ScrollView>
	);
}
const s = StyleSheet.create({
	page: { padding: 16, backgroundColor: colors.bg, flexGrow: 1 },
	filters: { flexDirection: "row", gap: 8, marginBottom: 16 },
	filter: {
		paddingVertical: 9,
		paddingHorizontal: 14,
		borderRadius: 20,
		backgroundColor: "white",
	},
	selected: { backgroundColor: colors.blue },
	selectedText: { color: "white", fontWeight: "700" },
});
