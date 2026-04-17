import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/shared/components/Sonner";
import { userQueryKeys } from "@/feature/user/queries/useUser";
import { paymentApi } from "../apis/payment.api";
import type { AddBalanceToWalletRequest } from "../types/payment.type";

export const useRegenerateVNPayUrl = () => {
	return useMutation({
		mutationFn: async (code: string) => {
			const response = await paymentApi.regenerateVNPayUrl(code);
			return response.data.data;
		},
		onSuccess: (url) => {
			if (url) {
				window.location.href = url;
			}
		},
		onError: (error: Error) => {
			toast.error({
				title: "Không thể tạo lại URL thanh toán",
				description: error.message,
			});
		},
	});
};

export const useRegeneratePayOSUrl = () => {
	return useMutation({
		mutationFn: async (code: string) => {
			const response = await paymentApi.regeneratePayOSUrl(code);
			return response.data.data;
		},
		onSuccess: (url) => {
			if (url) {
				window.location.href = url;
			}
		},
		onError: (error: Error) => {
			toast.error({
				title: "Không thể tạo lại URL thanh toán",
				description: error.message,
			});
		},
	});
};

export const useAddBalanceToWallet = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (request: AddBalanceToWalletRequest) => {
			const response = await paymentApi.addBalanceToWallet(request);
			return response.data.data;
		},
		onSuccess: (url) => {
			queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
			if (url) {
				window.location.href = url;
			}
		},
		onError: (error: Error) => {
			toast.error({ title: "Không thể nạp tiền", description: error.message });
		},
	});
};

export const useReorderWithWallet = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (code: string) => {
			const response = await paymentApi.reOrder(code);
			return response.data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["courses"] });
			queryClient.invalidateQueries({ queryKey: ["myCourses"] });
			queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
			queryClient.invalidateQueries({ queryKey: ["enrollments"] });

			toast.success({
				title: "Mua khóa học thành công",
				description: "Bạn đã mua khóa học bằng ví thành công",
			});
		},
		onError: (error: Error) => {
			toast.error({
				title: "Không thể mua khóa học",
				description: error.message,
			});
		},
	});
};
