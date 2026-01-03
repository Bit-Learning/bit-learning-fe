import { Time } from "@internationalized/date";

export const parseTime = (time: string) => {
	try {
		const timeArray = time.split(":").map(Number);
		return new Time(...timeArray);
	} catch (_error) {
		return null;
	}
};
