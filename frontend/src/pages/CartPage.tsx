import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { tokens } from "@/theme/theme";
import {
  Container,
  Typography,
  Box,
  Paper,
  IconButton,
  Divider,
  TextField,
  InputAdornment,
  Alert,
  Chip,
} from "@/mui/material";
import {
  ArrowForward,
  Delete,
  LocalOffer,
  ShoppingCartOutlined,
} from "@/mui/icons";
import QuantityInput from "../components/common/QuantityInput";
import { useCart } from "../context/CartContext";
import { useCoupon } from "../hooks/useCoupon";
import { appIconSx } from "@/components/ui/navigationStyles";
import { CustomButton } from "@/components/ui/CustomButton";

const CartPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, isLoading } = useCart();
  const {
    code: couponCode,
    error: couponError,
    promo: appliedCoupon,
    isValidatingPromo: isValidating,
    discount,
    setCode: setCouponCode,
    applyPromo,
    removePromo,
  } = useCoupon();

  const calculateSubtotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => {
      const price = item.product?.price || 0;
      return sum + price * item.quantity;
    }, 0);
  };

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    await updateQuantity(itemId, newQuantity);
  };

  const handleRemove = async (itemId: string) => {
    await removeFromCart(itemId);
  };

  if (isLoading) {
    return (
      <Container
        maxWidth={false}
        sx={{ maxWidth: tokens.appMaxWidth, py: 5, px: tokens.pagePaddingX }}
      >
        <Typography>{t("common.loading")}</Typography>
      </Container>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <Container
        maxWidth={false}
        sx={{
          maxWidth: tokens.appMaxWidth,
          py: { xs: 6, md: 9 },
          px: tokens.pagePaddingX,
          textAlign: "center",
        }}
      >
        <ShoppingCartOutlined
          sx={{ ...appIconSx.hero, color: tokens.accent, mb: 2 }}
        />
        <Typography variant="h5" gutterBottom>
          {t("cart.empty")}
        </Typography>
        <CustomButton
          variant="contained"
          appVariant="commerce"
          onClick={() => navigate("/products")}
          endIcon={<ArrowForward sx={appIconSx.lg} />}
          sx={{
            mt: 2,
            px: 3,
          }}
        >
          {t("cart.continueShopping")}
        </CustomButton>
      </Container>
    );
  }

  const subtotal = calculateSubtotal();
  const subtotalAfterDiscount = subtotal - discount;
  const shipping = subtotalAfterDiscount > 5000 ? 0 : 100;
  const total = subtotalAfterDiscount + shipping;

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
            {t("cart.title")}
          </Typography>
          <Typography sx={{ mt: 0.75, color: tokens.gray600 }}>
            {cart.items.length} item{cart.items.length === 1 ? "" : "s"} ready
            for checkout
          </Typography>
        </Box>
        <CustomButton
          variant="outlined"
          appVariant="secondary"
          onClick={() => navigate("/products")}
        >
          {t("cart.continueShopping")}
        </CustomButton>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 4,
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        <Box sx={{ flex: { md: 2 } }}>
          {cart.items.map((item) => (
            <Paper
              key={item.id}
              elevation={0}
              sx={{
                mb: 2,
                p: 0,
                overflow: "hidden",
                border: `1px solid ${tokens.gray200}`,
                borderRadius: `${tokens.radiusXl}px`,
                boxShadow: tokens.shadowSm,
                transition: "border-color 180ms ease, box-shadow 180ms ease",
                "&:hover": {
                  borderColor: tokens.gray300,
                  boxShadow: tokens.shadowMd,
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 3,
                  p: 2,
                }}
              >
                {/* Product Image */}
                <Box sx={{ width: { xs: "100%", sm: 180 }, flexShrink: 0 }}>
                  <Box
                    sx={{
                      width: "100%",
                      height: 180,
                      borderRadius: `${tokens.radiusLg}px`,
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: tokens.gray50,
                      border: `1px solid ${tokens.gray200}`,
                      cursor: "pointer",
                    }}
                    onClick={() => navigate(`/products/${item.product.id}`)}
                  >
                    <img
                      src={
                        (item.product.media &&
                          item.product.media.length > 0 &&
                          item.product.media[0].url) ||
                        "https://via.placeholder.com/180"
                      }
                      alt={item.product.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        padding: "8px",
                      }}
                    />
                  </Box>
                </Box>

                {/* Product Details */}
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
                        mb: 1,
                        color: tokens.gray900,
                        cursor: "pointer",
                        "&:hover": { color: tokens.primary },
                      }}
                      onClick={() => navigate(`/products/${item.product.id}`)}
                    >
                      {item.product.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        lineHeight: 1.5,
                      }}
                    >
                      {item.product.description}
                    </Typography>
                    <Typography
                      variant="h6"
                      color="primary"
                      sx={{ fontWeight: 700 }}
                    >
                      ₹{(item.product.price || 0).toLocaleString()}
                    </Typography>
                  </Box>

                  {/* Quantity and Remove */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      justifyContent: "space-between",
                      mt: 2,
                    }}
                  >
                    <QuantityInput
                      value={item.quantity}
                      min={1}
                      max={item.product.stock}
                      onChange={(q) => handleQuantityChange(item.id, q)}
                      disabled={isLoading}
                    />
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "text.secondary" }}
                    >
                      ₹
                      {(
                        (item.product.price || 0) * item.quantity
                      ).toLocaleString()}
                    </Typography>
                    <IconButton
                      onClick={() => handleRemove(item.id)}
                      sx={{
                        ml: "auto",
                        color: tokens.error,
                        border: `1px solid ${tokens.errorLight}`,
                        bgcolor: tokens.errorLight,
                        "&:hover": { bgcolor: "#fecaca" },
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                  {/* Low stock warning */}
                  {item.product.stock <= 5 && item.product.stock > 0 && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: tokens.error,
                        fontWeight: 600,
                        mt: 0.5,
                        display: "block",
                      }}
                    >
                      {t("common.onlyXLeft", { count: item.product.stock })}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Order Summary */}
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
              sx={{ fontWeight: 700, color: "text.primary", mb: 2.5 }}
            >
              {t("checkout.orderSummary")}
            </Typography>
            <Divider sx={{ my: 2.5 }} />

            {/* Price Breakdown */}
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
              {discount > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1.5,
                    alignItems: "center",
                  }}
                >
                  <Typography sx={{ color: tokens.success, fontWeight: 500 }}>
                    {t("checkout.discount")}
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: tokens.success,
                    }}
                  >
                    -₹{discount.toLocaleString()}
                  </Typography>
                </Box>
              )}
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
                <Typography
                  sx={{
                    fontWeight: 600,
                    color: shipping === 0 ? tokens.success : "text.primary",
                  }}
                >
                  {shipping === 0 ? (
                    <Box component="span" sx={{ color: tokens.success }}>
                      {t("common.freeShippingLabel")}
                    </Box>
                  ) : (
                    `₹${shipping}`
                  )}
                </Typography>
              </Box>
            </Box>
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

            {/* Coupon Code */}
            <Box sx={{ mb: 2.5 }}>
              {!appliedCoupon ? (
                <>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: "text.primary", mb: 1 }}
                  >
                    {t("common.applyCoupon")}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                    <TextField
                      size="small"
                      placeholder={t("common.couponPlaceholder")}
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      fullWidth
                      disabled={isValidating}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocalOffer
                              sx={{ ...appIconSx.md, color: tokens.gray400 }}
                            />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": { borderRadius: 2 },
                      }}
                    />
                    <CustomButton
                      variant="outlined"
                      appVariant="primary"
                      onClick={() => applyPromo(subtotal)}
                      disabled={!couponCode.trim() || isValidating}
                      sx={{
                        minWidth: 80,
                        borderRadius: 2,
                      }}
                    >
                      {isValidating ? "..." : t("common.apply")}
                    </CustomButton>
                  </Box>
                  {couponError && (
                    <Alert severity="error" sx={{ py: 0.5, px: 1, mb: 1 }}>
                      {couponError}
                    </Alert>
                  )}
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    Coupon will be carried to checkout
                  </Typography>
                </>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    p: 1.25,
                    bgcolor: "#e8f5e9",
                    borderRadius: 1,
                    border: "1px solid #4caf50",
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
                        label={appliedCoupon?.code}
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
                        -₹{discount.toLocaleString()}
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
              )}
            </Box>
            <Divider sx={{ mb: 2.5 }} />

            {/* Checkout Button */}
            <CustomButton
              fullWidth
              variant="contained"
              appVariant="commerce"
              size="large"
              onClick={() => navigate("/checkout")}
              endIcon={<ArrowForward />}
              sx={{
                mb: 2,
                py: 1.5,
              }}
            >
              {t("cart.proceedToCheckout")}
            </CustomButton>

            {/* Continue Shopping Button */}
            <CustomButton
              fullWidth
              variant="outlined"
              appVariant="secondary"
              onClick={() => navigate("/products")}
              sx={{
                py: 1.3,
              }}
            >
              {t("cart.continueShopping")}
            </CustomButton>

            {/* Trust Signals */}
            <Box sx={{ mt: 3.5, pt: 2.5, borderTop: "1px solid #eee" }}>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                  letterSpacing: "0.5px",
                  display: "block",
                  mb: 2,
                }}
              >
                {t("common.whyShopWithUs")}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Typography sx={{ fontSize: "1.1rem" }}>🚚</Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", fontSize: "0.85rem" }}
                  >
                    {t("common.fastAndFreeShipping")}{" "}
                    {subtotal > 500 ? "✓" : t("common.aboveAmount")}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Typography sx={{ fontSize: "1.1rem" }}>🔒</Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", fontSize: "0.85rem" }}
                  >
                    {t("common.securePayment")} SSL{" "}
                    {t("common.sslEncrypted").split("and")[0]}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Typography sx={{ fontSize: "1.1rem" }}>↩️</Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", fontSize: "0.85rem" }}
                  >
                    {t("common.easySevenDayReturns")}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default CartPage;
