export interface ApiResponse<T> {
  status: number;
  message?: string;
  data?: T;
  error?: string;
  errorData?: T;
  path?: string;
  page?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
