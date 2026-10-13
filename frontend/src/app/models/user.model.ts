export type UserRole = 'Employee' | 'Manager' | 'Admin';

export interface User {
  id?: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  activeStatus: boolean;
}

export interface AuthResponse {
  token: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
}
