import { useQuery } from "@tanstack/react-query";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { CourseCard } from "@/components/course-card";
import { Loading, colors } from "@/components/ui";
import { learner } from "@/lib/learner";
import { useAuth } from "@/providers/auth";
export default function Home() {
	const { session } = useAuth();
	const { data: courses, isLoading } = useQuery({
		queryKey: ["my-courses"],
		queryFn: learner.myCourses,
	});
	if (isLoading) return <Loading />;
	return (
		<ScrollView contentContainerStyle={s.page}>
			<Text style={s.greeting}>Hi, {session?.user.firstName}</Text>
			<Text style={s.title}>Keep learning</Text>
			{courses?.length ? (
				courses
					.slice(0, 3)
					.map((course) => <CourseCard key={course.id} course={course} />)
			) : (
				<View>
					<Text style={s.empty}>
						Start exploring courses to build your learning path.
					</Text>
				</View>
			)}
		</ScrollView>
	);
}
const s = StyleSheet.create({
	page: { padding: 18, gap: 8, backgroundColor: colors.bg, flexGrow: 1 },
	greeting: { fontSize: 16, color: colors.muted },
	title: {
		fontSize: 27,
		fontWeight: "800",
		color: colors.navy,
		marginBottom: 8,
	},
	empty: { color: colors.muted, marginTop: 16 },
});
