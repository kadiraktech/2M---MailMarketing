export interface AuthUser {
  token: string;
  email: string;
  fullName: string;
  role: 'Admin' | 'User' | string;
}

