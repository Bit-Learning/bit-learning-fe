import { useQuery } from "@tanstack/react-query";
import curriculumLinkService from "@/feature/game/services/curriculumLinkService";

export function useStaticGamesBySubject(subjectId: number | null) {
	return useQuery({
		queryKey: ["staticGames", "bySubject", subjectId],
		queryFn: () => curriculumLinkService.getGamesBySubject(subjectId!),
		enabled: subjectId != null,
		staleTime: 5 * 60 * 1000,
	});
}
