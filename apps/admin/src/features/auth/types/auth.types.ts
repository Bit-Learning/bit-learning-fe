export type TAdminLoginRequest = {
  email: string;
  password: string;
  role: "ADMIN" | "MANAGER";
};

export type TAdminLoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: TAdminUser;
};

export type TAdminUser = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string;
  email: string;
  activated: boolean;
  role: "ADMIN" | "MANAGER";
  langKey: string;
  lastLoginAttempt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TRefreshTokenRequest = {
  refreshToken: string;
};
