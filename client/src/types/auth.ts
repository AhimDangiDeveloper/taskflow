import type { User } from './user';

export interface AuthContextValue {
  user: User | null;
  booting: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}
