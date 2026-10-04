import AsyncStorage from "@react-native-async-storage/async-storage";
const key = (courseId: number) => `bit-learning.last-lecture.${courseId}`;
export const getLastLecture = async (courseId: number) => {
	const value = await AsyncStorage.getItem(key(courseId));
	return value ? Number(value) : undefined;
};
export const setLastLecture = (courseId: number, lectureId: number) =>
	AsyncStorage.setItem(key(courseId), String(lectureId));
