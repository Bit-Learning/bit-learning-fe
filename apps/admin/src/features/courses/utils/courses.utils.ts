export const convertLevelToVietnamese = (level: string) => {
	switch (level) {
		case "BEGINNING":
			return "Cơ bản";
		case "INTERMEDIATE":
			return "Trung cấp";
		case "ADVANCED":
			return "Nâng cao";
		default:
			return level;
	}
};
