import axiosInstance from "@/utils/axios/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import type {
  ModerationActionType,
  ReportCategory,
  ReportStatus,
} from "../reports/-queries";

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

export interface ModerationAction {
  id: string;
  actionType: ModerationActionType;
  note: string | null;
  expiresAt: string | null;
  createdAt: string;
  moderator: { id: string; name: string } | null;
}

interface Report {
  id: string;
  category: ReportCategory;
  description: string | null;
  status: ReportStatus;
  createdAt: string;
  resolvedAt: string | null;
  reporter: { id: string; name: string; profilePicture: string | null };
  actions: ModerationAction[];
}

interface ReportFiled {
  id: string;
  category: ReportCategory;
  status: ReportStatus;
  createdAt: string;
  reportedUser: { id: string; name: string; profilePicture: string | null };
}

export interface ClientDetail {
  id: string;
  name: string;
  email: string;
  profilePicture: string | null;
  coverImage: string | null;
  bio: string | null;
  provider: string;
  createdAt: string;
  verifiedAt: string | null;
  suspendedTill: string | null;
  planMemberships: {
    role: string;
    joinedAt: string;
    plan: {
      id: string;
      name: string;
      coverImage: string | null;
      createdAt: string;
      visibility: string;
    };
  }[];
  reportsReceived: Report[];
  reportsFiled: ReportFiled[];
  _count: {
    reportsReceived: number;
    reportsFiled: number;
    planMemberships: number;
    createdTasks: number;
    billsCreated: number;
  };
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
  return useQuery<ClientDetail>({
    queryKey: ["user", userId],
    queryFn: async () => {
      const res = await axiosInstance.get<ClientDetail>(
        `/admin/users/${userId}`,
      );
      return res.data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}
