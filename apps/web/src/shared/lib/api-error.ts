export function extractApiErrorMessage(
	error: unknown,
	fallback: string,
): string {
	const responseData = (
		error as {
			response?: {
				data?: {
					message?: string;
					Message?: string;
					error?: string;
				};
			};
			message?: string;
		}
	)?.response?.data;

	return (
		responseData?.message ||
		responseData?.Message ||
		responseData?.error ||
		(error as { message?: string })?.message ||
		fallback
	);
}
