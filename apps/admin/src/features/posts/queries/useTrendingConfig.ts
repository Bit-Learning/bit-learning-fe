import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	trendingConfigApi,
	type UpdateTrendingConfigRequest,
} from "../apis/trending-config.api";

const QUERY_KEY = ["forum", "trending-config"] as const;

export const useGetTrendingConfig = () =>
	useQuery({
		queryKey: QUERY_KEY,
		queryFn: async () => {
			const res = await trendingConfigApi.getConfig();
			return res.data.data;
		},
	});

export const useUpdateTrendingConfig = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: UpdateTrendingConfigRequest) =>
			trendingConfigApi.updateConfig(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: QUERY_KEY });
			toast.success("Đã cập nhật cấu hình trending");
		},
		onError: () => {
			toast.error("Không thể cập nhật cấu hình trending");
		},
	});
};
