export type User = {
  id: string;
  name: string;
  lastName: string;
  user: string;
  email: string;
  role: 'root' | 'admin' | 'user';
};

export type LoginCredentials = {
  identifier: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  user: User;
};

export type LoginIdentifierType = 'email' | 'username' | 'phone';

export type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null | boolean;
};
