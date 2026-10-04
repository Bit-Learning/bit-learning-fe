import { Link } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";
import type { Course } from "@/lib/types";
import { Card, colors } from "./ui";
export function CourseCard({ course }: { course: Course }) {
	return (
		<Link href={`/course/${course.id}`} style={s.link}>
			<Card>
				{course.thumbnailUrl ? (
					<Image source={{ uri: course.thumbnailUrl }} style={s.image} />
				) : null}
				<Text style={s.title}>{course.title}</Text>
				<Text style={s.meta}>
					{course.instructorName ?? "BIT Learning"} ·{" "}
					{course.level ?? "All levels"}
				</Text>
				{course.progressPercentage !== undefined ? (
					<View style={s.progress}>
						<View
							style={[
								s.progressFill,
								{ width: `${course.progressPercentage}%` },
							]}
						/>
					</View>
				) : null}
			</Card>
		</Link>
	);
}
const s = StyleSheet.create({
	link: { marginBottom: 12 },
	image: { width: "100%", height: 130, borderRadius: 10 },
	title: { fontWeight: "700", fontSize: 17, color: colors.navy },
	meta: { color: colors.muted },
	progress: {
		height: 6,
		backgroundColor: colors.border,
		borderRadius: 5,
		overflow: "hidden",
		marginTop: 4,
	},
	progressFill: { height: "100%", backgroundColor: colors.success },
});
