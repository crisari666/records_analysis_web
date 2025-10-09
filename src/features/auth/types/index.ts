export type User = {
  id: string;
  email: string;
  name: string;
};

export type LoginCredentials = {
  identifier: string;
  password: string;
};

export type LoginIdentifierType = 'email' | 'username' | 'phone';

export type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};
