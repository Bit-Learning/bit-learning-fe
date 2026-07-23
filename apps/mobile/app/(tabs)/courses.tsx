import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { CourseCard } from "@/components/course-card";
import { Field, Loading, colors } from "@/components/ui";
import { learner } from "@/lib/learner";
export default function Courses() {
	const [query, setQuery] = useState("");
	const { data, isLoading } = useQuery({
		queryKey: ["courses", query],
		queryFn: () => learner.courses(query),
	});
	return (
		<View style={s.page}>
			<Field
				placeholder="Search courses"
				value={query}
				onChangeText={setQuery}
			/>
			{isLoading ? (
				<Loading />
			) : (
				<FlatList
					data={data ?? []}
					renderItem={({ item }) => <CourseCard course={item} />}
					keyExtractor={(item) => String(item.id)}
					ListEmptyComponent={<Text style={s.empty}>No courses found.</Text>}
				/>
			)}
		</View>
	);
}
const s = StyleSheet.create({
	page: { flex: 1, padding: 16, gap: 14, backgroundColor: colors.bg },
	empty: { textAlign: "center", color: colors.muted, marginTop: 32 },
});
