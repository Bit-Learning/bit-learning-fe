import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/shared/components/Sonner";
import { authApi } from "@/feature/auth/api/auth.api";
import { userQueryKeys } from "./useUser";

export function useEnable2FA() {
  return useMutation({
    mutationFn: async () => {
      const res = await authApi.enable2FA();
      return res.data.data as {
        secret: string;
        qrCodeUrl: string;
        manualEntryKey: string;
      };
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Không thể bật xác thực 2 lớp";
      toast.error({ title: "Lỗi", description: msg });
    },
  });
}

export function useVerify2FA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (totpCode: string) => {
      const res = await authApi.verify2FA({ totpCode });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
      toast.success({
        title: "Xác thực 2 lớp đã được kích hoạt",
        description: "Tài khoản của bạn đã được bảo vệ bằng xác thực 2 lớp.",
      });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Mã xác thực không hợp lệ";
      toast.error({ title: "Xác thực thất bại", description: msg });
    },
  });
}

export function useDisable2FA() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await authApi.disable2FA();
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
      toast.success({
        title: "Đã tắt xác thực 2 lớp",
        description: "Xác thực 2 lớp đã được tắt cho tài khoản của bạn.",
      });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Không thể tắt xác thực 2 lớp";
      toast.error({ title: "Lỗi", description: msg });
    },
  });
}
