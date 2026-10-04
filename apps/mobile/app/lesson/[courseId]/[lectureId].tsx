import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	AppState,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { Button, Loading, colors } from "@/components/ui";
import { apiUrl } from "@/lib/api";
import { isCompleteAt, learner, videoUrl } from "@/lib/learner";
import { setLastLecture } from "@/lib/last-lecture";
function VideoLesson({
	lectureId,
	courseId,
}: {
	lectureId: number;
	courseId: number;
}) {
	const { data: progress } = useQuery({
		queryKey: ["progress", lectureId],
		queryFn: () => learner.progress(lectureId),
	});
	const player = useVideoPlayer(apiUrl(videoUrl(lectureId)), (p) => {
		p.pause();
	});
	const last = useRef(0);
	const completed = useRef(false);
	const sync = useCallback(async () => {
		const duration = player.duration || 0;
		const position = player.currentTime || last.current;
		last.current = position;
		if (duration > 0)
			await learner.sync({
				lectureId,
				watchedDuration: position,
				totalDuration: duration,
			});
		if (!completed.current && isCompleteAt(position, duration)) {
			completed.current = true;
			await learner.complete(lectureId);
		}
	}, [lectureId, player]);
	useEffect(() => {
		if (progress && progress > 0) player.currentTime = progress;
		setLastLecture(courseId, lectureId);
		const timer = setInterval(() => void sync(), 15000);
		const sub = AppState.addEventListener("change", (s) => {
			if (s !== "active") void sync();
		});
		return () => {
			clearInterval(timer);
			sub.remove();
			void sync();
		};
	}, [courseId, lectureId, player, progress, sync]);
	return (
		<View style={s.videoWrap}>
			<VideoView
				player={player}
				style={s.video}
				nativeControls
				allowsFullscreen
			/>
			<Text style={s.note}>Your progress is saved automatically.</Text>
		</View>
	);
}
function QuizLesson({ lectureId }: { lectureId: number }) {
	const { data, isLoading } = useQuery({
		queryKey: ["quiz", lectureId],
		queryFn: () => learner.quiz(lectureId),
	});
	const [answers, setAnswers] = useState<Record<number, number>>({});
	if (isLoading) return <Loading />;
	const quizzes = data?.quizzes ?? [];
	const done =
		quizzes.length > 0 && quizzes.every((q) => answers[q.id] !== undefined);
	return (
		<ScrollView contentContainerStyle={s.content}>
			{quizzes.map((q) => (
				<View key={q.id} style={s.question}>
					<Text style={s.questionText}>{q.questionText}</Text>
					{q.answers.map((a) => (
						<Pressable
							key={a.id}
							onPress={() => setAnswers({ ...answers, [q.id]: a.id })}
							style={[s.answer, answers[q.id] === a.id && s.selected]}
						>
							<Text>{a.answerText}</Text>
						</Pressable>
					))}
				</View>
			))}
			<Button
				title="Complete quiz"
				onPress={() => learner.complete(lectureId)}
				loading={!done}
			/>
		</ScrollView>
	);
}
export default function Lesson() {
	const { courseId, lectureId, type } = useLocalSearchParams<{
		courseId: string;
		lectureId: string;
		type?: string;
	}>();
	const id = Number(lectureId);
	const course = Number(courseId);
	const { data: text, isLoading } = useQuery({
		queryKey: ["text", id],
		queryFn: () => learner.text(id),
		enabled: type !== "VIDEO" && type !== "QUIZ",
	});
	if (type === "VIDEO") return <VideoLesson lectureId={id} courseId={course} />;
	if (type === "QUIZ") return <QuizLesson lectureId={id} />;
	if (isLoading) return <Loading />;
	return (
		<ScrollView contentContainerStyle={s.content}>
			<Text style={s.body}>
				{text?.content ?? "This lesson has no content yet."}
			</Text>
			<Button
				title="Mark lesson complete"
				onPress={() => learner.complete(id)}
			/>
		</ScrollView>
	);
}
const s = StyleSheet.create({
	videoWrap: { flex: 1, backgroundColor: "#000" },
	video: { width: "100%", height: 250 },
	note: { color: "white", padding: 16 },
	content: { padding: 16, gap: 16, backgroundColor: colors.bg, flexGrow: 1 },
	body: { fontSize: 16, lineHeight: 25, color: colors.text },
	question: {
		backgroundColor: "white",
		padding: 16,
		borderRadius: 14,
		gap: 10,
	},
	questionText: { fontWeight: "700", fontSize: 17 },
	answer: {
		padding: 12,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: colors.border,
	},
	selected: { borderColor: colors.blue, backgroundColor: colors.pale },
});
