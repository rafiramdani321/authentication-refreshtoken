import { create } from "zustand";

type AuthState = {
  accessToken: string | null;
  isAuthResolved: boolean;
  setAccessToken: (token: string) => void;
  setAuthResolved: (value: boolean) => void;
  clearAccessToken: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isAuthResolved: false,
  setAccessToken: (token) => set({ accessToken: token }),
  setAuthResolved: (value) => set({ isAuthResolved: value }),
  clearAccessToken: () => set({ accessToken: null }),
}));
