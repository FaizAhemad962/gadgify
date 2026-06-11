import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Box,
  Typography,
} from "@/mui/material";
import { useForm, Controller, useWatch } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { apiClient } from "@/api/client";
import { invalidateUserData } from "@/lib/queryInvalidation";
import {
  adminDialogActionsSx,
  adminDialogContentSx,
  adminDialogPaperSx,
  adminDialogTitleSx,
} from "@/components/admin/adminStyleTokens";
import { CustomButton } from "@/components/ui/CustomButton";

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
  const { control, handleSubmit, reset } = useForm({
    defaultValues: { role: currentRole },
  });

  const selectedRole = useWatch({ control, name: "role" });

  const changeRoleMutation = useMutation({
    mutationFn: async (data: { role: string }) => {
      const response = await apiClient.patch(
        `/role-change/change-role/${userId}`,
        data,
      );
      return response.data;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSuccess: (_data) => {
      invalidateUserData(queryClient);
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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: adminDialogPaperSx }}
    >
      <DialogTitle sx={adminDialogTitleSx}>{t("Change User Role")}</DialogTitle>
      <DialogContent sx={adminDialogContentSx}>
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

          <DialogActions sx={{ ...adminDialogActionsSx, mx: -3, mb: -2.5, mt: 3 }}>
            <CustomButton
              onClick={onClose}
              disabled={changeRoleMutation.isPending}
              appVariant="ghost"
            >
              {t("Cancel")}
            </CustomButton>
            <CustomButton
              type="submit"
              variant="contained"
              appVariant="primary"
              isLoading={changeRoleMutation.isPending}
              disabled={
                changeRoleMutation.isPending || selectedRole === currentRole
              }
            >
              {t("Change Role")}
            </CustomButton>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeRoleDialog;
