import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import axiosInstance from "../utils/axios/axiosInstance";

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MODERATOR";
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  admin: Admin;
}

export const useLogin = () => {
  return useMutation<LoginResponse, AxiosError, LoginCredentials>({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data } = await axiosInstance.post(
        "/admin/auth/login",
        credentials,
      );
      return data;
    },
    retry: 0,
  });
};

export const useValidateToken = ({ enabled }: { enabled: boolean }) => {
  return useQuery<Admin>({
    queryKey: ["validate-token"],
    queryFn: async (): Promise<Admin> => {
      const { data } = await axiosInstance.get("/admin/auth/validate-token");
      return data;
    },
    enabled,
  });
};
