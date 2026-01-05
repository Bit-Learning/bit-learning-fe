import api from "@/shared/api/api";

export const deductBalanceAI = async (amount: number): Promise<any> => {
	return await api.post(`/users/wallets/ai?amount=${amount}`);
};
