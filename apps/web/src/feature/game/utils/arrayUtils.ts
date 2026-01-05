/**
 * Fisher-Yates shuffle algorithm
 * Xáo trộn mảng một cách ngẫu nhiên
 * @param array - Mảng cần xáo trộn
 * @returns Mảng mới đã được xáo trộn (không ảnh hưởng mảng gốc)
 */
export const shuffleArray = <T>(array: T[]): T[] => {
	// Tạo bản sao để không ảnh hưởng mảng gốc
	const newArr = [...array];

	for (let i = newArr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));

		// Cách 1: Sử dụng biến tạm
		const temp = newArr[i]!;
		newArr[i] = newArr[j]!;
		newArr[j] = temp;
	}

	return newArr;
};
