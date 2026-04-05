import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  MenuItem,
  Paper,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import ChangeRoleDialog from "./ChangeRoleDialog";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

interface Permission {
  id: string;
  grantedTo: { id: string; email: string; name: string; role: string };
  grantedBy: { id: string; email: string; name: string };
  canRemovePermission: boolean;
  createdAt: string;
}

export const RoleManagementDashboard: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [changeRoleOpen, setChangeRoleOpen] = useState(false);
  const [grantPermissionOpen, setGrantPermissionOpen] = useState(false);
  const { control, handleSubmit, reset } = useForm({
    defaultValues: { email: "", canRemovePermission: false },
  });

  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
  });

  // Fetch permissions
  const { data: permissions = [] } = useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const response = await fetch("/api/role-change/permissions", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!response.ok) throw new Error("Failed to fetch permissions");
      return response.json();
    },
  });

  // Grant permission mutation
  const grantPermissionMutation = useMutation({
    mutationFn: async (data: {
      email: string;
      canRemovePermission: boolean;
    }) => {
      const response = await fetch("/api/role-change/grant", {
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
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      reset();
      setGrantPermissionOpen(false);
    },
  });

  // Revoke permission mutation
  const revokePermissionMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/role-change/revoke/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to revoke permission");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
  });

  const onGrantPermission = (data: {
    email: string;
    canRemovePermission: boolean;
  }) => {
    grantPermissionMutation.mutate(data);
  };

  const getRoleColor = (role: string) => {
    const colors: Record<
      string,
      "default" | "primary" | "error" | "success" | "warning"
    > = {
      USER: "default",
      SUPPORT_STAFF: "primary",
      DELIVERY_STAFF: "primary",
      ADMIN: "warning",
      SUPER_ADMIN: "error",
    };
    return colors[role] || "default";
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
        {t("Role & Permission Management")}
      </Typography>

      {/* Grant Permission Section */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title={t("Grant Role Change Permission")}
          action={
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={() => setGrantPermissionOpen(true)}
            >
              {t("Grant Permission")}
            </Button>
          }
        />
        <CardContent>
          {permissions.length === 0 ? (
            <Typography color="textSecondary">
              {t("No permissions granted yet")}
            </Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "background.default" }}>
                    <TableCell>{t("User Email")}</TableCell>
                    <TableCell>{t("Role")}</TableCell>
                    <TableCell>{t("Can Remove Permission")}</TableCell>
                    <TableCell align="right">{t("Actions")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {permissions.map((perm: Permission) => (
                    <TableRow key={perm.id}>
                      <TableCell>{perm.grantedTo.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={perm.grantedTo.role}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          color={getRoleColor(perm.grantedTo.role) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {perm.canRemovePermission ? (
                          <Chip label={t("Yes")} size="small" color="success" />
                        ) : (
                          <Chip label={t("No")} size="small" color="default" />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title={t("Revoke Permission")}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              revokePermissionMutation.mutate(perm.grantedTo.id)
                            }
                            disabled={revokePermissionMutation.isPending}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* User Management Section */}
      <Card>
        <CardHeader title={t("User Roles")} />
        <CardContent>
          {usersLoading ? (
            <CircularProgress />
          ) : users.length === 0 ? (
            <Typography color="textSecondary">{t("No users found")}</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "background.default" }}>
                    <TableCell>{t("Email")}</TableCell>
                    <TableCell>{t("Name")}</TableCell>
                    <TableCell>{t("Role")}</TableCell>
                    <TableCell>{t("Created")}</TableCell>
                    <TableCell align="right">{t("Actions")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user: User) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          color={getRoleColor(user.role) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title={t("Change Role")}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedUser(user);
                              setChangeRoleOpen(true);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Change Role Dialog */}
      {selectedUser && (
        <ChangeRoleDialog
          open={changeRoleOpen}
          userId={selectedUser.id}
          userName={selectedUser.name}
          currentRole={selectedUser.role}
          onClose={() => {
            setChangeRoleOpen(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
          }}
        />
      )}

      {/* Grant Permission Dialog */}
      <Dialog
        open={grantPermissionOpen}
        onClose={() => setGrantPermissionOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t("Grant Role Change Permission")}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            {t("Select a user to grant role change permission")}
          </Typography>

          {grantPermissionMutation.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {grantPermissionMutation.error instanceof Error
                ? grantPermissionMutation.error.message
                : t("Error granting permission")}
            </Alert>
          )}

          <form>
            <Controller
              name="email"
              control={control}
              rules={{ required: t("Email is required") }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("User Email")}
                  fullWidth
                  margin="normal"
                  select
                >
                  {users
                    .filter((u: User) => u.role !== "SUPER_ADMIN")
                    .map((user: User) => (
                      <MenuItem key={user.id} value={user.email}>
                        {user.email} ({user.role})
                      </MenuItem>
                    ))}
                </TextField>
              )}
            />

            <Controller
              name="canRemovePermission"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label={t("Can Remove Other Permissions")}
                  fullWidth
                  margin="normal"
                  value={field.value ? "true" : "false"}
                  onChange={(e) => field.onChange(e.target.value === "true")}
                >
                  <MenuItem value="true">{t("Yes")}</MenuItem>
                  <MenuItem value="false">{t("No")}</MenuItem>
                </TextField>
              )}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setGrantPermissionOpen(false)}
            disabled={grantPermissionMutation.isPending}
          >
            {t("Cancel")}
          </Button>
          <Button
            onClick={handleSubmit(onGrantPermission)}
            variant="contained"
            disabled={grantPermissionMutation.isPending}
          >
            {grantPermissionMutation.isPending ? (
              <CircularProgress size={24} />
            ) : (
              t("Grant Permission")
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoleManagementDashboard;
