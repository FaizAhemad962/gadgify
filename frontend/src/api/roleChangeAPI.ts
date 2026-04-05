import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const useCheckRoleChangePermission = () => {
  return useQuery({
    queryKey: ["roleChangePermission"],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/role-change/check-permission`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to check permission");
      return response.json();
    },
  });
};

export const useRoleChangePermissions = () => {
  return useQuery({
    queryKey: ["roleChangePermissions"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/role-change/permissions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch permissions");
      return response.json();
    },
  });
};

export const useUserRolePermission = (userId: string) => {
  return useQuery({
    queryKey: ["roleChangePermission", userId],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/role-change/permissions/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch user permission");
      return response.json();
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
      const response = await fetch(`${API_BASE_URL}/role-change/grant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to grant permission");
      }

      return response.json();
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
      const response = await fetch(
        `${API_BASE_URL}/role-change/revoke/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to revoke permission");
      return response.json();
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
      const response = await fetch(
        `${API_BASE_URL}/role-change/change-role/${data.userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ role: data.role }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to change role");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["roleChangePermissions"] });
    },
  });
};
