import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../utils/axios/axiosInstance";

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    suspended: number;
    unverified: number;
    newThisMonth: number;
  };
  reports: {
    total: number;
    pending: number;
    underReview: number;
    resolved: number;
    dismissed: number;
    newThisWeek: number;
  };
  moderationActions: {
    total: number;
    warnings: number;
    tempBans: number;
    permanentBans: number;
    contentRemoved: number;
  };
  plans: {
    total: number;
    public: number;
    private: number;
    activeLastMonth: number;
  };
}

export interface RecentReport {
  id: string;
  category: string;
  reason: string;
  status: "PENDING" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED";
  createdAt: string;
  reporter: {
    id: string;
    name: string;
    profilePicture: string | null;
  };
  reportedUser: {
    id: string;
    name: string;
    profilePicture: string | null;
    suspendedTill: string | null;
  };
}

export interface RecentAction {
  id: string;
  actionType: "WARNING" | "TEMP_BAN" | "PERMANENT_BAN" | "CONTENT_REMOVED";
  reason: string;
  createdAt: string;
  moderator: {
    id: string;
    name: string;
  };
  report: {
    id: string;
    category: string;
    reportedUser: {
      id: string;
      name: string;
      profilePicture: string | null;
    };
  } | null;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await axiosInstance.get<DashboardStats>("/admin/dashboard/stats");
      return response.data;
    },
  });
}

export function useRecentReports(limit = 5) {
  return useQuery({
    queryKey: ["recent-reports", limit],
    queryFn: async () => {
      const response = await axiosInstance.get<RecentReport[]>("/admin/dashboard/recent-reports", {
        params: { limit },
      });
      return response.data;
    },
  });
}

export function useRecentActions(limit = 5) {
  return useQuery({
    queryKey: ["recent-actions", limit],
    queryFn: async () => {
      const response = await axiosInstance.get<RecentAction[]>("/admin/dashboard/recent-actions", {
        params: { limit },
      });
      return response.data;
    },
  });
}
