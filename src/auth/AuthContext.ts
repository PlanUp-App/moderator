import { createContext } from "react";
import type { UseMutationResult } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { Admin, LoginCredentials, LoginResponse } from "./-queries";

export interface AuthState {
  user: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginMutation: UseMutationResult<LoginResponse, AxiosError, LoginCredentials>;
  logout: () => void;
  updateUser: (updates: Partial<Admin>) => void;
}

export const AuthContext = createContext<AuthState | undefined>(undefined);
