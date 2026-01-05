import { Api } from "@workspace/lib/api";
import apiInstance from "@/shared/api/api";

// Create API client instance with interceptors
export const apiClient = new Api(apiInstance);
