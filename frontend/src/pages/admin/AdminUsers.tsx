import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  MenuItem,
  Select,
  Alert,
  Snackbar,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@/mui/material";
import {
  Delete as DeleteIcon,
  Search as SearchIcon,
} from "@/mui/icons";
import {
  AdminPageHeader,
} from "@/components/admin/adminStyles";
import {
  adminDialogActionsSx,
  adminDialogContentSx,
  adminDialogPaperSx,
  adminDialogTitleSx,
  adminPageSx,
  adminPanelSx,
  adminSearchFieldSx,
} from "@/components/admin/adminStyleTokens";
import { appIconSx } from "@/components/ui/navigationStyles";
import { CustomButton } from "@/components/ui/CustomButton";
import { usersApi, type AdminUser } from "../../api/users";
import { useAuth } from "../../context/AuthContext";
import { getAssignableRoles } from "../../utils/roleHelper";
import { invalidateUserData } from "@/lib/queryInvalidation";
import { queryKeys } from "@/lib/queryKeys";

const AdminUsers = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const assignableRoles = getAssignableRoles(user?.role);

  const { data: users = [], isLoading } = useQuery({
    queryKey: queryKeys.users.admin,
    queryFn: usersApi.getAll,
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      usersApi.updateRole(id, role),
    onSuccess: () => {
      invalidateUserData(queryClient);
      setSnackbar({
        open: true,
        message: t("admin.userRoleUpdated"),
        severity: "success",
      });
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || t("errors.somethingWrong"),
        severity: "error",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      invalidateUserData(queryClient);
      setDeleteTarget(null);
      setSnackbar({
        open: true,
        message: t("admin.userDeleted"),
        severity: "success",
      });
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      setDeleteTarget(null);
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || t("errors.somethingWrong"),
        severity: "error",
      });
    },
  });

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.city.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Box sx={adminPageSx}>
      <AdminPageHeader
        title={t("admin.users")}
        subtitle={t(
          "admin.usersSubtitle",
          "Search users, manage roles, and remove test accounts.",
        )}
        eyebrow={t("nav.admin")}
        icon={<SearchIcon sx={appIconSx.card} />}
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h5" fontWeight={700} sx={{ display: "none" }}>
          👥 {t("admin.users")}
        </Typography>
        <TextField
          size="small"
          placeholder={t("admin.searchUsers")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ ...appIconSx.lg, color: "text.secondary" }} />
                </InputAdornment>
              ),
            },
          }}
          sx={adminSearchFieldSx}
        />
      </Box>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : filtered.length === 0 ? (
        <Paper sx={{ ...adminPanelSx, p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">{t("admin.noUsers")}</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ ...adminPanelSx }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                <TableCell sx={{ fontWeight: 700 }}>
                  {t("admin.userName")}
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  {t("admin.userEmail")}
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  {t("admin.userPhone")}
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  {t("admin.userCity")}
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">
                  {t("admin.userOrders")}
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  {t("admin.userRole")}
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>
                  {t("admin.userJoined")}
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">
                  {t("common.actions")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    {user.city}, {user.state}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={user._count.orders}
                      size="small"
                      color={user._count.orders > 0 ? "primary" : "default"}
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      size="small"
                      onChange={(e) =>
                        roleMutation.mutate({
                          id: user.id,
                          role: e.target.value,
                        })
                      }
                      sx={{ minWidth: 140 }}
                      disabled={assignableRoles.length === 0}
                    >
                      {assignableRoles.includes("USER") && (
                        <MenuItem value="USER">USER</MenuItem>
                      )}
                      {assignableRoles.includes("DELIVERY_STAFF") && (
                        <MenuItem value="DELIVERY_STAFF">
                          DELIVERY_STAFF
                        </MenuItem>
                      )}
                      {assignableRoles.includes("SUPPORT_STAFF") && (
                        <MenuItem value="SUPPORT_STAFF">SUPPORT_STAFF</MenuItem>
                      )}
                      {assignableRoles.includes("ADMIN") && (
                        <MenuItem value="ADMIN">ADMIN</MenuItem>
                      )}
                      {assignableRoles.includes("SUPER_ADMIN") && (
                        <MenuItem value="SUPER_ADMIN">SUPER_ADMIN</MenuItem>
                      )}
                    </Select>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => setDeleteTarget(user)}
                    >
                      <DeleteIcon sx={appIconSx.lg} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        PaperProps={{ sx: adminDialogPaperSx }}
      >
        <DialogTitle sx={adminDialogTitleSx}>
          {t("admin.confirmDeleteUser")}
        </DialogTitle>
        <DialogContent sx={adminDialogContentSx}>
          <DialogContentText>
            {t("admin.deleteUserWarning", { name: deleteTarget?.name })}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={adminDialogActionsSx}>
          <CustomButton onClick={() => setDeleteTarget(null)} appVariant="ghost">
            {t("common.cancel")}
          </CustomButton>
          <CustomButton
            variant="contained"
            appVariant="danger"
            onClick={() =>
              deleteTarget && deleteMutation.mutate(deleteTarget.id)
            }
            disabled={deleteMutation.isPending}
          >
            {t("common.delete")}
          </CustomButton>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminUsers;
