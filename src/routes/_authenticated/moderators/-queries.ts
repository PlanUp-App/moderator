import axiosInstance from "@/utils/axios/axiosInstance";
import { queryClient } from "@/utils/queryclient/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export type AdminRole = "ADMIN" | "MODERATOR";

export interface Moderator {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  mustChangePassword: boolean;
  deactivatedAt: string | null;
  createdAt: string;
}

interface CreateModeratorInput {
  name: string;
  email: string;
  password: string;
}

const MODERATOR_QUERY_KEY = ["admin-moderators"];

export function useGetModerators() {
  return useQuery<Moderator[]>({
    queryKey: MODERATOR_QUERY_KEY,
    queryFn: async () => {
      const { data } = await axiosInstance.get<
        | Moderator[]
        | { moderators?: Moderator[]; users?: Moderator[]; data?: Moderator[] }
      >("/admin/moderators");

      if (Array.isArray(data)) {
        return data;
      }

      if (Array.isArray(data?.moderators)) {
        return data.moderators;
      }

      if (Array.isArray(data?.users)) {
        return data.users;
      }

      if (Array.isArray(data?.data)) {
        return data.data;
      }

      return [];
    },
  });
}

export function useCreateModerator() {
  return useMutation({
    mutationFn: async (payload: CreateModeratorInput) => {
      const { data } = await axiosInstance.post<Moderator>(
        "/admin/moderators",
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MODERATOR_QUERY_KEY });
      toast.success("Moderator created successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ?? "Failed to create moderator",
      );
    },
  });
}

export function useDeactivateModerator() {
  return useMutation({
    mutationFn: async (moderatorId: string) => {
      const { data } = await axiosInstance.patch<Moderator>(
        `/admin/moderators/${moderatorId}/deactivate`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MODERATOR_QUERY_KEY });
      toast.success("Moderator deactivated");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ?? "Failed to deactivate moderator",
      );
    },
  });
}

export function useReactivateModerator() {
  return useMutation({
    mutationFn: async (moderatorId: string) => {
      const { data } = await axiosInstance.patch<Moderator>(
        `/admin/moderators/${moderatorId}/reactivate`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MODERATOR_QUERY_KEY });
      toast.success("Moderator reactivated");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ?? "Failed to reactivate moderator",
      );
    },
  });
}

export function useUpdateModerator() {
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<Moderator>;
    }) => {
      const { data } = await axiosInstance.patch<Moderator>(
        `/admin/moderators/${id}`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MODERATOR_QUERY_KEY });
      toast.success("Moderator updated");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ?? "Failed to update moderator",
      );
    },
  });
}
