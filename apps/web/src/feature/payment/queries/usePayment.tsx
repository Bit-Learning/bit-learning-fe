import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@workspace/ui/components/Sonner";
import { paymentApi } from "../apis/payment.api";
import { AddBalanceToWalletRequest } from "../types/payment.type";

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
      toast.error({ title: "Không thể tạo lại URL thanh toán", description: error.message });
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
      toast.error({ title: "Không thể tạo lại URL thanh toán", description: error.message });
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
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      if (url) {
        window.location.href = url;
      }
    },
    onError: (error: Error) => {
      toast.error({ title: "Không thể nạp tiền", description: error.message });
    },
  });
};
