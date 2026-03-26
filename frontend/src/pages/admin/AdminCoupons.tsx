import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import {
  couponsApi,
  type Coupon,
  type CreateCouponRequest,
} from "../../api/coupons";

const AdminCoupons = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [formData, setFormData] = useState<
    CreateCouponRequest & { isActive?: boolean }
  >({
    code: "",
    discountType: "PERCENTAGE",
    discountValue: 0,
    minOrderAmount: 0,
    maxDiscount: null,
    usageLimit: null,
    expiresAt: null,
  });

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: couponsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: couponsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      handleCloseDialog();
      setSnackbar({
        open: true,
        message: t("admin.couponCreated"),
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

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateCouponRequest> & { isActive?: boolean };
    }) => couponsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      handleCloseDialog();
      setSnackbar({
        open: true,
        message: t("admin.couponUpdated"),
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
    mutationFn: couponsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      setSnackbar({
        open: true,
        message: t("admin.couponDeleted"),
        severity: "success",
      });
    },
  });

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setFormData({
      code: "",
      discountType: "PERCENTAGE",
      discountValue: 0,
      minOrderAmount: 0,
      maxDiscount: null,
      usageLimit: null,
      expiresAt: null,
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscount: coupon.maxDiscount,
      usageLimit: coupon.usageLimit,
      expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 16) : null,
      isActive: coupon.isActive,
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCoupon(null);
  };

  const handleSubmit = () => {
    if (editingCoupon) {
      const { code: _unused, ...updateData } = formData;
      void _unused;
      updateMutation.mutate({ id: editingCoupon.id, data: updateData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t("admin.confirmDeleteCoupon"))) {
      deleteMutation.mutate(id);
    }
  };

  const isExpired = (coupon: Coupon) => {
    return coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          🎟️ {t("admin.coupons")}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          {t("admin.createCoupon")}
        </Button>
      </Box>

      {isLoading ? (
        <Typography>{t("common.loading")}</Typography>
      ) : coupons.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">{t("admin.noCoupons")}</Typography>
        </Paper>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {coupons.map((coupon) => (
            <Paper
              key={coupon.id}
              sx={{
                p: 2.5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                opacity: coupon.isActive && !isExpired(coupon) ? 1 : 0.6,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{ fontFamily: "monospace" }}
                  >
                    {coupon.code}
                  </Typography>
                  <Chip
                    label={
                      coupon.discountType === "PERCENTAGE"
                        ? `${coupon.discountValue}% OFF`
                        : `₹${coupon.discountValue} OFF`
                    }
                    color="primary"
                    size="small"
                  />
                  {!coupon.isActive && (
                    <Chip
                      label={t("admin.inactive")}
                      color="default"
                      size="small"
                    />
                  )}
                  {isExpired(coupon) && (
                    <Chip
                      label={t("admin.expired")}
                      color="error"
                      size="small"
                    />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {t("admin.minOrder")}: ₹{coupon.minOrderAmount}
                  {coupon.maxDiscount &&
                    ` • ${t("admin.maxDiscount")}: ₹${coupon.maxDiscount}`}
                  {coupon.usageLimit &&
                    ` • ${t("admin.used")}: ${coupon.usedCount}/${coupon.usageLimit}`}
                  {coupon.expiresAt &&
                    ` • ${t("admin.expires")}: ${new Date(coupon.expiresAt).toLocaleDateString()}`}
                </Typography>
              </Box>
              <Box>
                <IconButton onClick={() => handleOpenEdit(coupon)} size="small">
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleDelete(coupon.id)}
                  size="small"
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingCoupon ? t("admin.editCoupon") : t("admin.createCoupon")}
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            pt: "16px !important",
          }}
        >
          <TextField
            label={t("admin.couponCode")}
            value={formData.code}
            onChange={(e) =>
              setFormData({ ...formData, code: e.target.value.toUpperCase() })
            }
            disabled={!!editingCoupon}
            fullWidth
            slotProps={{
              input: {
                sx: { textTransform: "uppercase", fontFamily: "monospace" },
              },
            }}
          />
          <TextField
            select
            label={t("admin.discountType")}
            value={formData.discountType}
            onChange={(e) =>
              setFormData({
                ...formData,
                discountType: e.target.value as "PERCENTAGE" | "FLAT",
              })
            }
            fullWidth
          >
            <MenuItem value="PERCENTAGE">{t("admin.percentage")}</MenuItem>
            <MenuItem value="FLAT">{t("admin.flatAmount")}</MenuItem>
          </TextField>
          <TextField
            label={
              formData.discountType === "PERCENTAGE"
                ? t("admin.discountPercent")
                : t("admin.discountAmount")
            }
            type="number"
            value={formData.discountValue}
            onChange={(e) =>
              setFormData({
                ...formData,
                discountValue: Number(e.target.value),
              })
            }
            fullWidth
          />
          <TextField
            label={t("admin.minOrderAmount")}
            type="number"
            value={formData.minOrderAmount}
            onChange={(e) =>
              setFormData({
                ...formData,
                minOrderAmount: Number(e.target.value),
              })
            }
            fullWidth
          />
          {formData.discountType === "PERCENTAGE" && (
            <TextField
              label={t("admin.maxDiscount")}
              type="number"
              value={formData.maxDiscount || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxDiscount: e.target.value ? Number(e.target.value) : null,
                })
              }
              fullWidth
              helperText={t("admin.maxDiscountHelp")}
            />
          )}
          <TextField
            label={t("admin.usageLimit")}
            type="number"
            value={formData.usageLimit || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                usageLimit: e.target.value ? Number(e.target.value) : null,
              })
            }
            fullWidth
            helperText={t("admin.usageLimitHelp")}
          />
          <TextField
            label={t("admin.expiresAt")}
            type="datetime-local"
            value={formData.expiresAt || ""}
            onChange={(e) =>
              setFormData({ ...formData, expiresAt: e.target.value || null })
            }
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>{t("common.cancel")}</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {editingCoupon ? t("common.save") : t("common.create")}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
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

export default AdminCoupons;
