import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import { invalidateUserData } from "@/lib/queryInvalidation";
import { queryKeys } from "@/lib/queryKeys";

export const useCheckRoleChangePermission = () => {
  return useQuery({
    queryKey: ["roleChangePermission"],
    queryFn: async () => {
      // ✅ SECURITY: apiClient handles httpOnly cookies automatically
      const response = await apiClient.get("/role-change/check-permission", {
        withCredentials: true,
      });
      return response.data;
    },
  });
};

export const useRoleChangePermissions = () => {
  return useQuery({
    queryKey: queryKeys.users.roleChangePermissions,
    queryFn: async () => {
      // ✅ SECURITY: apiClient handles httpOnly cookies automatically
      const response = await apiClient.get("/role-change/permissions", {
        withCredentials: true,
      });
      return response.data;
    },
  });
};

export const useUserRolePermission = (userId: string) => {
  return useQuery({
    queryKey: ["roleChangePermission", userId],
    queryFn: async () => {
      // ✅ SECURITY: apiClient handles httpOnly cookies automatically
      const response = await apiClient.get(
        `/role-change/permissions/${userId}`,
        { withCredentials: true },
      );
      return response.data;
    },
    enabled: !!userId,
  });
};

export const useGrantRoleChangePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      email: string;
      canRemovePermission?: boolean;
    }) => {
      // Auth cookies are sent by apiClient.
      const response = await apiClient.post("/role-change/grant", data, {
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: () => {
      invalidateUserData(queryClient);
    },
  });
};

export const useRevokeRoleChangePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      // Auth cookies are sent by apiClient.
      const response = await apiClient.delete(`/role-change/revoke/${userId}`, {
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: () => {
      invalidateUserData(queryClient);
    },
  });
};

export const useChangeUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { userId: string; role: string }) => {
      // Auth cookies are sent by apiClient.
      const response = await apiClient.patch(
        `/role-change/change-role/${data.userId}`,
        { role: data.role },
        {
          withCredentials: true,
        },
      );
      return response.data;
    },
    onSuccess: () => {
      invalidateUserData(queryClient);
    },
  });
};
