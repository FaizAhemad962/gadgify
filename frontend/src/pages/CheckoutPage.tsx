import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Divider,
  Alert,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@/mui/material";
import {
  ArrowForward,
  CreditCard,
  LocalOffer,
  LocationOn,
  ShoppingBag,
} from "@/mui/icons";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { tokens } from "@/theme/theme";
import { ErrorHandler } from "../utils/errorHandler";
import loadRazorpay from "@/utils/loadRazorpay";
import { ordersApi } from "../api/orders";
import { addressesApi, type Address } from "../api/addresses";
import { useCoupon } from "../hooks/useCoupon";
import {
  invalidateAddressData,
  invalidateCartData,
  invalidateOrderData,
} from "@/lib/queryInvalidation";
import { queryKeys } from "@/lib/queryKeys";
import { appIconSx } from "@/components/ui/navigationStyles";
import { CustomButton } from "@/components/ui/CustomButton";

const shippingSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Valid 6-digit pincode required"),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

const checkoutInputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: `${tokens.radiusMd}px`,
    backgroundColor: tokens.gray50,
    "&:hover fieldset": {
      borderColor: tokens.primary,
    },
    "&.Mui-focused": {
      backgroundColor: tokens.white,
    },
  },
};

const CheckoutPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const [error, setError] = useState("");
  const {
    code: couponCode,
    error: couponError,
    promo: appliedCoupon,
    isValidatingPromo: isValidatingCoupon,
    discount,
    setCode: setCouponCode,
    setError: setCouponError,
    applyPromo,
    removePromo,
  } = useCoupon();
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  const { data: savedAddresses = [] } = useQuery({
    queryKey: queryKeys.addresses.all,
    queryFn: addressesApi.getAll,
  });

  useEffect(() => {
    if (selectedAddressId) return;

    const defaultAddr = savedAddresses.find((a: Address) => a.isDefault);
    const nextAddressId = defaultAddr?.id || "new";
    const timer = window.setTimeout(() => {
      setSelectedAddressId(nextAddressId);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [savedAddresses, selectedAddressId]);

  const selectedSavedAddress = savedAddresses.find(
    (a: Address) => a.id === selectedAddressId,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
      city: user?.city || "",
      state: user?.state || t("states.maharashtra"),
      pincode: user?.pincode || "",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: ordersApi.create,
    onSuccess: async (order) => {
      invalidateOrderData(queryClient, order.id);
      invalidateAddressData(queryClient);
      // Create Razorpay payment
      try {
        const paymentData = await ordersApi.createPaymentIntent(order.id);

        const options = {
          key: paymentData.keyId,
          amount: paymentData.amount,
          currency: paymentData.currency,
          name: "Gadgify",
          description: "Complete your secure payment",
          order_id: paymentData.razorpayOrderId,
          handler: async function (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) {
            try {
              await ordersApi.confirmPayment(order.id, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              invalidateOrderData(queryClient, order.id);
              invalidateCartData(queryClient);
              clearCart();
              navigate(`/orders/${order.id}`);
            } catch (err) {
              const message = ErrorHandler.getUserFriendlyMessage(
                err,
                t("errors.paymentVerificationFailed"),
              );
              setError(message);
              ErrorHandler.logError("Payment verification failed", err);
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: user?.phone,
          },
          theme: {
            color: tokens.primary,
          },
        };

        try {
          await loadRazorpay();
        } catch {
          setError(t("errors.failedToInitiatePayment"));
          return;
        }

        const razorpay = new (
          window as unknown as {
            Razorpay: new (options: Record<string, unknown>) => {
              on: (event: string, handler: () => void) => void;
              open: () => void;
            };
          }
        ).Razorpay(options);
        razorpay.on("payment.failed", function () {
          setError(t("errors.paymentFailed"));
        });
        razorpay.open();
      } catch (err) {
        const message = ErrorHandler.getUserFriendlyMessage(
          err,
          t("errors.failedToInitiatePayment"),
        );
        setError(message);
        ErrorHandler.logError("Payment initiation failed", err);
      }
    },
    onError: (error: Error) => {
      const message = ErrorHandler.getUserFriendlyMessage(
        error,
        t("errors.somethingWrong"),
      );
      setError(message);
      ErrorHandler.logError("Order creation failed", error);
    },
  });

  const calculateSubtotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );
  };

  const calculateShipping = () => {
    // Fixed shipping rate of ₹50
    return 50;
  };

  const handleApplyCoupon = async () => {
    await applyPromo(calculateSubtotal());
  };

  const onSubmit = async (data: ShippingFormData) => {
    // Determine shipping address — saved or form
    const shippingAddress = selectedSavedAddress
      ? {
          name: selectedSavedAddress.name,
          phone: selectedSavedAddress.phone,
          address: selectedSavedAddress.address,
          city: selectedSavedAddress.city,
          state: selectedSavedAddress.state,
          pincode: selectedSavedAddress.pincode,
        }
      : data;

    // Check Maharashtra restriction
    if (shippingAddress.state.toLowerCase() !== "maharashtra") {
      setError(t("errors.maharashtraOnly"));
      return;
    }

    if (!cart?.items || cart.items.length === 0) {
      setError("Cart is empty");
      return;
    }

    const subtotal = calculateSubtotal();
    const shipping = calculateShipping();
    const total = subtotal + shipping;

    const orderData = {
      items: cart.items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      })),
      subtotal,
      shipping,
      total: total - discount,
      couponCode: appliedCoupon?.code || undefined,
      shippingAddress,
    };

    createOrderMutation.mutate(orderData);
  };

  if (!cart?.items || cart.items.length === 0) {
    navigate("/cart");
    return null;
  }

  const subtotal = calculateSubtotal();
  const shipping = calculateShipping();
  const total = subtotal + shipping - discount;

  return (
    <Container
      maxWidth={false}
      sx={{
        maxWidth: tokens.appMaxWidth,
        py: { xs: 3, md: 5 },
        px: tokens.pagePaddingX,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h3"
            sx={{ fontWeight: 900, color: tokens.gray900 }}
          >
            {t("checkout.title")}
          </Typography>
          <Typography sx={{ mt: 0.75, color: tokens.gray600 }}>
            Review delivery details and complete secure payment.
          </Typography>
        </Box>
        <CustomButton
          variant="outlined"
          appVariant="secondary"
          onClick={() => navigate("/cart")}
        >
          {t("cart.title")}
        </CustomButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
          }}
        >
          {/* Shipping Form */}
          <Box sx={{ flex: { md: 2 } }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 4 },
                border: `1px solid ${tokens.gray200}`,
                borderRadius: `${tokens.radiusXl}px`,
                boxShadow: tokens.shadowSm,
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: 700, mb: 3, color: "text.primary" }}
              >
                <LocationOn
                  sx={{ mr: 1, color: tokens.accent, verticalAlign: "middle" }}
                />
                {t("checkout.shippingAddress")}
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {/* Saved Address Selection */}
              {savedAddresses.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, mb: 1.5, color: "text.secondary" }}
                  >
                    {t("address.savedAddresses", "Saved Addresses")}
                  </Typography>
                  <RadioGroup
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                  >
                    {savedAddresses.map((addr: Address) => (
                      <Paper
                        key={addr.id}
                        elevation={0}
                        sx={{
                          p: 1.75,
                          mb: 1,
                          cursor: "pointer",
                          borderColor:
                            selectedAddressId === addr.id
                              ? tokens.accent
                              : tokens.gray200,
                          borderStyle: "solid",
                          borderWidth: selectedAddressId === addr.id ? 2 : 1,
                          borderRadius: `${tokens.radiusLg}px`,
                          bgcolor:
                            selectedAddressId === addr.id
                              ? `${tokens.accent}0F`
                              : tokens.white,
                          transition:
                            "border-color 160ms ease, background-color 160ms ease",
                        }}
                        onClick={() => setSelectedAddressId(addr.id)}
                      >
                        <FormControlLabel
                          value={addr.id}
                          control={<Radio size="small" />}
                          label={
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {addr.label}
                                {addr.isDefault && (
                                  <Chip
                                    label={t("address.default", "Default")}
                                    size="small"
                                    color="primary"
                                    sx={{
                                      ml: 1,
                                      height: 20,
                                      fontSize: "0.7rem",
                                    }}
                                  />
                                )}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {addr.name} · {addr.phone}
                              </Typography>
                              <Typography
                                variant="caption"
                                display="block"
                                color="text.secondary"
                              >
                                {addr.address}, {addr.city}, {addr.state} -{" "}
                                {addr.pincode}
                              </Typography>
                            </Box>
                          }
                          sx={{ alignItems: "flex-start", m: 0, width: "100%" }}
                        />
                      </Paper>
                    ))}
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.75,
                        cursor: "pointer",
                        borderColor:
                          selectedAddressId === "new"
                            ? tokens.accent
                            : tokens.gray200,
                        borderStyle: "solid",
                        borderWidth: selectedAddressId === "new" ? 2 : 1,
                        borderRadius: `${tokens.radiusLg}px`,
                        bgcolor:
                          selectedAddressId === "new"
                            ? `${tokens.accent}0F`
                            : tokens.white,
                      }}
                      onClick={() => setSelectedAddressId("new")}
                    >
                      <FormControlLabel
                        value="new"
                        control={<Radio size="small" />}
                        label={
                          <Typography variant="body2" fontWeight={600}>
                            {t("address.useNewAddress", "Use a new address")}
                          </Typography>
                        }
                        sx={{ m: 0 }}
                      />
                    </Paper>
                  </RadioGroup>
                </Box>
              )}

              {/* Manual Address Form (shown when "new" selected or no saved addresses) */}
              {(selectedAddressId === "new" || savedAddresses.length === 0) && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2.5 }}>
                  <Box
                    sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 6px)" } }}
                  >
                    <TextField
                      fullWidth
                      label={t("auth.name")}
                      {...register("name")}
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      variant="outlined"
                      size="small"
                      sx={checkoutInputSx}
                    />
                  </Box>
                  <Box
                    sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 6px)" } }}
                  >
                    <TextField
                      fullWidth
                      label={t("auth.phone")}
                      {...register("phone")}
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                      variant="outlined"
                      size="small"
                      sx={checkoutInputSx}
                    />
                  </Box>
                  <Box sx={{ flex: "1 1 100%" }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label={t("auth.address")}
                      {...register("address")}
                      error={!!errors.address}
                      helperText={errors.address?.message}
                      variant="outlined"
                      size="small"
                      sx={checkoutInputSx}
                    />
                  </Box>
                  <Box
                    sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 6px)" } }}
                  >
                    <TextField
                      fullWidth
                      label={t("auth.city")}
                      {...register("city")}
                      error={!!errors.city}
                      helperText={errors.city?.message}
                      variant="outlined"
                      size="small"
                      sx={checkoutInputSx}
                    />
                  </Box>
                  <Box
                    sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 6px)" } }}
                  >
                    <TextField
                      fullWidth
                      label={t("auth.state")}
                      {...register("state")}
                      error={!!errors.state}
                      helperText={
                        errors.state?.message || t("common.mustBeMaharashtra")
                      }
                      variant="outlined"
                      size="small"
                      InputProps={{
                        readOnly: true,
                      }}
                      sx={checkoutInputSx}
                    />
                  </Box>
                  <Box
                    sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 6px)" } }}
                  >
                    <TextField
                      fullWidth
                      label={t("auth.pincode")}
                      {...register("pincode")}
                      error={!!errors.pincode}
                      helperText={errors.pincode?.message}
                      variant="outlined"
                      size="small"
                      sx={checkoutInputSx}
                    />
                  </Box>
                </Box>
              )}
            </Paper>
          </Box>

          {/* Order Summary & Payment */}
          <Box sx={{ flex: { md: 1 } }}>
            <Paper
              elevation={0}
              sx={{
                p: 3.5,
                position: "sticky",
                top: tokens.filterStickyTop,
                border: `1px solid ${tokens.gray200}`,
                borderRadius: `${tokens.radiusXl}px`,
                boxShadow: tokens.shadowMd,
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: 700, mb: 2.5, color: "text.primary" }}
              >
                <ShoppingBag
                  sx={{ mr: 1, color: tokens.accent, verticalAlign: "middle" }}
                />
                {t("checkout.orderSummary")}
              </Typography>
              <Divider sx={{ mb: 2.5 }} />

              {/* Cart Items */}
              <Box sx={{ maxHeight: 300, overflowY: "auto", mb: 2.5 }}>
                {cart.items.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      mb: 1.5,
                      p: 1.5,
                      border: `1px solid ${tokens.gray200}`,
                      borderRadius: `${tokens.radiusLg}px`,
                      bgcolor: tokens.gray50,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        gap: 2,
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: "text.primary",
                            mb: 0.5,
                          }}
                        >
                          {item.product.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary" }}
                        >
                          Qty: {item.quantity} × ₹
                          {item.product?.price?.toLocaleString()}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: "text.primary",
                          whiteSpace: "nowrap",
                        }}
                      >
                        ₹{(item.product.price * item.quantity).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: 2.5 }} />

              {/* Price Details */}
              <Box sx={{ mb: 2.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1.5,
                    alignItems: "center",
                  }}
                >
                  <Typography sx={{ color: "text.secondary", fontWeight: 500 }}>
                    {t("cart.subtotal")}
                  </Typography>
                  <Typography sx={{ fontWeight: 600, color: "text.primary" }}>
                    ₹{subtotal.toLocaleString()}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography sx={{ color: "text.secondary", fontWeight: 500 }}>
                    {t("checkout.shipping")}
                  </Typography>
                  <Typography sx={{ fontWeight: 600, color: "text.primary" }}>
                    ₹{shipping.toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              {/* Coupon Code Input */}
              <Box sx={{ mb: 2.5 }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 1, color: "text.primary" }}
                >
                  <LocalOffer
                    sx={{ ...appIconSx.md, mr: 0.75, color: tokens.accent }}
                  />
                  {t("checkout.applyCoupon")}
                </Typography>
                {appliedCoupon ? (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      p: 1.25,
                      bgcolor: tokens.successLight,
                      borderRadius: `${tokens.radiusMd}px`,
                      border: `1px solid ${tokens.success}`,
                      gap: 1,
                    }}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 0.5,
                          flexWrap: "wrap",
                        }}
                      >
                        <Chip
                          label={appliedCoupon.code}
                          color="success"
                          size="small"
                          sx={{ fontWeight: 700, flexShrink: 0 }}
                        />
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{
                            color: "success.main",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                          }}
                        >
                          -₹{appliedCoupon.discount.toLocaleString()}
                        </Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "success.main",
                          display: "block",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {t("common.couponApplied")}
                      </Typography>
                    </Box>
                    <CustomButton
                      size="small"
                      appVariant="danger"
                      onClick={removePromo}
                      sx={{
                        minWidth: "auto",
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t("common.remove")}
                    </CustomButton>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      size="small"
                      placeholder={t("checkout.couponPlaceholder")}
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        setCouponError("");
                      }}
                      error={!!couponError}
                      helperText={couponError}
                      sx={{ flex: 1 }}
                      InputProps={{
                        startAdornment: (
                          <LocalOffer
                            sx={{
                              ...appIconSx.md,
                              mr: 1,
                              color: tokens.gray400,
                            }}
                          />
                        ),
                      }}
                      slotProps={{
                        input: {
                          sx: { textTransform: "uppercase" },
                        },
                      }}
                    />
                    <CustomButton
                      variant="outlined"
                      appVariant="primary"
                      size="small"
                      onClick={handleApplyCoupon}
                      disabled={isValidatingCoupon || !couponCode.trim()}
                      sx={{
                        minWidth: 80,
                      }}
                    >
                      {isValidatingCoupon ? "..." : t("common.apply")}
                    </CustomButton>
                  </Box>
                )}
              </Box>

              {/* Discount row */}
              {discount > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1.5,
                    alignItems: "center",
                  }}
                >
                  <Typography sx={{ color: "success.main", fontWeight: 500 }}>
                    {t("checkout.discount")}
                  </Typography>
                  <Typography sx={{ fontWeight: 600, color: "success.main" }}>
                    -₹{discount.toLocaleString()}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2.5 }} />

              {/* Total */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 3.5,
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "text.primary" }}
                >
                  {t("cart.total")}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "primary" }}
                >
                  ₹{total.toLocaleString()}
                </Typography>
              </Box>

              {/* Payment Method Info */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: tokens.infoLight,
                  borderLeft: `4px solid ${tokens.primary}`,
                  borderRadius: `${tokens.radiusMd}px`,
                  mb: 3,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: tokens.primary,
                    display: "block",
                    mb: 0.5,
                  }}
                >
                  <CreditCard
                    sx={{ ...appIconSx.md, mr: 0.75, verticalAlign: "middle" }}
                  />
                  {t("checkout.paymentMethod")}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", fontSize: "0.85rem" }}
                >
                  {t("checkout.paymentMethodInfo")}
                </Typography>
              </Box>

              {/* Place Order Button */}
              <CustomButton
                fullWidth
                variant="contained"
                appVariant="commerce"
                size="large"
                type="submit"
                disabled={createOrderMutation.isPending}
                endIcon={
                  !createOrderMutation.isPending ? <ArrowForward /> : null
                }
                sx={{
                  mb: 2,
                  py: 1.5,
                }}
              >
                {createOrderMutation.isPending
                  ? t("common.processingPayment")
                  : t("common.completeOrderAndPay")}
              </CustomButton>

              {/* Security Info */}
              <Box
                sx={{
                  textAlign: "center",
                  pt: 2,
                  borderTop: `1px solid ${tokens.gray200}`,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontSize: "0.8rem" }}
                >
                  {t("common.sslSecured")} • {t("common.encryptedPayment")}
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>
      </form>
    </Container>
  );
};

export default CheckoutPage;
