import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Card, Loading, colors } from "@/components/ui";
import { learner } from "@/lib/learner";
export default function CourseDetail() {
	const id = Number(useLocalSearchParams<{ id: string }>().id);
	const queryClient = useQueryClient();
	const { data: course, isLoading } = useQuery({
		queryKey: ["course", id],
		queryFn: () => learner.course(id),
	});
	const { data: access } = useQuery({
		queryKey: ["access", id],
		queryFn: () => learner.access(id),
	});
	const enroll = useMutation({
		mutationFn: () => learner.enroll(id),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: ["access", id] }),
	});
	if (isLoading || !course) return <Loading />;
	return (
		<ScrollView contentContainerStyle={s.page}>
			<Text style={s.title}>{course.title}</Text>
			<Text style={s.sub}>{course.subtitle}</Text>
			<Card>
				<Text>{course.description}</Text>
				<Text style={s.meta}>
					{course.instructorName} · {course.totalLectures ?? 0} lessons
				</Text>
			</Card>
			{!access ? (
				<Button
					title={enroll.isPending ? "Enrolling…" : "Enroll now"}
					onPress={() => enroll.mutate()}
					loading={enroll.isPending}
				/>
			) : null}
			{course.progressPercentage === 100 ? (
				<Link href={`/certificate/${id}`} style={s.certificate}>
					View certificate
				</Link>
			) : null}
			<Text style={s.heading}>Course content</Text>
			{(course.sections ?? []).map((section) => (
				<View key={section.id} style={s.section}>
					<Text style={s.sectionTitle}>{section.title}</Text>
					{section.lectures.map((lecture) => {
						const allowed = Boolean(access || lecture.isPreviewable);
						return allowed ? (
							<Link
								key={lecture.id}
								href={{
									pathname: "/lesson/[courseId]/[lectureId]",
									params: {
										courseId: String(id),
										lectureId: String(lecture.id),
										type: lecture.type,
									},
								}}
								style={s.lesson}
							>
								{lecture.type} · {lecture.title}
							</Link>
						) : (
							<Text key={lecture.id} style={s.locked}>
								🔒 {lecture.title}
							</Text>
						);
					})}
				</View>
			))}
		</ScrollView>
	);
}
const s = StyleSheet.create({
	page: { padding: 16, gap: 14, backgroundColor: colors.bg },
	title: { fontSize: 28, fontWeight: "800", color: colors.navy },
	sub: { color: colors.muted, fontSize: 16 },
	meta: { color: colors.muted },
	heading: { fontSize: 20, fontWeight: "800", color: colors.navy },
	section: { gap: 9 },
	sectionTitle: { fontWeight: "700", color: colors.text },
	lesson: { color: colors.blue, paddingVertical: 4 },
	locked: { color: colors.muted, paddingVertical: 4 },
	certificate: { color: colors.blue, fontWeight: "700" },
});
