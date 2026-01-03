import { useQuery } from "@tanstack/react-query";
import { SlideService } from "../service/SlideService";

export const useTemplates = () => {
	return useQuery({
		queryKey: ["slide-templates"],
		queryFn: async () => {
			const response = await SlideService.getAllTemplates();
			return response.data.data || [];
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};

export const useTemplate = (id: number) => {
	return useQuery({
		queryKey: ["slide-template", id],
		queryFn: async () => {
			const response = await SlideService.getTemplateById(id);
			return response.data.data;
		},
		enabled: !!id,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
};
