import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from "@mui/material";
import { Upload, Search, Star, Delete, AddSharp } from "@mui/icons-material";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { productsApi } from "../../api/products";
import { AdminProductsDataGrid } from "../../components/admin/AdminProductsDataGrid";
import type { Product } from "../../types";

const CATEGORIES = [
  "Home & Kitchen",
  "Electronics",
  "Beauty & Personal Care",
  "Office & Storage",
  "Sports & Outdoor",
  "Jewelry & Accessories",
  "Toys",
  "Tools & Hardware",
  "Lighting",
];

const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),

  price: z
    .union([z.number(), z.string()])
    .transform((val) => Number(val))
    .refine((val) => !Number.isNaN(val) && val > 0, {
      message: "Price must be greater than 0",
    }),

  stock: z
    .union([z.number(), z.string()])
    .transform((val) => Number(val))
    .refine((val) => !Number.isNaN(val) && val > 0, {
      message: "Stock must be greater than 0",
    }),

  colors: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  hsnNo: z.string().optional(),

  gstPercentage: z
    .union([z.number(), z.string()])
    .transform((val) =>
      val === "" || val === undefined ? undefined : Number(val),
    )
    .refine(
      (val) => val === undefined || (val >= 0 && val <= 100),
      "GST must be between 0 and 100",
    )
    .optional(),

  media: z.array(
    z.object({
      url: z.string(),
      type: z.enum(["image", "video"]),
      isPrimary: z.boolean().optional(),
    }),
  ),
});

type ProductFormInput = z.input<typeof productSchema>;
type ProductFormData = z.output<typeof productSchema>;

const AdminProducts = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<ProductMedia[]>([]);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<ProductMedia[]>([]);
  const [primaryImageIdx, setPrimaryImageIdx] = useState<number>(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setSelectedCategory] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["admin-products", page, rowsPerPage, searchQuery],
    queryFn: () =>
      productsApi.getAllProducts(page + 1, rowsPerPage, searchQuery),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormInput, any, ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const createMutation = useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      handleClose();
    },
    onError: (error: Error) => {
      const errorMessage =
        error instanceof Error ? error.message : t("admin.payloadError");
      setError(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductFormData }) =>
      productsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      handleClose();
    },
    onError: (error: Error) => {
      const errorMessage =
        error instanceof Error ? error.message : t("admin.payloadError");
      setError(errorMessage);
    },
  });

  const deleteMediaByUrlAndProductId = async (
    productId: string,
    url: string,
  ): Promise<void> => {
    await productsApi.deleteMediaByUrlAndProductId(productId, url);
  };

  const deleteMutation = useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });

  const handleOpen = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setSelectedCategory(product.category);
      // If product.media exists, split into images/videos
      const images = (product.media || []).filter((m) => m.type === "image");
      const videos = (product.media || []).filter((m) => m.type === "video");
      setImagePreviews(
        images.map((m) => ({
          id: m.id,
          url: m.url,
          media: m,
          productId: m.productId,
        })),
      );
      setVideoPreviews(
        videos.map((m) => ({ url: m.url, id: m.id, productId: m.productId })),
      );
      setImageFiles([]);
      setVideoFiles([]);
      setPrimaryImageIdx(
        images.findIndex((m) => m.isPrimary) >= 0
          ? images.findIndex((m) => m.isPrimary)
          : 0,
      );
      reset({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        media: product.media || [],
        colors: product.colors || "",
        category: product.category,
        hsnNo: product.hsnNo || "",
        gstPercentage: product.gstPercentage ?? undefined,
      });
    } else {
      setEditingProduct(null);
      setSelectedCategory("");
      reset({
        name: "",
        description: "",
        price: undefined,
        stock: undefined,
        media: [],
        colors: "",
        category: CATEGORIES[0],
        hsnNo: "",
        gstPercentage: undefined,
      });
      setImagePreviews([]);
      setVideoPreviews([]);
      setImageFiles([]);
      setVideoFiles([]);
      setPrimaryImageIdx(0);
    }
    setOpen(true);
    setError("");
  };
  // Ensure productSchema includes media property to match ProductFormData
  // Add this to your zod schema:
  // media: z.array(z.object({ url: z.string(), type: z.string(), isPrimary: z.boolean().optional() })).optional(),
  const handleClose = () => {
    setOpen(false);
    setEditingProduct(null);
    reset();
    setError("");
    setImageFiles([]);
    setVideoFiles([]);
    setImagePreviews([]);
    setVideoPreviews([]);
  };

  const handleRemoveImage = async (idx: number) => {
    const image = imagePreviews[idx];

    // 1️⃣ Optimistic UI update
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));

    // 2️⃣ Primary image correction
    setPrimaryImageIdx((prev) => {
      if (prev === idx) return 0;
      if (prev > idx) return prev - 1;
      return prev;
    });

    // 3️⃣ Delete from backend if already saved
    if (image?.url) {
      deleteMediaByUrlAndProductId(image.productId, image.url);
    }
  };

  const handleRemoveVideo = async (idx: number) => {
    const video = videoPreviews[idx];

    // 1️⃣ Optimistic UI update
    setVideoFiles((prev) => prev.filter((_, i) => i !== idx));
    setVideoPreviews((prev) => prev.filter((_, i) => i !== idx));

    // 2️⃣ Delete from backend if already saved
    if (video?.url) {
      deleteMediaByUrlAndProductId(video.productId, video.url);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((file) =>
      file.type.startsWith("image/"),
    );
    const validFiles = files.filter((file) => file.size <= 500 * 1024);
    if (validFiles.length < files.length) {
      setError(
        t("admin.imageSizeError") || "Image size should not exceed 500KB",
      );
    }
    setImageFiles((prev) => [...prev, ...validFiles]);
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((file) =>
      file.type.startsWith("video/"),
    );
    const validFiles = files.filter((file) => file.size <= 50 * 1024 * 1024);
    if (validFiles.length < files.length) {
      setError("Video size should not exceed 50MB");
    }
    setVideoFiles((prev) => [...prev, ...validFiles]);
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    // Manual image check before upload
    if (
      imageFiles.length === 0 &&
      !(
        editingProduct &&
        editingProduct.media &&
        editingProduct.media.some((m) => m.type === "image")
      )
    ) {
      setError(t("admin.imageRequired"));
      return;
    }
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const baseUrl = apiUrl.replace("/api", "");
    let mediaArr: {
      url: string;
      type: "image" | "video";
      isPrimary?: boolean;
    }[] = [];

    // Upload new images
    for (let i = 0; i < imageFiles.length; i++) {
      try {
        const uploadResult = await productsApi.uploadImage(imageFiles[i]);
        mediaArr.push({
          url: `${baseUrl}${uploadResult.imageUrl}`,
          type: "image",
          isPrimary: i === primaryImageIdx,
        });
      } catch {
        setError("Failed to upload image. Please try again.");
        return;
      }
    }
    // Add existing image URLs (for edit)
    if (editingProduct && editingProduct.media) {
      const existingImages = editingProduct.media.filter(
        (m) => m.type === "image",
      );
      existingImages.forEach((img, idx) => {
        mediaArr.push({
          url: img.url,
          type: "image",
          isPrimary: imageFiles.length === 0 && idx === primaryImageIdx,
        });
      });
    }

    // Upload new videos
    for (let i = 0; i < videoFiles.length; i++) {
      try {
        const uploadResult = await productsApi.uploadVideo(videoFiles[i]);
        mediaArr.push({
          url: `${baseUrl}${uploadResult.videoUrl}`,
          type: "video",
        });
      } catch {
        setError("Failed to upload video. Please try again.");
        return;
      }
    }
    // Add existing video URLs (for edit)
    if (editingProduct && editingProduct.media) {
      const existingVideos = editingProduct.media.filter(
        (m) => m.type === "video",
      );
      existingVideos.forEach((vid) => {
        mediaArr.push({
          url: vid.url,
          type: "video",
        });
      });
    }

    // Ensure only one isPrimary
    let foundPrimary = false;
    mediaArr = mediaArr.map((m) => {
      if (m.type === "image") {
        if (
          !foundPrimary &&
          (m.isPrimary ||
            mediaArr.filter((x) => x.type === "image").indexOf(m) ===
              primaryImageIdx)
        ) {
          foundPrimary = true;
          return { ...m, isPrimary: true };
        }
        return { ...m, isPrimary: false };
      }
      return m;
    });

    const productData: ProductFormData = {
      ...data,
      price: Number(data.price),
      stock: Number(data.stock),
      gstPercentage:
        data.gstPercentage === undefined
          ? undefined
          : Number(data.gstPercentage),
      media: mediaArr,
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: productData });
    } else {
      createMutation.mutate(productData);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t("admin.confirmDelete"))) {
      deleteMutation.mutate(id);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (rowsPerPage: number) => {
    setRowsPerPage(rowsPerPage);
    setPage(0);
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
        <Typography
          variant="h4"
          fontWeight="600"
          sx={{
            color: "#fff",
            background: "linear-gradient(135deg, #1976d2, #ff9800)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {t("admin.products")}
        </Typography>
        <IconButton
          size="small"
          onClick={() => handleOpen()}
          sx={{
            bgcolor: "#1976d2",
            color: "#fff",
            textTransform: "none",
            fontWeight: "600",
            px: 3,
            py: 1.2,
            borderRadius: "8px",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              bgcolor: "#1565c0",
              transform: "translateY(-2px)",
              boxShadow: "0 6px 16px rgba(25, 118, 210, 0.3)",
            },
          }}
        >
          <AddSharp />{" "}
          <Typography sx={{ display: { xs: "none", md: "block" } }}>
            {t("admin.addProduct")}
          </Typography>
        </IconButton>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder={t("nav.searchProducts")}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(0); // Reset to first page on search
          }}
          variant="outlined"
          size="small"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search sx={{ color: "#666" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: 300,
            backgroundColor: "#fff",
            borderRadius: 1.5,
            "& .MuiOutlinedInput-root": {
              color: "#333",
              "& fieldset": {
                borderColor: "rgba(0, 0, 0, 0.1)",
              },
              "&:hover fieldset": {
                borderColor: "#1976d2",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#1976d2",
                borderWidth: 2,
              },
            },
          }}
        />
      </Box>

      <AdminProductsDataGrid
        products={productsData?.products || []}
        onEdit={handleOpen}
        onDelete={handleDelete}
        page={page}
        rowsPerPage={rowsPerPage}
        total={productsData?.total || 0}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        isLoading={isLoading}
      />

      {/* Add/Edit Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "#ffffff",
            backgroundImage: "none",
            border: "1px solid #e0e0e0",
            borderRadius: "12px",
          },
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle
            sx={{
              color: "#1976d2",
              fontWeight: "600",
              borderBottom: "1px solid #e0e0e0",
              fontSize: "1.3rem",
            }}
          >
            {editingProduct ? t("admin.editProduct") : t("admin.addNewProduct")}
          </DialogTitle>
          <DialogContent sx={{ bgcolor: "#ffffff", backgroundImage: "none" }}>
            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  bgcolor: "rgba(244, 67, 54, 0.1)",
                  color: "#ef5350",
                  border: "1px solid rgba(244, 67, 54, 0.3)",
                }}
                onClose={() => setError("")}
              >
                {error}
              </Alert>
            )}
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 2 }}
            >
              <Box>
                <TextField
                  fullWidth
                  label={t("admin.productName")}
                  {...register("name")}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              </Box>
              <Box>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={t("admin.description")}
                  {...register("description")}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label={t("products.price")}
                    type="number"
                    {...register("price")}
                    error={!!errors.price}
                    helperText={errors.price?.message}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label={t("products.stock")}
                    type="number"
                    {...register("stock")}
                    error={!!errors.stock}
                    helperText={errors.stock?.message}
                  />
                </Box>
              </Box>

              <Box>
                <FormControl fullWidth error={!!errors.category}>
                  <InputLabel sx={{ color: "#b0b0b0" }}>
                    {t("admin.category")}
                  </InputLabel>
                  <Select
                    label={t("admin.category")}
                    {...register("category")}
                    defaultValue={editingProduct?.category || CATEGORIES[0]}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          bgcolor: "#1e1e1e",
                          border: "1px solid #3a3a3a",
                          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
                        },
                      },
                    }}
                  >
                    {CATEGORIES.map((category) => (
                      <MenuItem
                        key={category}
                        value={category}
                        sx={{
                          bgcolor: "#1e1e1e",
                          color: "#b0b0b0",
                          fontSize: "0.875rem",
                          py: 1.5,
                          transition: "all 0.2s",
                          "&:hover": { bgcolor: "#1976d2", color: "#fff" },
                          "&.Mui-selected": {
                            bgcolor: "#1565c0",
                            color: "#fff",
                            fontWeight: "600",
                            "&:hover": { bgcolor: "#0d47a1" },
                          },
                        }}
                      >
                        {t(`categories.${category}`)}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.category && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.5, ml: 2 }}
                    >
                      {errors.category?.message}
                    </Typography>
                  )}
                </FormControl>
              </Box>

              {/* HSN No and GST % Section with Calculated Fields */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label="HSN No."
                    placeholder="e.g., 8517.62"
                    {...register("hsnNo")}
                    error={!!errors.hsnNo}
                    helperText={errors.hsnNo?.message}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label="GST %"
                    type="number"
                    inputProps={{ step: "0.01", min: "0", max: "100" }}
                    {...register("gstPercentage")}
                    error={!!errors.gstPercentage}
                    helperText={
                      errors.gstPercentage?.message ||
                      `${t("common.Optional")} (0-100)`
                    }
                  />
                </Box>
              </Box>

              {/* Tax Calculation Display (Read-Only) */}
              {editingProduct?.price && editingProduct?.gstPercentage ? (
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: "#1e1e1e",
                    border: "1px solid #3a3a3a",
                    borderRadius: "8px",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ color: "#ff9800", fontWeight: "600", mb: 1 }}
                  >
                    💰 Tax Calculation
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: 2,
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={{ color: "#707070" }}>
                        Base Price
                      </Typography>
                      <Typography sx={{ color: "#b0b0b0", fontWeight: "600" }}>
                        ₹
                        {(editingProduct?.price || 0).toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={{ color: "#707070" }}>
                        GST Amount ({editingProduct?.gstPercentage}%)
                      </Typography>
                      <Typography sx={{ color: "#4caf50", fontWeight: "600" }}>
                        ₹
                        {(
                          ((editingProduct?.price || 0) *
                            (editingProduct?.gstPercentage || 0)) /
                          100
                        ).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={{ color: "#707070" }}>
                        Final Price (incl. GST)
                      </Typography>
                      <Typography
                        sx={{
                          color: "#ff9800",
                          fontWeight: "700",
                          fontSize: "1.1rem",
                        }}
                      >
                        ₹
                        {(
                          (editingProduct?.price || 0) +
                          ((editingProduct?.price || 0) *
                            (editingProduct?.gstPercentage || 0)) /
                            100
                        ).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ) : null}

              <Box>
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ color: "#b0b0b0", fontWeight: "600" }}
                >
                  {t("admin.productImages")}
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<Upload />}
                    fullWidth
                    sx={{
                      color: "#1976d2",
                      borderColor: "#1976d2",
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: "rgba(25, 118, 210, 0.1)",
                        borderColor: "#42a5f5",
                        color: "#42a5f5",
                      },
                    }}
                  >
                    {t("admin.chooseImages")}
                    <input
                      type="file"
                      hidden
                      accept="*/*"
                      multiple
                      onChange={handleImageFileChange}
                    />
                  </Button>
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
                  {imagePreviews.map((preview, idx) => (
                    <Box
                      key={idx}
                      sx={{ position: "relative", display: "inline-block" }}
                    >
                      <Box
                        component="img"
                        src={preview}
                        alt={`Preview ${idx + 1}`}
                        sx={{
                          maxWidth: 120,
                          maxHeight: 120,
                          objectFit: "contain",
                          borderRadius: 1,
                          border: "1px solid #3a3a3a",
                        }}
                      />
                      {/* Primary Button */}
                      <IconButton
                        onClick={() => setPrimaryImageIdx(idx)}
                        sx={{
                          position: "absolute",
                          top: 6,
                          left: 6,
                          bgcolor:
                            primaryImageIdx === idx ? "warning.main" : "white",
                          color: primaryImageIdx === idx ? "white" : "grey.700",
                          boxShadow: 2,
                          "&:hover": { bgcolor: "warning.dark" },
                          zIndex: 2,
                        }}
                        size="small"
                        title={
                          primaryImageIdx === idx
                            ? t("admin.primary")
                            : t("admin.makePrimary")
                        }
                      >
                        <Star fontSize="small" />
                      </IconButton>
                      {/* Remove Button */}
                      <IconButton
                        onClick={() => handleRemoveImage(idx)}
                        sx={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          bgcolor: "rgba(255,255,255,0.85)",
                          color: "error.main",
                          boxShadow: 2,
                          "&:hover": { bgcolor: "error.main", color: "white" },
                          zIndex: 2,
                        }}
                        size="small"
                        title={t("admin.remove")}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Video Upload Section */}
              <Box>
                <Typography
                  variant="subtitle2"
                  gutterBottom
                  sx={{ color: "#b0b0b0", fontWeight: "600" }}
                >
                  {t("admin.productVideos")}
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<Upload />}
                    fullWidth
                    sx={{
                      color: "#1976d2",
                      borderColor: "#1976d2",
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: "rgba(25, 118, 210, 0.1)",
                        borderColor: "#42a5f5",
                        color: "#42a5f5",
                      },
                    }}
                  >
                    {t("admin.uploadVideos")}
                    <input
                      type="file"
                      hidden
                      accept="*/*"
                      multiple
                      onChange={handleVideoFileChange}
                    />
                  </Button>
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
                  {videoPreviews.map((preview, idx) => (
                    <Box
                      key={idx}
                      sx={{ position: "relative", display: "inline-block" }}
                    >
                      <Box
                        component="video"
                        src={preview}
                        controls
                        sx={{
                          maxWidth: 120,
                          maxHeight: 120,
                          borderRadius: 1,
                          border: "1px solid #3a3a3a",
                        }}
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          zIndex: 2,
                          fontSize: 10,
                          px: 1,
                          py: 0.2,
                        }}
                        onClick={() => handleRemoveVideo(idx)}
                      >
                        {t("admin.remove")}
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Colors Section */}
              <Box>
                <TextField
                  fullWidth
                  label={t("admin.colors")}
                  placeholder={t("admin.colorsPlaceholder")}
                  {...register("colors")}
                  error={!!errors.colors}
                  helperText={errors.colors?.message || t("admin.colorsHelper")}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions
            sx={{
              bgcolor: "#ffffff",
              borderTop: "1px solid #e0e0e0",
              p: 2,
              gap: 1,
            }}
          >
            <Button
              onClick={handleClose}
              sx={{
                color: "#b0b0b0",
                textTransform: "none",
                fontWeight: "500",
                "&:hover": { bgcolor: "rgba(176, 176, 176, 0.1)" },
              }}
            >
              {t("admin.cancel")}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isPending || updateMutation.isPending}
              sx={{
                bgcolor: "#1976d2",
                color: "#fff",
                textTransform: "none",
                fontWeight: "600",
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: "#1565c0",
                  boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                },
                "&:disabled": {
                  bgcolor: "#707070",
                  color: "#505050",
                },
              }}
            >
              {editingProduct ? t("admin.update") : t("admin.create")}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default AdminProducts;
