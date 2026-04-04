import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import type { ApiResponse } from "@/shared/api/api.type";
import { AddBalanceToWalletRequest } from "../types/payment.type";

export const paymentApi = {
  regenerateVNPayUrl(code: string): Promise<AxiosResponse<ApiResponse<string>>> {
    return api.post("/payments/vnpay/regenerate", null, {
      params: { code },
    });
  },

  regeneratePayOSUrl(code: string): Promise<AxiosResponse<ApiResponse<string>>> {
    return api.post("/payments/payos/regenerate", null, {
      params: { code },
    });
  },

  reOrder(code: string): Promise<AxiosResponse<ApiResponse<string>>> {
    return api.post("/payments/wallet/reorder", null, {
      params: { code },
    });
  },

  addBalanceToWallet(request: AddBalanceToWalletRequest): Promise<AxiosResponse<ApiResponse<string>>> {
    return api.post("/payments/wallet/top-up", request);
  },
};
