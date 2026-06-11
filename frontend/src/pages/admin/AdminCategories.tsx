import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@/mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
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
} from "@/components/admin/adminStyleTokens";
import { appIconSx } from "@/components/ui/navigationStyles";
import { CustomButton } from "@/components/ui/CustomButton";
import {
  categoriesApi,
  type Category,
  type CreateCategoryRequest,
} from "../../api/categories";
import { invalidateCategoryData } from "@/lib/queryInvalidation";
import { queryKeys } from "@/lib/queryKeys";

const AdminCategories = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null,
  );
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [formData, setFormData] = useState<
    CreateCategoryRequest & { isActive?: boolean }
  >({
    name: "",
    description: "",
    icon: "",
    sortOrder: 0,
  });

  const { data: categories = [], isLoading } = useQuery({
    queryKey: queryKeys.categories.admin,
    queryFn: categoriesApi.getAllAdmin,
  });

  const createMutation = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: (createdCategory) => {
      queryClient.setQueryData<Category[]>(
        queryKeys.categories.admin,
        (current = []) => [createdCategory, ...current],
      );
      queryClient.setQueryData<Category[]>(
        queryKeys.categories.all,
        (current = []) => [createdCategory, ...current],
      );
      invalidateCategoryData(queryClient);
      setDialogOpen(false);
      setSnackbar({
        open: true,
        message: t("admin.categoryCreated", "Category created successfully"),
        severity: "success",
      });
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: t("errors.somethingWrong"),
        severity: "error",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateCategoryRequest> & { isActive?: boolean };
    }) => categoriesApi.update(id, data),
    onSuccess: (updatedCategory) => {
      queryClient.setQueryData<Category[]>(
        queryKeys.categories.admin,
        (current = []) =>
          current.map((category) =>
            category.id === updatedCategory.id ? updatedCategory : category,
          ),
      );
      queryClient.setQueryData<Category[]>(
        queryKeys.categories.all,
        (current = []) =>
          current.map((category) =>
            category.id === updatedCategory.id ? updatedCategory : category,
          ),
      );
      invalidateCategoryData(queryClient);
      setDialogOpen(false);
      setEditingCategory(null);
      setSnackbar({
        open: true,
        message: t("admin.categoryUpdated", "Category updated successfully"),
        severity: "success",
      });
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: t("errors.somethingWrong"),
        severity: "error",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<Category[]>(
        queryKeys.categories.admin,
        (current = []) =>
          current.filter((category) => category.id !== deletedId),
      );
      queryClient.setQueryData<Category[]>(
        queryKeys.categories.all,
        (current = []) =>
          current.filter((category) => category.id !== deletedId),
      );
      invalidateCategoryData(queryClient);
      setDeleteDialogOpen(false);
      setDeletingCategory(null);
      setSnackbar({
        open: true,
        message: t("admin.categoryDeleted", "Category deleted successfully"),
        severity: "success",
      });
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: t("errors.somethingWrong"),
        severity: "error",
      });
    },
  });

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "", icon: "", sortOrder: 0 });
    setDialogOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      icon: category.icon || "",
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    });
    setDialogOpen(true);
  };

  const handleOpenDelete = (category: Category) => {
    setDeletingCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: formData });
    } else {
      createMutation.mutate({
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        sortOrder: formData.sortOrder,
      });
    }
  };

  const handleConfirmDelete = () => {
    if (deletingCategory) {
      deleteMutation.mutate(deletingCategory.id);
    }
  };

  if (isLoading) {
    return (
      <Box sx={adminPageSx}>
        <Typography>{t("common.loading")}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={adminPageSx}>
      <AdminPageHeader
        title={t("admin.categories", "Categories")}
        subtitle={t(
          "admin.categoriesSubtitle",
          "Organize storefront categories and their display order.",
        )}
        eyebrow={t("nav.admin")}
        icon={<AddIcon sx={appIconSx.card} />}
        action={
          <CustomButton
            variant="contained"
            appVariant="admin"
            startIcon={<AddIcon sx={appIconSx.lg} />}
            onClick={handleOpenCreate}
          >
            {t("admin.createCategory", "Create Category")}
          </CustomButton>
        }
      />

      <TableContainer component={Paper} sx={{ ...adminPanelSx }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t("admin.categoryName", "Name")}</TableCell>
              <TableCell>
                {t("admin.categoryDescription", "Description")}
              </TableCell>
              <TableCell>{t("admin.categoryIcon", "Icon")}</TableCell>
              <TableCell align="center">
                {t("admin.sortOrder", "Order")}
              </TableCell>
              <TableCell align="center">
                {t("admin.status", "Status")}
              </TableCell>
              <TableCell align="right">
                {t("admin.actions", "Actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary" sx={{ py: 4 }}>
                    {t("admin.noCategories", "No categories yet")}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{category.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        maxWidth: 300,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {category.description || "—"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {category.icon || "—"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">{category.sortOrder}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={
                        category.isActive
                          ? t("admin.active", "Active")
                          : t("admin.inactive", "Inactive")
                      }
                      color={category.isActive ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenEdit(category)}
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDelete(category)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: adminDialogPaperSx }}
      >
        <DialogTitle sx={adminDialogTitleSx}>
          {editingCategory
            ? t("admin.editCategory", "Edit Category")
            : t("admin.createCategory", "Create Category")}
        </DialogTitle>
        <DialogContent
          sx={{
            ...adminDialogContentSx,
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
          }}
        >
          <TextField
            label={t("admin.categoryName", "Name")}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            required
          />
          <TextField
            label={t("admin.categoryDescription", "Description")}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            fullWidth
            multiline
            rows={2}
          />
          <TextField
            label={t("admin.categoryIcon", "Icon")}
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            fullWidth
            helperText={t(
              "admin.categoryIconHelper",
              "MUI icon name (e.g. Smartphone, Tv, Kitchen)",
            )}
          />
          <TextField
            label={t("admin.sortOrder", "Sort Order")}
            type="number"
            value={formData.sortOrder}
            onChange={(e) =>
              setFormData({
                ...formData,
                sortOrder: parseInt(e.target.value) || 0,
              })
            }
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={adminDialogActionsSx}>
          <CustomButton onClick={() => setDialogOpen(false)} appVariant="ghost">
            {t("common.cancel")}
          </CustomButton>
          <CustomButton
            variant="contained"
            appVariant="admin"
            onClick={handleSubmit}
            disabled={
              !formData.name ||
              createMutation.isPending ||
              updateMutation.isPending
            }
          >
            {editingCategory ? t("common.save") : t("common.create")}
          </CustomButton>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: adminDialogPaperSx }}
      >
        <DialogTitle sx={adminDialogTitleSx}>
          {t("admin.deleteCategory", "Delete Category")}
        </DialogTitle>
        <DialogContent sx={adminDialogContentSx}>
          <Typography>
            {t(
              "admin.deleteCategoryConfirm",
              'Are you sure you want to delete "{{name}}"?',
              { name: deletingCategory?.name },
            )}
          </Typography>
        </DialogContent>
        <DialogActions sx={adminDialogActionsSx}>
          <CustomButton
            onClick={() => setDeleteDialogOpen(false)}
            appVariant="ghost"
          >
            {t("common.cancel")}
          </CustomButton>
          <CustomButton
            variant="contained"
            appVariant="danger"
            onClick={handleConfirmDelete}
            disabled={deleteMutation.isPending}
          >
            {t("common.delete")}
          </CustomButton>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminCategories;
