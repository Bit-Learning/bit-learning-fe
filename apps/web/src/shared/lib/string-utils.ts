export function mergeName(firstName: string, lastName: string): string {
	return `${firstName} ${lastName}`;
}

export const removeVietnameseTones = (str: string) => {
	return str
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/đ/g, "d")
		.replace(/Đ/g, "D");
};
