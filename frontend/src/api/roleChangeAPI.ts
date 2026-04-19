import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import { getCsrfToken } from "./csrfHelper";

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
    queryKey: ["roleChangePermissions"],
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
      // ✅ SECURITY: apiClient handles httpOnly cookies automatically
      const csrfToken = await getCsrfToken();
      const response = await apiClient.post("/role-change/grant", data, {
        withCredentials: true,
        headers: { "x-csrf-token": csrfToken },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roleChangePermissions"] });
    },
  });
};

export const useRevokeRoleChangePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      // ✅ SECURITY: apiClient handles httpOnly cookies automatically
      const csrfToken = await getCsrfToken();
      const response = await apiClient.delete(`/role-change/revoke/${userId}`, {
        withCredentials: true,
        headers: { "x-csrf-token": csrfToken },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roleChangePermissions"] });
    },
  });
};

export const useChangeUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { userId: string; role: string }) => {
      // ✅ SECURITY: apiClient handles httpOnly cookies automatically
      const csrfToken = await getCsrfToken();
      const response = await apiClient.patch(
        `/role-change/change-role/${data.userId}`,
        { role: data.role },
        {
          withCredentials: true,
          headers: { "x-csrf-token": csrfToken },
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["roleChangePermissions"] });
    },
  });
};
