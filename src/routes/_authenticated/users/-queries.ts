import axiosInstance from "@/utils/axios/axiosInstance";
import { useQuery } from "@tanstack/react-query";

export type UserStatus = "ACTIVE" | "SUSPENDED" | "UNVERIFIED";

export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture: string | null;
  provider: string;
  createdAt: string;
  verifiedAt: string | null;
  suspendedTill: string | null;
  _count: {
    planMemberships: number;
    reportsReceived: number;
  };
}

export interface GetAllClientsResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export interface QueryClientsDto {
  search?: string;
  status?: UserStatus;
  page: number;
  limit: number;
}

export function useGetAllClients(params: QueryClientsDto) {
  return useQuery<GetAllClientsResponse>({
    queryKey: ["users", params],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/admin/users", {
        params: {
          ...params,
          page: params.page,
          limit: params.limit,
        },
      });
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useGetUserById(userId: string) {
  return useQuery<User>({
    queryKey: ["user", userId],
    queryFn: async () => {
      const res = await axiosInstance.get<User>(`/admin/users/${userId}`);
      return res.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}
