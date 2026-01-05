import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/shared/api/api";
import type {
	CreatePresentationRequest,
	CreatePresentationResponse,
	Presentation,
	Template,
} from "../types/presentation.types";

export const PRESENTATION_QUERY_KEYS = {
	all: ["presentations"] as const,
	lists: () => [...PRESENTATION_QUERY_KEYS.all, "list"] as const,
	list: (filters: string) =>
		[...PRESENTATION_QUERY_KEYS.lists(), { filters }] as const,
	details: () => [...PRESENTATION_QUERY_KEYS.all, "detail"] as const,
	detail: (userId: string) =>
		[...PRESENTATION_QUERY_KEYS.details(), userId] as const,
	templates: () => [...PRESENTATION_QUERY_KEYS.all, "templates"] as const,
};

export const usePresentations = () => {
	return useQuery<Presentation[]>({
		queryKey: PRESENTATION_QUERY_KEYS.lists(),
		queryFn: fetchPresentations,
	});
};

export const usePresentationTemplates = (page = 0, size = 20) => {
	return useQuery<Template[]>({
		queryKey: ["presentationTemplates", page, size],
		queryFn: () => fetchAllTemplates(page, size),
	});
};

export const useAvailablePresentationTemplates = () => {
	return useQuery<Template[]>({
		queryKey: ["presentationTemplates", "allAvailable"],
		queryFn: () => fetchAllAvailableTemplates(),
	});
};

export const useUserPresentations = (userId: number) => {
	return useQuery<Presentation[]>({
		queryKey: PRESENTATION_QUERY_KEYS.list(`userId=${userId}`),
		queryFn: () => fetchUserPresentations(userId),
	});
};

export const fetchPresentations = async (): Promise<Presentation[]> => {
	const response = await api.get("/auth/users/test-only");
	return response.data.data || [];
};

export const fetchAllTemplates = async (
	page = 0,
	size = 20,
): Promise<Template[]> => {
	const response = await api.get(
		`/products/presentations/templates/active?page=${page}size=${size}`,
	);
	return response.data.data.content || [];
};

export const fetchAllAvailableTemplates = async (): Promise<Template[]> => {
	const response = await api.get("/products/templates/active");
	return response.data.data || [];
};

export const fetchUserPresentations = async (
	userId: number,
): Promise<Presentation[]> => {
	const response = await api.get(`/products/presentations/${userId}/list`);
	return response.data.data.content || [];
};

export const createPresentationFromTemplate = async (
	payload: CreatePresentationRequest,
): Promise<CreatePresentationResponse> => {
	const response = await api.post<CreatePresentationResponse>(
		"/products/presentations",
		payload,
	);
	return response.data;
};

export const useCreatePresentation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createPresentationFromTemplate,
		onSuccess: (_data, variables) => {
			// Invalidate user presentations list to refetch with new data
			queryClient.invalidateQueries({
				queryKey: PRESENTATION_QUERY_KEYS.list(`userId=${variables.ownerId}`),
			});
		},
	});
};
