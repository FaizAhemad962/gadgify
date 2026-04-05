import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

const AVAILABLE_ROLES = [
  { value: "USER", label: "User" },
  { value: "ADMIN", label: "Admin" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "DELIVERY_STAFF", label: "Delivery Staff" },
  { value: "SUPPORT_STAFF", label: "Support Staff" },
];

interface ChangeRoleDialogProps {
  open: boolean;
  userId: string;
  userName: string;
  currentRole: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ChangeRoleDialog: React.FC<ChangeRoleDialogProps> = ({
  open,
  userId,
  userName,
  currentRole,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: { role: currentRole },
  });

  const selectedRole = watch("role");

  const changeRoleMutation = useMutation({
    mutationFn: async (data: { role: string }) => {
      const response = await fetch(`/api/role-change/change-role/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to change role");
      }

      return response.json();
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      reset();
      onClose();
      onSuccess?.();
    },
  });

  const onSubmit = (data: { role: string }) => {
    if (data.role === currentRole) {
      alert(t("No changes made"));
      return;
    }
    changeRoleMutation.mutate(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("Change User Role")}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="textSecondary">
            {t("User")}: <strong>{userName}</strong>
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {t("Current Role")}: <strong>{currentRole}</strong>
          </Typography>
        </Box>

        {changeRoleMutation.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {changeRoleMutation.error instanceof Error
              ? changeRoleMutation.error.message
              : t("Error changing role")}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="role"
            control={control}
            rules={{ required: t("Role is required") }}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label={t("New Role")}
                fullWidth
                error={selectedRole === currentRole}
                helperText={
                  selectedRole === currentRole
                    ? t("Please select a different role")
                    : ""
                }
              >
                {AVAILABLE_ROLES.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <DialogActions sx={{ mt: 3 }}>
            <Button onClick={onClose} disabled={changeRoleMutation.isPending}>
              {t("Cancel")}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                changeRoleMutation.isPending || selectedRole === currentRole
              }
            >
              {changeRoleMutation.isPending ? (
                <CircularProgress size={24} />
              ) : (
                t("Change Role")
              )}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeRoleDialog;
