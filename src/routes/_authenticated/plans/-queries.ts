import axiosInstance from "@/utils/axios/axiosInstance";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface PlanMember {
  role: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    profilePicture: string | null;
  };
}

export interface ModerationAction {
  id: string;
  actionType: "WARNING" | "TEMP_BAN" | "PERMANENT_BAN" | "CONTENT_REMOVED" | "REVERSE_BAN";
  note: string | null;
  expiresAt: string | null;
  createdAt: string;
  moderator: {
    id: string;
    name: string;
  } | null;
}

export interface Plan {
  id: string;
  name: string;
  coverImage: string | null;
  description: string | null;
  createdAt: string;
  visibility: string;
  deletedAt: string | null;
  _count: {
    members: number;
  };
  isFlagged: boolean;
  flaggedKeywords: string[];
}

export interface PlanDetail extends Plan {
  config: {
    id: string;
    planId: string;
    maxMembers: number | null;
    acceptJoinRequest: boolean;
  } | null;
  members: PlanMember[];
  moderationActions: ModerationAction[];
}

export interface GetAllPlansResponse {
  data: Plan[];
  meta: {
    total: number;
    skip: number;
    limit: number;
  };
}

export interface QueryPlansDto {
  search?: string;
  filter?: "active" | "removed" | "flagged" | "all";
  page: number;
  limit: number;
}

export function useGetAllPlans(params: QueryPlansDto) {
  const skip = (params.page - 1) * params.limit;
  return useQuery<GetAllPlansResponse>({
    queryKey: ["admin-plans", params],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/admin/plans", {
        params: {
          limit: params.limit,
          skip,
          search: params.search || undefined,
          filter: params.filter === "all" ? undefined : params.filter,
        },
      });
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useGetPlanById(planId: string) {
  return useQuery<PlanDetail>({
    queryKey: ["admin-plan", planId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/admin/plans/${planId}`);
      return data;
    },
    enabled: !!planId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useSoftDeletePlan(planId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { note?: string }) => {
      const { data } = await axiosInstance.delete(`/admin/plans/${planId}/soft-delete`, {
        data: body,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-plans"] });
      qc.invalidateQueries({ queryKey: ["admin-plan", planId] });
      toast.success("Plan removed successfully");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to remove plan");
    },
  });
}
