import axiosInstance from "@/utils/axios/axiosInstance";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export type ReportStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "RESOLVED"
  | "DISMISSED";
export type ReportCategory =
  | "SPAM"
  | "HARASSMENT"
  | "INAPPROPRIATE_CONTENT"
  | "FAKE_PROFILE"
  | "OTHER";
export type ModerationActionType = "WARNING" | "TEMP_BAN" | "PERMANENT_BAN";

export interface Report {
  id: string;
  category: ReportCategory;
  status: ReportStatus;
  description?: string;
  createdAt: string;
  resolvedAt?: string;
  reporter: { id: string; name: string; profilePicture?: string };
  reportedUser: {
    id: string;
    name: string;
    profilePicture?: string;
    suspendedTill?: string;
  };
  actions: {
    id: string;
    actionType: ModerationActionType;
    note?: string;
    createdAt: string;
    moderator?: { id: string; name: string };
  }[];
}

export function useGetReports(params: {
  status?: string;
  category?: string;
  page: number;
}) {
  return useQuery({
    queryKey: ["admin-reports", params],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/reports", { params });
      return res.data as {
        reports: Report[];
        total: number;
        page: number;
        limit: number;
      };
    },
  });
}

export function useUpdateStatus(reportId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: ReportStatus) =>
      axiosInstance.patch(`/admin/reports/${reportId}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-reports"] });
      qc.invalidateQueries({ queryKey: ["report", reportId] });
      toast.success("Status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });
}

export function useTakeAction(reportId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      actionType: ModerationActionType;
      note?: string;
      expiresAt?: string;
    }) => axiosInstance.post(`/admin/reports/${reportId}/actions`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-reports"] });
      qc.invalidateQueries({ queryKey: ["report", reportId] });
      toast.success("Action taken");
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? "Failed to take action"),
  });
}

export const useGetReportById = (reportId: string) => {
  return useQuery<Report>({
    queryKey: ["report", reportId],
    queryFn: async () => {
      const res = await axiosInstance.get<Report>(`/admin/reports/${reportId}`);
      return res.data;
    },
    enabled: !!reportId,
    staleTime: 1000 * 60 * 2,
  });
};
